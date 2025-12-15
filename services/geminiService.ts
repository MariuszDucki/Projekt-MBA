
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration, Tool, Content } from "@google/genai";
import { INTERNAL_KNOWLEDGE_BASE, SYSTEM_INSTRUCTION } from "../constants";
import { KnowledgeDoc, Ticket, Message, MessageRole, WidgetData, QuizData } from "../types";
import { scrubPII, detectPromptInjection, logAudit } from "./securityService";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;
let runtimeKnowledgeBase: KnowledgeDoc[] = [...INTERNAL_KNOWLEDGE_BASE];
let runtimeTickets: Ticket[] = []; 
// Mock storage for queries that need expert review
let missingKnowledgeLog: string[] = [];

const SESSION_STORAGE_KEY = 'delos_chat_session_ltm';

// --- VECTOR SEARCH ENGINE (SEMANTIC) ---

// Mock embeddings cache to avoid API costs on static data for this demo
const docEmbeddingsCache: Map<string, number[]> = new Map();

// Calculate Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

const findRelevantDocumentsLegacy = (query: string): KnowledgeDoc[] => {
    const STOP_WORDS = ['czy', 'jak', 'co', 'kiedy', 'gdzie', 'dlaczego', 'ile', 'w', 'z', 'na', 'proszę', 'o', 'dla'];
    const queryTokens = query.toLowerCase().replace(/[.,?!;:"()]/g, '').split(/\s+/).filter(token => token.length > 2 && !STOP_WORDS.includes(token));
    
    if (queryTokens.length === 0) return [];

    const scoredDocs = runtimeKnowledgeBase.map(doc => {
        let score = 0;
        const contentLower = (doc.title + " " + doc.content).toLowerCase();
        
        // Boost for category match
        if (doc.category.toLowerCase().includes(query.toLowerCase())) score += 5;

        queryTokens.forEach(token => {
            if (contentLower.includes(token)) {
                score += 1;
                // Higher weight for title matches
                if (doc.title.toLowerCase().includes(token)) score += 5;
                // Higher weight for exact phrase matches
                if (contentLower.includes(token)) score += 2;
            }
        });
        return { doc, score };
    });
    
    // Higher threshold to ensure relevance
    return scoredDocs.filter(item => item.score > 1).sort((a, b) => b.score - a.score).map(item => item.doc);
};

// --- CORE CHAT LOGIC ---

export const initChat = async (history: Message[]) => {
  console.log(`[SYSTEM] Initializing Training Assistant Core...`);
  const ai = getAIClient();
  let validHistory: Content[] = [];
  const chatHistory = history.filter(m => m.role !== MessageRole.SYSTEM);
  const firstUserIndex = chatHistory.findIndex(m => m.role === MessageRole.USER);
  
  if (firstUserIndex !== -1) {
      const cleanHistory = chatHistory.slice(firstUserIndex);
      validHistory = cleanHistory.map(msg => ({
          role: msg.role === MessageRole.USER ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));
  }

  const createTicketTool: FunctionDeclaration = {
    name: 'create_ticket',
    description: 'Utwórz zgłoszenie dla eksperta/serwisu, gdy użytkownik zgłasza problem lub lukę w wiedzy.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING },
        description: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }
      },
      required: ['location', 'description', 'priority']
    }
  };
  
  // NEW: Tool to generate quizzes for training
  const generateQuizTool: FunctionDeclaration = {
    name: 'generate_quiz',
    description: 'Wygeneruj krótki quiz sprawdzający wiedzę na podstawie ostatniego tematu.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ['EASY', 'HARD'] }
      },
      required: ['topic']
    }
  };

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: validHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1, // Very low temperature for strict adherence to facts
      tools: [
          { functionDeclarations: [createTicketTool, generateQuizTool] }
          // Google Search REMOVED to enforce Closed System
      ], 
    },
  });
};

