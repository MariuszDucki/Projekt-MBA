
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, StopCircle, X, Loader2, Ticket as TicketIcon, Paperclip, ChevronLeft, ChevronRight, RotateCcw, CheckSquare, BarChart3, ArrowDown, Sparkles, GraduationCap, Trophy, HelpCircle, ShieldAlert, ThumbsUp, ThumbsDown, Copy, Check, FileSearch, Users } from 'lucide-react';
import { Message, MessageRole, WidgetData, QuizData } from '../types';
import { sendMessageToGemini, initChat, generateVoiceAudio, clearChatHistory, loadChatHistory, saveChatHistory, submitMessageFeedback } from '../services/geminiService';
import Markdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';

interface ExtendedMessage extends Message {
  sources?: string[];
  widget?: WidgetData;
  isError?: boolean;
  isClarification?: boolean; // New UX state for "Clarification Needed"
}

// --- WIDGET COMPONENTS (Glass Style) ---
const ChecklistWidget = ({ data, title }: { data: string[], title: string }) => {
    const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(data.length).fill(false));
    const toggleItem = (index: number) => {
        const newChecked = [...checkedItems];
        newChecked[index] = !newChecked[index];
        setCheckedItems(newChecked);
    };
    const progress = Math.round((checkedItems.filter(Boolean).length / data.length) * 100);
    return (
        <div className="mt-4 mb-2 bg-west-paper border border-west-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 max-w-xl shadow-inner backdrop-blur-md">
            <div className="bg-west-accent/5 px-4 py-3 border-b border-west-border flex justify-between items-center">
                <h4 className="text-xs font-mono font-bold text-west-accent uppercase flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> {title}
                </h4>
                <span className="text-[10px] font-mono text-west-muted">{progress}% COMPLETE</span>
            </div>
            <div className="p-3 space-y-1">
                {data.map((item, idx) => (
                    <div key={idx} onClick={() => toggleItem(idx)} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-west-accent/5 group ${checkedItems[idx] ? 'opacity-50' : ''}`}>
                        <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 rounded transition-colors ${checkedItems[idx] ? 'bg-west-accent border-west-accent' : 'border-west-muted group-hover:border-west-accent'}`}>
                            {checkedItems[idx] && <div className="w-2 h-2 bg-white" />}
                        </div>
                        <span className={`text-sm font-mono ${checkedItems[idx] ? 'text-west-muted line-through' : 'text-west-text'}`}>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuizWidget = ({ data, title }: { data: QuizData, title: string }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const handleSelect = (id: string) => {
        if (isSubmitted) return;
        setSelectedOption(id);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    const isCorrect = selectedOption ? data.options.find(o => o.id === selectedOption)?.isCorrect : false;

    return (
        <div className="mt-4 mb-2 bg-west-paper border border-west-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 max-w-xl shadow-lg backdrop-blur-md">
            <div className="bg-purple-500/10 px-4 py-3 border-b border-purple-500/30 flex justify-between items-center">
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> {title}
                </h4>
            </div>
            <div className="p-5">
                <p className="text-sm font-sans text-west-text font-bold mb-4">{data.question}</p>
                
                <div className="space-y-2 mb-4">
                    {data.options.map((option) => {
                        let btnClass = "border-west-border hover:bg-west-hover text-west-text";
                        if (selectedOption === option.id) {
                            btnClass = "border-west-accent bg-west-accent/10 text-west-accent";
                        }
                        if (isSubmitted) {
                            if (option.isCorrect) btnClass = "border-green-500 bg-green-500/20 text-green-500";
                            else if (selectedOption === option.id && !option.isCorrect) btnClass = "border-red-500 bg-red-500/20 text-red-500";
                            else btnClass = "border-west-border opacity-50";
                        }

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                disabled={isSubmitted}
                                className={`w-full p-3 text-left text-sm rounded-lg border transition-all flex justify-between items-center ${btnClass}`}
                            >
                                <span>{option.text}</span>
                                {isSubmitted && option.isCorrect && <CheckSquare className="w-4 h-4" />}
                                {isSubmitted && selectedOption === option.id && !option.isCorrect && <X className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </div>

                {!isSubmitted ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="w-full py-2 bg-west-accent text-black font-bold text-xs rounded hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono"
                    >
                        SPRAWDŹ ODPOWIEDŹ
                    </button>
                ) : (
                    <div className={`p-3 rounded-lg border text-xs ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                        <div className="flex items-center gap-2 font-bold mb-1">
                            {isCorrect ? <Trophy className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                            {isCorrect ? "BRAWO! PRAWIDŁOWA ODPOWIEDŹ" : "NIESTETY, TO NIE JEST POPRAWNA ODPOWIEDŹ"}
                        </div>
                        <p className="opacity-90">{data.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const TelemetryWidget = ({ data, title }: { data: any[], title: string }) => {
    return (
        <div className="mt-4 mb-2 bg-west-paper border border-west-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 max-w-xl shadow-inner backdrop-blur-md">
            <div className="bg-west-border/10 px-4 py-3 border-b border-west-border flex justify-between items-center">
                <h4 className="text-xs font-mono font-bold text-west-text uppercase flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-west-accent" /> {title}
                </h4>
                <span className="text-[10px] font-mono text-green-500 animate-pulse">● LIVE STREAM</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
                {data.map((item, idx) => (
                    <div key={idx} className="relative group p-2 rounded hover:bg-west-hover transition-colors">
                        <div className="flex justify-between items-end mb-1">
                             <div className="text-[10px] text-west-muted font-mono uppercase">{item.label}</div>
                             <div className="text-[10px] text-west-accent font-mono">{item.unit}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-mono font-bold ${item.status === 'warning' ? 'text-red-500' : item.status === 'optimal' ? 'text-green-500' : 'text-west-text'}`}>{item.value}</span>
                        </div>
                        <div className="w-full h-1 bg-west-border/30 mt-2 rounded-full overflow-hidden">
                            <div className={`h-full ${item.status === 'warning' ? 'bg-red-500' : 'bg-west-accent'} transition-all duration-1000`} style={{ width: `${Math.min(100, item.value)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MediaCarousel = ({ urls, type }: { urls: string[], type: 'image' | 'video' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!urls || urls.length === 0) return null;

    const nextSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % urls.length);
    };
    const prevSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
    };

    return (
        <>
            <div className="mt-4 mb-2 max-w-md cursor-zoom-in" onClick={() => setIsFullscreen(true)}>
                <div className="relative border border-west-border rounded-xl overflow-hidden bg-black aspect-video group shadow-lg hover:border-west-accent transition-all transform hover:scale-[1.02]">
                    {type === 'video' ? (
                        <video src={urls[currentIndex]} controls className="w-full h-full object-contain" onClick={(e) => e.stopPropagation()} />
                    ) : (
                        <img src={urls[currentIndex]} alt="Attachment" className="w-full h-full object-contain" />
                    )}
                    
                    {urls.length > 1 && (
                        <>
                            <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur text-white border border-white/20 hover:bg-west-accent hover:text-black hover:border-west-accent rounded-full transition-all"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur text-white border border-white/20 hover:bg-west-accent hover:text-black hover:border-west-accent rounded-full transition-all"><ChevronRight className="w-4 h-4" /></button>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-white border border-white/10">{currentIndex + 1} / {urls.length}</div>
                        </>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
                    <div className="p-4 flex justify-between items-center z-50 border-b border-white/10 bg-black/50">
                        <span className="text-west-accent font-mono text-sm tracking-wider">VISUAL_FEED :: {currentIndex + 1} / {urls.length}</span>
                        <button onClick={() => setIsFullscreen(false)} className="p-2 text-white/70 hover:text-red-500 transition-colors bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative p-4" onClick={() => setIsFullscreen(false)}>
                        <img src={urls[currentIndex]} alt="Fullscreen" className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}/>
                    </div>
                </div>
            )}
        </>
    );
};

const TicketCard = ({ ticket }: { ticket: any }) => (
    <div className="mt-4 mb-2 p-0 bg-west-paper border border-west-border rounded-xl overflow-hidden max-w-lg shadow-md backdrop-blur-sm">
        <div className="bg-west-warn/5 p-3 flex justify-between items-center border-b border-west-border/30">
            <span className="font-mono text-xs font-bold text-west-warn uppercase flex items-center gap-2">
                <TicketIcon className="w-4 h-4" /> REQ #{ticket.id}
            </span>
             <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono bg-west-bg/50 ${ticket.priority === 'CRITICAL' ? 'text-red-500 border-red-500' : 'text-west-warn border-west-warn'}`}>
                {ticket.priority}
            </span>
        </div>
        <div className="p-4">
             <div className="grid grid-cols-2 gap-4 text-xs font-mono text-west-text mb-2">
                <div><span className="text-west-muted opacity-70 mr-2">DEST:</span>EXPERT_TEAM</div>
                <div><span className="text-west-muted opacity-70 mr-2">STATUS:</span>{ticket.status}</div>
             </div>
             <div className="text-sm text-west-text font-sans leading-relaxed italic opacity-80">
                "Użytkownik zgłosił brak wiedzy lub problem: {ticket.description}"
             </div>
        </div>
    </div>
);

const WELCOME_MESSAGE: ExtendedMessage = {
    id: 'welcome',
    role: MessageRole.MODEL,
    text: 'Cześć! Jestem Twoim Asystentem Szkoleniowym DELOS. Działam w trybie ZAMKNIĘTYM (Closed System) - korzystam wyłącznie z wewnętrznej bazy wiedzy. W czym mogę pomóc?',
    timestamp: Date.now()
};

// --- MODERN GLASS CARDS FOR PROMPTS ---
const QuickPrompts = ({ onSelect }: { onSelect: (text: string) => void }) => {
    const prompts = [
        { label: "ONBOARDING START", icon: Users, text: "Jestem nowym pracownikiem. Rozpocznij procedurę onboardingu (Dzień 1)." },
        { label: "INSTRUKCJE BHP", icon: ShieldAlert, text: "Gospodarka Odpadami Produkcyjnymi - Chłodziwo" },
        { label: "SPRAWDŹ WIEDZĘ", icon: Trophy, text: "Zrób mi szybki quiz z zakresu bezpieczeństwa." },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {prompts.map((p, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(p.text)}
                    className="
                        group relative overflow-hidden px-6 py-5 
                        bg-west-panel
                        border border-west-border hover:border-west-accent/50
                        hover:shadow-glow hover:-translate-y-1
                        transition-all duration-500 rounded-2xl
                        flex flex-col items-center gap-3 w-40 backdrop-blur-xl
                        shadow-lg
                    "
                    style={{ animationDelay: `${idx * 150}ms` }}
                >
                    {/* Inner Glass Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="p-3 rounded-full bg-west-bg/50 border border-west-border group-hover:bg-west-accent/10 group-hover:border-west-accent/50 transition-colors z-10">
                        <p.icon className="w-5 h-5 text-west-muted group-hover:text-west-accent transition-colors" />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-west-muted group-hover:text-west-text uppercase tracking-wider text-center z-10">
                        {p.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

const ChatInterfaceWrapper: React.FC<{showToast?: (msg: string) => void}> = ({showToast}) => {
    const [resetKey, setResetKey] = useState(0);
    const handleReset = () => {
        clearChatHistory();
        setResetKey(prev => prev + 1);
        if (showToast) showToast("Session Reset");
    };
    return <ChatSession key={resetKey} onSessionReset={handleReset} />;
};

const ChatSession: React.FC<{ onSessionReset: () => void }> = ({ onSessionReset }) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); 
  
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleScroll = () => {
      if (!chatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // INITIALIZATION: Load from storage if available, otherwise start fresh
  useEffect(() => {
    const initializeSession = async () => {
        setIsThinking(true);
        const savedHistory = loadChatHistory();
        if (savedHistory && savedHistory.length > 0) {
            setMessages(savedHistory);
            await initChat(savedHistory);
        } else {
            setMessages([WELCOME_MESSAGE]);
            await initChat([]); 
        }
        setIsThinking(false);
    };
    initializeSession();
  }, []);

  useEffect(() => {
      return () => {
          if (recognitionRef.current) recognitionRef.current.abort();
          stopAudio();
      };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleRetry = async () => {
      const lastUserMsg = [...messages].reverse().find(m => m.role === MessageRole.USER);
      if (lastUserMsg) {
          // Remove potential error message
          setMessages(prev => prev.filter(m => !m.isError));
          // Trigger send with last content
          await handleSendMessageInternal(lastUserMsg.text, lastUserMsg.visualAttachment);
      }
  };

  const handleSendMessage = async () => {
      await handleSendMessageInternal(input, selectedImage || undefined);
  };

  const handleSendMessageInternal = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    // Only add to history if it's a new message (not a retry of existing)
    const isRetry = messages.some(m => m.text === text && m.timestamp > Date.now() - 5000); // Simple debounce check
    let newHistory = messages;

    if (!isRetry) {
        const userMsg: ExtendedMessage = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            text: text,
            timestamp: Date.now(),
            visualAttachment: image
        };
        newHistory = [...messages, userMsg];
        setMessages(newHistory);
        saveChatHistory(newHistory);
    }
    
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto'; 
    setSelectedImage(null);
    setIsThinking(true);

    try {
      const imagePayload = image && image.includes(',') ? image.split(',')[1] : image;
      const result = await sendMessageToGemini(text, imagePayload);

      const botMsg: ExtendedMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: result.text,
        timestamp: Date.now(),
        sources: result.sources,
        ticketPayload: result.createdTicket,
        mediaPayload: result.mediaPayload,
        widget: result.widget,
        isClarification: result.isClarification
      };

      const updatedHistory = [...newHistory, botMsg];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);

    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: ExtendedMessage = {
          id: Date.now().toString(),
          role: MessageRole.SYSTEM,
          text: "Przepraszam, chwilowy problem z połączeniem. Spróbujmy jeszcze raz.",
          timestamp: Date.now(),
          isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFeedback = (msgId: string, isPositive: boolean) => {
      const updatedMessages = messages.map(m => m.id === msgId ? { ...m, feedback: isPositive ? 'positive' : 'negative' } as ExtendedMessage : m);
      setMessages(updatedMessages);
      submitMessageFeedback(msgId, isPositive);
  };

  const handleQuickPrompt = (text: string) => {
      setInput(text);
      if (inputRef.current) inputRef.current.focus();
  };

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  // --- IMPROVED AUDIO PLAYBACK ---
  const playResponseAudio = async (text: string, msgId: string) => {
    // If clicking same button, toggle off
    if (playingMessageId === msgId) {
        stopAudio();
        return;
    }
    
    // Stop any current audio
    stopAudio();
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    setPlayingMessageId(msgId);
    setIsAudioLoading(true);
    
    const pcmBuffer = await generateVoiceAudio(text);
    setIsAudioLoading(false);

    if (pcmBuffer && pcmBuffer instanceof ArrayBuffer) {
        try {
            const numChannels = 1;
            const sampleRate = 24000;
            const frameCount = pcmBuffer.byteLength / 2;
            const audioBuffer = audioCtx.createBuffer(numChannels, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            const dataView = new DataView(pcmBuffer);
            
            for (let i = 0; i < frameCount; i++) {
                const int16 = dataView.getInt16(i * 2, true);
                channelData[i] = int16 / 32768.0;
            }

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.onended = () => {
                setPlayingMessageId(null);
                audioSourceRef.current = null;
            };
            audioSourceRef.current = source;
            source.start();
        } catch (e) {
            console.error("Audio Playback Error:", e);
            setPlayingMessageId(null);
        }
    } else {
        setPlayingMessageId(null);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
        // Remove listener to prevent state update race condition
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }
    setPlayingMessageId(null);
    setIsAudioLoading(false);
  };

  const toggleListening = () => {
    if (isListening) {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        return;
    }
    if (!('webkitSpeechRecognition' in window)) {
        alert("Brak obsługi rozpoznawania mowy w tej przeglądarce.");
        return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pl-PL';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
    };
    recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') console.error("Speech error", event.error);
        setIsListening(false);
    };
    recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
        
        {/* --- FLOATING HEADER (HUD STYLE) --- */}
        <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center pointer-events-none">
            <div className="bg-west-panel/80 backdrop-blur-md px-4 py-2 rounded-full border border-west-border shadow-lg flex items-center gap-3 pointer-events-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-west-text">TRAINING_MODE::ACTIVE (CLOSED SYSTEM)</span>
            </div>
            
            <button 
                onClick={() => { stopAudio(); onSessionReset(); }}
                className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-west-panel/80 backdrop-blur-md border border-west-border hover:border-west-accent rounded-full transition-all group shadow-lg hover:shadow-glow"
            >
                <RotateCcw className="w-4 h-4 text-west-muted group-hover:text-west-accent transition-colors" />
            </button>
        </div>

        {/* --- MESSAGES AREA (STATIC AERO-GEL) --- */}
        <div 
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 scrollbar-thin relative z-10 pt-20 pb-32" 
            ref={chatContainerRef}
            onScroll={handleScroll}
        >
            {messages.length === 1 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-700">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-west-accent blur-[60px] opacity-20 animate-pulse-slow"></div>
                        {/* Static Welcome Card */}
                        <div className="relative z-10 bg-west-panel/60 border border-west-accent/30 p-10 rounded-3xl shadow-3d backdrop-blur-xl hover:scale-[1.02] transition-transform duration-500">
                            <GraduationCap className="w-24 h-24 text-west-accent drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                        </div>
                    </div>
                    
                    <div className="text-center space-y-2 relative z-10">
                        <h2 className="text-4xl font-sans font-bold tracking-tight text-west-text drop-shadow-sm">DELOS ACADEMY</h2>
                        <p className="font-mono text-west-accent text-sm tracking-widest uppercase opacity-80">System Zamknięty: Pytaj tylko o procedury wewnętrzne.</p>
                    </div>

                    <QuickPrompts onSelect={handleQuickPrompt} />
                </div>
            )}

            {messages.length > 1 && messages.map((msg, idx) => {
                if (idx === 0) return null;
                const isUser = msg.role === MessageRole.USER;
                const isPlaying = playingMessageId === msg.id;
                const isClarification = msg.isClarification;
                
                return (
                    <div 
                        key={idx} 
                        className={`
                            flex w-full ${isUser ? 'justify-end' : 'justify-start'}
                            animate-in slide-in-from-bottom-6 duration-700
                        `}
                    >
                        {/* STATIC AERO-GEL BUBBLE */}
                        <div 
                            className={`
                                relative max-w-[90%] md:max-w-3xl 
                                p-6 rounded-3xl border shadow-3d backdrop-blur-2xl
                                transition-all duration-300
                                ${isUser 
                                    ? 'bg-west-bubbleUser border-west-glassBorder text-right rounded-br-sm hover:scale-[1.01]' 
                                    : isClarification 
                                        ? 'bg-yellow-500/10 border-yellow-500/30 text-left rounded-bl-sm hover:scale-[1.01]' // CLARIFICATION STYLE
                                        : 'bg-west-bubbleSystem border-west-glassBorder text-left rounded-bl-sm hover:scale-[1.01]'}
                            `}
                        >
                            {/* Inner Highlight for Volume (Static) */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                            {/* Role Label */}
                            <div className={`mb-3 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'} opacity-60`}>
                                <span className={`text-[10px] font-mono font-bold tracking-widest ${isUser ? 'text-west-accent' : isClarification ? 'text-yellow-500' : 'text-west-muted'}`}>
                                    {isUser ? 'PRACOWNIK' : isClarification ? 'DOPRECYZOWANIE' : 'MENTOR AI'}
                                </span>
                                {isClarification && <HelpCircle className="w-3 h-3 text-yellow-500 animate-pulse" />}
                            </div>

                            {/* Content */}
                            <div className={`relative z-10 font-sans text-sm md:text-base leading-relaxed markdown-content ${isUser ? 'text-west-text' : 'text-west-text/90'}`}>
                                
                                {msg.visualAttachment && (
                                    <div className={`mb-4 rounded-xl overflow-hidden border border-west-border shadow-lg ${isUser ? 'ml-auto max-w-[200px]' : 'max-w-md'}`}>
                                        <img src={msg.visualAttachment} alt="upload" className="w-full object-cover" />
                                    </div>
                                )}

                                <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                            </div>

                            {/* Widgets (System Only) */}
                            {!isUser && (
                                <div className="relative z-10 mt-6">
                                    {msg.widget && msg.widget.type === 'checklist' && <ChecklistWidget data={msg.widget.data} title={msg.widget.title} />}
                                    {msg.widget && msg.widget.type === 'telemetry' && <TelemetryWidget data={msg.widget.data} title={msg.widget.title} />}
                                    {/* NEW QUIZ WIDGET */}
                                    {msg.widget && msg.widget.type === 'quiz' && <QuizWidget data={msg.widget.data} title={msg.widget.title} />}
                                    
                                    {msg.ticketPayload && <TicketCard ticket={msg.ticketPayload} />}
                                    {msg.mediaPayload && <MediaCarousel urls={msg.mediaPayload.urls} type={msg.mediaPayload.type} />}
                                    
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2 items-center pt-4 border-t border-west-border/30">
                                            <FileSearch className="w-3 h-3 text-west-muted" />
                                            {msg.sources.map((source, i) => (
                                                <span key={i} className="text-[9px] px-2 py-0.5 border border-west-border/50 rounded-full text-west-muted bg-black/10 font-mono">
                                                    {source}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PERSISTENT FOOTER ACTIONS (System Only) */}
                            {!isUser && (
                                <div className="relative z-10 mt-5 pt-3 border-t border-west-border/30 flex justify-between items-center animate-in fade-in duration-500 delay-200">
                                    
                                    {/* TTS Button with Visualization */}
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => playResponseAudio(msg.text, msg.id)} 
                                            disabled={isAudioLoading && !isPlaying}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-mono font-bold
                                                ${isPlaying 
                                                    ? 'bg-west-accent text-black border-west-accent shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                                                    : 'bg-west-panel/50 border-west-border text-west-muted hover:text-west-accent hover:border-west-accent/50'}
                                            `}
                                        >
                                            {isPlaying ? (
                                                <>
                                                    <StopCircle className="w-3.5 h-3.5" />
                                                    <span>STOP AUDIO</span>
                                                    {/* Fake Equalizer Animation */}
                                                    <div className="flex items-end gap-0.5 h-3 ml-1">
                                                        <div className="w-0.5 bg-black animate-[pulse_0.5s_ease-in-out_infinite] h-1.5"></div>
                                                        <div className="w-0.5 bg-black animate-[pulse_0.7s_ease-in-out_infinite] h-3"></div>
                                                        <div className="w-0.5 bg-black animate-[pulse_0.4s_ease-in-out_infinite] h-2"></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {isAudioLoading && playingMessageId === null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                                                    <span>READ ALOUD</span>
                                                </>
                                            )}
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleCopy(msg.text, msg.id)}
                                            className="p-1.5 rounded-full hover:bg-west-panel text-west-muted hover:text-west-text transition-colors"
                                            title="Copy Text"
                                        >
                                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    {/* Feedback Buttons */}
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => handleFeedback(msg.id, true)} 
                                            className={`p-1.5 rounded-lg transition-colors ${msg.feedback === 'positive' ? 'text-green-500 bg-green-500/10' : 'text-west-muted hover:text-green-500 hover:bg-west-panel'}`}
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleFeedback(msg.id, false)} 
                                            className={`p-1.5 rounded-lg transition-colors ${msg.feedback === 'negative' ? 'text-red-500 bg-red-500/10' : 'text-west-muted hover:text-red-500 hover:bg-west-panel'}`}
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {isThinking && (
                 <div className="w-full max-w-4xl mx-auto mt-6 animate-pulse">
                    <div className="flex items-center gap-3 bg-west-panel/30 backdrop-blur-sm border border-west-border/50 px-4 py-2 rounded-full w-fit">
                        <Sparkles className="w-4 h-4 text-west-accent animate-spin-slow" />
                        <span className="text-xs font-mono text-west-accent tracking-widest">ANALIZOWANIE KONTEKSTU...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Scroll Button */}
        {showScrollButton && (
            <div className="absolute bottom-32 right-8 z-40">
                <button 
                    onClick={() => scrollToBottom()}
                    className="bg-west-panel/80 backdrop-blur text-west-accent border border-west-border rounded-full p-3 shadow-lg hover:scale-110 transition-all"
                >
                    <ArrowDown className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* --- FLOATING COCKPIT INPUT --- */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-west-bg to-transparent z-30 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
                {selectedImage && (
                    <div className="flex items-center gap-3 p-2 bg-west-panel/90 backdrop-blur-xl border border-west-accent rounded-lg mb-2 w-fit animate-in slide-in-from-bottom-2 shadow-2xl">
                        <div className="w-10 h-10 rounded overflow-hidden border border-white/20">
                            <img src={selectedImage} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-mono text-west-text font-bold">ZAŁĄCZNIK GOTOWY</span>
                        <button onClick={() => setSelectedImage(null)} className="text-west-muted hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className={`
                    flex items-end gap-2 p-2 rounded-[2rem] transition-all duration-300 relative 
                    bg-west-panel border-2 shadow-3d
                    ${isListening 
                        ? 'border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.2)]' 
                        : 'border-west-border focus-within:border-west-accent focus-within:shadow-[0_0_35px_rgba(6,182,212,0.15)]'}
                `}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                    <div className="flex gap-1 items-center pb-1 pl-1">
                        <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-west-hover transition-colors text-west-muted hover:text-west-text" title="Upload">
                            <Paperclip className="w-5 h-5" />
                        </button>
                         <button onClick={toggleListening} className={`p-3 rounded-full hover:bg-west-hover transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-west-muted hover:text-west-text'}`} title="Voice">
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                    </div>

                    <textarea 
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        placeholder={isListening ? "Słucham..." : "Zadaj pytanie szkoleniowe..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-west-text font-sans placeholder-west-muted/70 text-base resize-none max-h-32 min-h-[48px] py-3 px-2 scrollbar-thin font-medium"
                        rows={1}
                    />

                    <button 
                        onClick={handleSendMessage}
                        disabled={(!input.trim() && !selectedImage) || isThinking}
                        className={`
                            p-3 rounded-full transition-all duration-300 mb-0.5 mr-0.5
                            ${(!input.trim() && !selectedImage) || isThinking 
                                ? 'bg-west-bg/50 text-west-muted cursor-not-allowed opacity-50' 
                                : 'bg-west-accent text-white shadow-glow hover:scale-110 hover:bg-cyan-400'}
                        `}
                    >
                        {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                
                <div className="mt-3 text-center">
                     <span className="text-[9px] font-mono text-west-muted opacity-60 tracking-wider">EDU-CORE v2.0 // INTERNAL USE ONLY</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ChatInterfaceWrapper;