export const sendMessageToGemini = async (userQuery: string, imageBase64?: string): Promise<{ text: string, sources: string[], createdTicket?: Ticket, mediaPayload?: { urls: string[], type: 'image' | 'video' }, widget?: WidgetData, isClarification?: boolean }> => {
  
  // 1. SAFETY FILTER & PII SCRUBBING
  const injectionDetected = detectPromptInjection(userQuery);
  if (injectionDetected) {
      logAudit('GUARDRAIL', 'SECURITY_BLOCK', 'Prompt Injection Detected', 'BLOCKED');
      return { 
          text: "⚠️ NARUSZENIE PROTOKOŁU: Wykryto próbę manipulacji systemem. Incydent został zalogowany.", 
          sources: [] 
      };
  }

  const { cleanText, redacted } = scrubPII(userQuery);
  if (redacted) {
      logAudit('GUARDRAIL', 'QUERY', 'PII Data Redacted from User Query', 'WARNING');
  } else {
      logAudit('USER', 'QUERY', 'User Input Received', 'SUCCESS');
  }

  if (!chatSession) await initChat([]);

  // 2. RAG RETRIEVAL (STRICT MODE)
  let relevantDocs: KnowledgeDoc[] = [];
  let displaySources: string[] = [];
  let contextString = "";
  
  // Simple heuristic: if query is extremely short (e.g. "hi"), ignore RAG
  if (cleanText.length > 2) {
      relevantDocs = findRelevantDocumentsLegacy(cleanText);
  }

  // --- CLOSED SYSTEM ENFORCEMENT & EXCEPTIONS ---
  // Expanded logic: Allow greeting AND identity questions to pass through without documents.
  const isMetaQuery = /^(hej|cześć|dzień dobry|witaj|pomoc|menu|start|kim jesteś|co potrafisz|co robisz|funkcje|możliwości|w czym pomagasz|dlaczego tu jesteś|cel)/i.test(cleanText.trim());
  
  // CONTEXT AWARENESS CHECK: Do we have history?
  const hasHistory = chatSession && (await chatSession.getHistory()).length > 1;

  // BLOCK ONLY IF: No docs AND Not a Meta Query AND No Chat History (to allow follow-ups)
  if (relevantDocs.length === 0 && !isMetaQuery && !imageBase64 && !hasHistory) {
       logAudit('SYSTEM', 'KNOWLEDGE_GAP', `No internal data for: ${cleanText}`, 'BLOCKED');
       return {
           text: "⚠️ ODMOWA DOSTĘPU: Brak informacji w Bazie Wiedzy (MEMORY CORE) na ten temat. Moje protokoły zabraniają korzystania z wiedzy zewnętrznej lub spekulowania.",
           sources: []
       };
  }
  // ---------------------------------

  if (relevantDocs.length > 0) {
      displaySources = relevantDocs.map(d => d.title);
      contextString = relevantDocs.map(doc => {
         const hasMedia = !!doc.mediaUrl || (doc.attachedImages && doc.attachedImages.length > 0);
         const mediaFlag = hasMedia ? '[MEDIA_ATTACHMENT_AVAILABLE]' : '';
         return `--- DOKUMENT WEWNĘTRZNY (ID: ${doc.id}) ---\nTYTUŁ: ${doc.title}\nKATEGORIA: ${doc.category}\n${mediaFlag}\nTREŚĆ: ${doc.content}\n`;
      }).join('\n');
  } 

  // Media Extraction Logic
  let attachedMedia: { urls: string[], type: 'image' | 'video' } | undefined = undefined;
  const docWithMedia = relevantDocs.find(doc => !!doc.mediaUrl || (doc.attachedImages && doc.attachedImages.length > 0));
  if (docWithMedia) {
      let images: string[] = [];
      if (docWithMedia.attachedImages && docWithMedia.attachedImages.length > 0) images = [...docWithMedia.attachedImages];
      if (docWithMedia.mediaUrl) images.push(docWithMedia.mediaUrl);
      if (images.length > 0) attachedMedia = { urls: images, type: docWithMedia.mediaType || 'image' };
  }

  try {
    if(!chatSession) throw new Error("Chat session init failed");

    let fullPrompt = "";
    if (imageBase64) {
        fullPrompt = `[SYSTEM]: Analyzing User Image.\nCONTEXT FROM MEMORY:\n${contextString}\n\nUSER QUERY:\n${cleanText}`;
    } else {
        const historyInstruction = hasHistory 
            ? "UWAGA: To może być pytanie kontynuacyjne (follow-up). Sprawdź HISTORIĘ ROZMOWY. Jeśli użytkownik pyta o 'to' lub 'tamto', odnieś się do poprzednich tematów." 
            : "";
            
        fullPrompt = `CONTEXT (INTERNAL DATABASE ONLY):\n${contextString}\n\nUSER QUERY:\n${cleanText}\n\nINSTRUCTION: Używaj TYLKO powyższego CONTEXT. Jeśli kontekst jest pusty, ${historyInstruction} Jeśli nadal nie wiesz, odmów odpowiedzi (chyba że pytanie dotyczy Twojej tożsamości).`;
    }

    let response: GenerateContentResponse;

    if (imageBase64) {
        const imagePart = { inlineData: { mimeType: "image/jpeg", data: imageBase64 } };
        response = await chatSession.sendMessage({ message: [{ text: fullPrompt }, imagePart] } as any);
    } else {
        response = await chatSession.sendMessage({ message: fullPrompt });
    }

    let createdTicket: Ticket | undefined;
    let widget: WidgetData | undefined = undefined;

    const functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
            logAudit('SYSTEM', 'TOOL_EXECUTION', `Tool Call: ${call.name}`, 'SUCCESS');
            
            if (call.name === 'create_ticket') {
                const args = call.args as any;
                const newTicket: Ticket = {
                    id: `REQ-${Date.now().toString().slice(-6)}`,
                    location: args.location || "System",
                    description: args.description,
                    priority: args.priority,
                    status: 'OPEN',
                    timestamp: new Date().toISOString()
                };
                runtimeTickets.unshift(newTicket);
                createdTicket = newTicket;
                
                await chatSession.sendMessage({
                    message: [{
                        functionResponse: {
                            name: call.name,
                            response: { result: `Ticket created ID: ${newTicket.id}` }
                        }
                    }]
                });
            }
            
            if (call.name === 'generate_quiz') {
                const topic = (call.args as any).topic || "Wiedza Ogólna";
                // Generate quiz content based on the docs we found
                const quizContext = relevantDocs.length > 0 ? relevantDocs[0].content : "Ogólne zasady BHP";
                
                widget = {
                    type: 'quiz',
                    title: `QUIZ WIEDZY: ${topic.toUpperCase()}`,
                    data: {
                        question: `Pytanie kontrolne dotyczące: ${topic}. Co jest najważniejsze?`,
                        options: [
                             { id: 'a', text: 'Zgodność z procedurą (Odpowiedź Prawidłowa)', isCorrect: true },
                             { id: 'b', text: 'Szybkość działania', isCorrect: false },
                             { id: 'c', text: 'Improwizacja', isCorrect: false }
                        ],
                        explanation: `Opiera się na dokumencie: ${relevantDocs[0]?.id || 'Baza Wiedzy'}`
                    } as QuizData
                };
                
                await chatSession.sendMessage({
                    message: [{
                        functionResponse: {
                            name: call.name,
                            response: { result: "Quiz generated successfully." }
                        }
                    }]
                });
            }
        }
    }

    let responseText = response.text || "";
    
    // DETECT CLARIFICATION REQUEST
    let isClarification = false;
    if (responseText.includes("[PYTANIE_DOPRECYZOWUJĄCE]")) {
        isClarification = true;
        responseText = responseText.replace("[PYTANIE_DOPRECYZOWUJĄCE]", "").trim();
    }
    
    logAudit('SYSTEM', 'RESPONSE', 'Response generated from Memory Core', 'SUCCESS');

    // GenUI Logic (Checklist/Telemetry detection)
    const lowerText = responseText.toLowerCase();

    if (!widget && ((responseText.includes("1. ") && responseText.includes("2. ")) || lowerText.includes("krok"))) {
        const steps = responseText.split('\n').filter(line => /^\d+\./.test(line.trim())).map(line => line.replace(/^\d+\.\s*/, '').trim());
        if (steps.length >= 2) widget = { type: 'checklist', title: 'LISTA KROKÓW (SOP)', data: steps };
    }
    
    return {
      text: responseText,
      sources: [...new Set(displaySources)], 
      createdTicket: createdTicket,
      mediaPayload: attachedMedia,
      widget: widget,
      isClarification: isClarification
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    logAudit('SYSTEM', 'RESPONSE', `API Error: ${error.message}`, 'BLOCKED');
    return {
      text: "⚠️ Przepraszam, wystąpił problem techniczny. Proszę spróbować ponownie.",
      sources: displaySources, 
      mediaPayload: attachedMedia 
    };
  }
};

export const getRuntimeKnowledgeBase = (): KnowledgeDoc[] => runtimeKnowledgeBase;
export const getRuntimeTickets = (): Ticket[] => runtimeTickets;
export const addDocumentToKnowledgeBase = (doc: KnowledgeDoc) => { runtimeKnowledgeBase = [doc, ...runtimeKnowledgeBase]; };
export const removeDocumentFromKnowledgeBase = (id: string) => { runtimeKnowledgeBase = runtimeKnowledgeBase.filter(doc => doc.id !== id); };
// Clears chat session logic completely
export const clearChatHistory = () => { chatSession = null; sessionStorage.removeItem(SESSION_STORAGE_KEY); };
export const saveChatHistory = (messages: Message[]) => { try { sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages)); } catch (e) {} };
export const loadChatHistory = (): Message[] => { try { const saved = sessionStorage.getItem(SESSION_STORAGE_KEY); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } };

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}

export const generateVoiceAudio = async (text: string): Promise<ArrayBuffer | null> => {
  try {
    const ai = getAIClient();
    const cleanText = text.replace(/https?:\/\/[^\s]+/g, 'link').replace(/\[.*?\]/g, '').replace(/[*#_`~]/g, '').replace(/\n+/g, '. ').trim();
    if (!cleanText) return null;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    return decodeBase64(base64Audio).buffer;
  } catch (error) { return null; }
};

export const analyzeMediaContent = async (base64Data: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: "Analyze this image for technical details useful for training." }] }
        });
        return response.text || "No description generated.";
    } catch (e) { return "Media analysis unavailable."; }
};

export const submitMessageFeedback = (messageId: string, isPositive: boolean) => {
    logAudit('USER', 'USER_FEEDBACK', `Feedback for message ${messageId}: ${isPositive ? 'POSITIVE' : 'NEGATIVE'}`, 'SUCCESS');
};
