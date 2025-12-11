
import React, { useState, useEffect, useRef } from 'react';
import { getRuntimeKnowledgeBase, addDocumentToKnowledgeBase, removeDocumentFromKnowledgeBase, analyzeMediaContent } from '../services/geminiService';
import { KnowledgeDoc } from '../types';
import { FileText, Lock, UploadCloud, Plus, Save, FileUp, X, FileType, CheckCircle, Loader2, Trash2, Search, AlertTriangle, AlertOctagon, FileVideo, Image as ImageIcon, FileSpreadsheet, Paperclip, HelpCircle, Info, Filter, Calendar, ChevronDown, ChevronUp, RefreshCw, Upload, Maximize2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import * as mammoth from 'mammoth';
// @ts-ignore
import * as XLSX from 'xlsx';
// @ts-ignore
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const KnowledgeBase: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<KnowledgeDoc[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State for Document Viewer Modal
  const [viewDoc, setViewDoc] = useState<KnowledgeDoc | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'SAFETY' | 'MAINTENANCE' | 'PROCEDURES' | 'HR'>('SAFETY');
  const [newContent, setNewContent] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<boolean>(false);
  const [extractionStatusMsg, setExtractionStatusMsg] = useState<string>('');
  
  const [tempMediaUrl, setTempMediaUrl] = useState<string | null>(null);
  const [tempMediaType, setTempMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [duplicateError, setDuplicateError] = useState<boolean>(false);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);

  const refreshDocs = () => {
    const allDocs = getRuntimeKnowledgeBase();
    setDocs(allDocs);
  };

  useEffect(() => {
    refreshDocs();
  }, []);

  useEffect(() => {
    let result = docs;
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(doc => 
            doc.title.toLowerCase().includes(lowerQuery) ||
            doc.content.toLowerCase().includes(lowerQuery) ||
            doc.id.toLowerCase().includes(lowerQuery)
        );
    }
    if (filterCategory !== 'ALL') {
        result = result.filter(doc => doc.category === filterCategory);
    }
    if (dateStart) {
        result = result.filter(doc => doc.lastUpdated >= dateStart);
    }
    if (dateEnd) {
        result = result.filter(doc => doc.lastUpdated <= dateEnd);
    }
    setFilteredDocs(result);
  }, [searchQuery, filterCategory, dateStart, dateEnd, docs]);

  const resetFilters = () => {
      setSearchQuery('');
      setFilterCategory('ALL');
      setDateStart('');
      setDateEnd('');
  };

  const activeFiltersCount = (filterCategory !== 'ALL' ? 1 : 0) + (dateStart ? 1 : 0) + (dateEnd ? 1 : 0) + (searchQuery ? 1 : 0);

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (duplicateError) setDuplicateError(false);
  };

  // --- EXTRACTION FUNCTIONS (Reuse existing logic) ---
  const extractTextFromPdf = async (file: File): Promise<string> => {
      try {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = "";
          let hasText = false;
          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              if (pageText.trim().length > 0) {
                fullText += `[STRONA ${i}]\n${pageText}\n\n`;
                hasText = true;
              }
          }
          if (!hasText || fullText.trim().length < 50) return "";
          return fullText;
      } catch (error) {
          throw new Error("Błąd parsowania PDF");
      }
  };

  const extractTextAndImagesFromDocx = async (file: File): Promise<{ text: string, images: string[] }> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const textResult = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        let extractedImages: string[] = [];
        const options = {
            convertImage: mammoth.images.imgElement((image: any) => {
                return image.read("base64").then((imageBuffer: any) => {
                    const base64 = "data:" + image.contentType + ";base64," + imageBuffer;
                    extractedImages.push(base64);
                    return { src: base64 };
                });
            })
        };
        await mammoth.convertToHtml({ arrayBuffer: arrayBuffer }, options);
        return { text: textResult.value, images: extractedImages };
    } catch (error) {
        throw new Error("Błąd parsowania DOCX");
    }
  };

  const extractTextFromLegacyDoc = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const extractCleanText = (decoded: string) => {
            const pattern = /[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\.,;:!?'"()\-]{3,}/g;
            const matches = decoded.match(pattern);
            if (!matches) return { text: '', score: 0 };
            const joined = matches.join(' ').replace(/\s+/g, ' ').trim();
            return { text: joined, score: joined.length };
        };
        const decoder8 = new TextDecoder('utf-8');
        const res8 = extractCleanText(decoder8.decode(arrayBuffer));
        if (res8.score < 50) return `[SYSTEM WARNING] Plik .DOC jest w formacie binarnym.`;
        return `[LEGACY .DOC EXTRACT]\n${res8.text}`;
    } catch (error) {
        throw new Error("Błąd odczytu pliku .doc");
    }
  };

  // --- IMPROVED EXCEL EXTRACTION TO MARKDOWN TABLE ---
  const extractDataFromExcel = async (file: File): Promise<{ text: string, images: string[] }> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        if (!XLSX) throw new Error("XLSX lib missing");
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        let fullText = `[ARKUSZ KALKULACYJNY: ${file.name}]\n\n`;
        
        workbook.SheetNames.forEach((sheetName: string) => {
            const worksheet = workbook.Sheets[sheetName];
            // Use sheet_to_json with header: 1 to get a 2D array
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            if (jsonData && jsonData.length > 0) {
                fullText += `### ARKUSZ: ${sheetName}\n\n`;
                
                // Construct Markdown Table
                // 1. Identify max columns to ensure uniformity
                let maxCols = 0;
                jsonData.forEach(row => {
                    if (row.length > maxCols) maxCols = row.length;
                });

                if (maxCols > 0) {
                    // Header Row
                    const headerRow = jsonData[0] || [];
                    const headerString = '| ' + Array.from({ length: maxCols }).map((_, i) => {
                        return (headerRow[i] !== undefined && headerRow[i] !== null) ? String(headerRow[i]).replace(/\|/g, '&#124;').trim() : '';
                    }).join(' | ') + ' |';
                    
                    // Separator Row
                    const separatorString = '| ' + Array.from({ length: maxCols }).map(() => '---').join(' | ') + ' |';
                    
                    fullText += headerString + '\n' + separatorString + '\n';
                    
                    // Data Rows (skip header)
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row.length === 0) continue; // Skip empty rows
                        const rowString = '| ' + Array.from({ length: maxCols }).map((_, colIdx) => {
                            let cell = row[colIdx];
                            return (cell !== undefined && cell !== null) ? String(cell).replace(/\|/g, '&#124;').replace(/\n/g, '<br>').trim() : '';
                        }).join(' | ') + ' |';
                        fullText += rowString + '\n';
                    }
                    fullText += '\n';
                }
            }
        });

        const extractedImages: string[] = [];
        let nativeChartsCount = 0;
        if (file.name.toLowerCase().endsWith('.xlsx')) {
             try {
                const zip = await (JSZip as any).loadAsync(arrayBuffer);
                const mediaFolder = zip.folder("xl/media");
                if (mediaFolder) {
                    const entries: any[] = [];
                    mediaFolder.forEach((relativePath: string, zipEntry: any) => entries.push({ path: relativePath, file: zipEntry }));
                    for (const entry of entries) {
                        const ext = entry.path.split('.').pop()?.toLowerCase();
                        let mime = '';
                        if (['png','jpg','jpeg','gif','bmp','webp'].includes(ext)) mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
                        if (mime) {
                            const base64 = await entry.file.async('base64');
                            extractedImages.push(`data:${mime};base64,${base64}`);
                        }
                    }
                }
                const chartsFolder = zip.folder("xl/charts");
                if (chartsFolder) chartsFolder.forEach(() => nativeChartsCount++);
             } catch (e) {}
        }
        if (nativeChartsCount > 0) fullText += `\n\n> [SYSTEM WARNING]: Wykryto ${nativeChartsCount} natywnych wykresów Excel, które nie są widoczne w tekście. Sprawdź załączniki.\n`;
        return { text: fullText, images: extractedImages };
    } catch (error) {
        throw new Error("Błąd parsowania Excel");
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setExtractionError(false);
    setExtractionStatusMsg('');
    setDuplicateError(false);
    setUploadProgress(10);
    setFileName(file.name);
    
    setTempMediaUrl(null);
    setTempMediaType(undefined);
    setAttachedImages([]); 
    
    const autoTitle = file.name.split('.')[0];
    setNewTitle(autoTitle); 
    
    if (docs.some(d => d.title.toLowerCase() === autoTitle.toLowerCase())) setDuplicateError(true);

    const progressInterval = setInterval(() => {
        setUploadProgress((prev) => prev >= 90 ? 90 : prev + 5);
    }, 200);

    try {
        let extractedText = "";
        let extractedImgs: string[] = [];
        const fileType = file.type;
        const fileNameLower = file.name.toLowerCase();

        if (fileType === "application/pdf") {
            setExtractionStatusMsg("Parsowanie PDF...");
            extractedText = await extractTextFromPdf(file);
        } else if (fileType.includes("word") || fileNameLower.endsWith('.docx')) {
            setExtractionStatusMsg("Skanowanie DOCX...");
            const result = await extractTextAndImagesFromDocx(file);
            extractedText = result.text;
            extractedImgs = result.images;
        } else if (fileNameLower.endsWith('.doc') || fileType === "application/msword") {
            setExtractionStatusMsg("Legacy DOC...");
            extractedText = await extractTextFromLegacyDoc(file);
        } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
            setExtractionStatusMsg("Analiza Arkusza...");
            const result = await extractDataFromExcel(file);
            extractedText = result.text;
            extractedImgs = result.images;
        } else if (fileType.startsWith('image/')) {
            setExtractionStatusMsg("Analiza obrazu...");
            setTempMediaUrl(URL.createObjectURL(file as unknown as Blob));
            setTempMediaType('image');
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file as unknown as Blob);
            });
            extractedText = `[OBRAZ GŁÓWNY: ${file.name}]\n` + await analyzeMediaContent(base64.split(',')[1], fileType);
        } else if (fileType.startsWith('video/')) {
             if (file.size > 25 * 1024 * 1024) throw new Error("Video > 25MB");
             setExtractionStatusMsg("Analiza wideo...");
             setTempMediaUrl(URL.createObjectURL(file as unknown as Blob));
             setTempMediaType('video');
             const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file as unknown as Blob);
            });
            extractedText = `[WIDEO: ${file.name}]\n` + await analyzeMediaContent(base64.split(',')[1], fileType);
        } else {
             try {
                extractedText = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsText(file as unknown as Blob);
                });
             } catch {
                extractedText = "[ERROR] Nieznany format.";
                setExtractionError(true);
             }
        }
        
        if (!extractedText.trim() && !extractionError) {
             setExtractionError(true);
             extractedText = "[ERROR] Pusty plik.";
        }
        setNewContent(extractedText);
        setAttachedImages(extractedImgs);
        setUploadProgress(100);

    } catch (e: any) {
        setNewContent(`Błąd: ${e.message}`);
        setExtractionError(true);
    } finally {
        clearInterval(progressInterval);
        setTimeout(() => { setIsUploading(false); setExtractionStatusMsg(''); }, 500);
    }
  };

  const handleManualImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                setAttachedImages(prev => [...prev, base64]);
            };
            reader.readAsDataURL(file as unknown as Blob);
        });
    }
  };

  const removeAttachedImage = (index: number) => setAttachedImages(prev => prev.filter((_, i) => i !== index));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !isUploading) {
        processFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddDocument = () => {
    if (!newTitle || !newContent || extractionError) return;
    if (docs.some(d => d.title.trim().toLowerCase() === newTitle.trim().toLowerCase())) {
        setDuplicateError(true);
        return;
    }
    const newDoc: KnowledgeDoc = {
        id: `doc-${Date.now().toString().slice(-4)}`,
        title: newTitle.trim(),
        category: newCategory,
        content: newContent,
        lastUpdated: new Date().toISOString().split('T')[0],
        mediaUrl: tempMediaUrl || undefined,
        mediaType: tempMediaType,
        attachedImages: attachedImages
    };
    addDocumentToKnowledgeBase(newDoc);
    refreshDocs();
    setNewTitle(''); setNewContent(''); setFileName(null); setUploadProgress(0);
    setTempMediaUrl(null); setTempMediaType(undefined); setAttachedImages([]);
    setIsFormOpen(false); setExtractionError(false); setDuplicateError(false);
  };

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeDocumentFromKnowledgeBase(id);
    refreshDocs();
  };

  // --- DOCUMENT VIEWER COMPONENT (PAGINATED) ---
  const DocumentViewer = ({ doc, onClose }: { doc: KnowledgeDoc, onClose: () => void }) => {
    const images = doc.attachedImages || [];
    const hasMedia = doc.mediaUrl || images.length > 0;
    
    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const CHARS_PER_PAGE = 3000;
    const totalPages = Math.ceil(doc.content.length / CHARS_PER_PAGE);
    
    // Split content ensuring we don't break markdown tables too badly (simple split)
    const startIdx = (currentPage - 1) * CHARS_PER_PAGE;
    const currentContent = doc.content.slice(startIdx, startIdx + CHARS_PER_PAGE);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/20 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in zoom-in-95 fade-in duration-300">
            <div className="w-full max-w-6xl bg-west-panel/90 dark:bg-west-panel/60 border border-west-border shadow-3d rounded-2xl flex flex-col h-full max-h-[95vh] overflow-hidden relative backdrop-blur-2xl">
                
                {/* Aero-Gel Inner Highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 pointer-events-none rounded-2xl"></div>

                {/* Decoration Lines */}
                <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-west-accent/30 pointer-events-none rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-west-accent/30 pointer-events-none rounded-bl-2xl"></div>

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-west-border bg-west-paper/50 flex justify-between items-start shrink-0 backdrop-blur-md relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                             <div className="bg-west-accent/10 p-3 rounded-xl border border-west-accent/20 shadow-glow">
                                {doc.mediaType === 'video' ? <FileVideo className="w-6 h-6 text-west-accent" /> : <FileText className="w-6 h-6 text-west-accent" />}
                             </div>
                             <div>
                                <h2 className="text-xl md:text-2xl font-mono text-west-text font-bold tracking-tight line-clamp-1 drop-shadow-sm">{doc.title}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-mono text-west-accent border border-west-accent/30 px-2 py-0.5 rounded bg-west-accent/5">{doc.id}</span>
                                    <span className="text-xs font-mono text-west-muted bg-west-paper/50 px-2 py-0.5 rounded border border-west-border">{doc.category}</span>
                                    <span className="text-xs font-mono text-west-muted flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
                                </div>
                             </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-west-hover rounded-full transition-colors text-west-muted hover:text-west-text border border-transparent hover:border-west-border">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - UPDATED BACKGROUND COLOR FOR LIGHT MODE LEGIBILITY */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin flex flex-col lg:flex-row gap-8 bg-west-bg/50 relative z-10">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex-1 markdown-content overflow-x-auto">
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {currentContent}
                            </Markdown>
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 pt-6 border-t border-west-border flex justify-between items-center">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-west-border rounded-lg hover:bg-west-hover disabled:opacity-30 disabled:cursor-not-allowed text-west-text flex items-center gap-2 font-mono text-xs transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> PREV
                                </button>
                                <span className="text-xs font-mono text-west-accent bg-west-accent/5 px-3 py-1 rounded border border-west-accent/20">
                                    PAGE {currentPage} / {totalPages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-west-border rounded-lg hover:bg-west-hover disabled:opacity-30 disabled:cursor-not-allowed text-west-text flex items-center gap-2 font-mono text-xs transition-colors"
                                >
                                    NEXT <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Media */}
                    {hasMedia && (
                        <div className="w-full lg:w-80 shrink-0 space-y-6">
                            <h3 className="text-xs font-mono text-west-accent border-b border-west-border pb-2 uppercase tracking-widest flex items-center gap-2 font-bold">
                                <Paperclip className="w-4 h-4" /> Attached Media
                            </h3>
                            
                            {doc.mediaUrl && (
                                <div className="border border-west-border rounded-xl bg-west-paper dark:bg-black/40 overflow-hidden shadow-lg backdrop-blur-sm">
                                    {doc.mediaType === 'video' ? (
                                        <video src={doc.mediaUrl} controls className="w-full" />
                                    ) : (
                                        <img src={doc.mediaUrl} alt="Main Media" className="w-full object-cover" />
                                    )}
                                    <div className="p-2 text-[10px] text-west-muted font-mono bg-west-bg/50 border-t border-west-border">PRIMARY_ASSET</div>
                                </div>
                            )}

                            {images.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {images.map((img, i) => (
                                        <div key={i} className="aspect-square border border-west-border rounded-xl overflow-hidden bg-west-paper dark:bg-black/40 relative group cursor-zoom-in shadow-md hover:border-west-accent/50 transition-colors">
                                            <img src={img} alt={`attachment-${i}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-west-border bg-west-paper/50 flex justify-between items-center text-[10px] font-mono text-west-muted shrink-0 backdrop-blur-md relative z-10">
                    <div>LAST UPDATED: {doc.lastUpdated}</div>
                    <div className="flex gap-4">
                        <span>SIZE: {doc.content.length} BYTES</span>
                        <span>STATUS: ARCHIVED</span>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-west-bg/20 relative transition-colors pb-24 md:pb-8">
      
      {/* DOCUMENT VIEWER MODAL */}
      {viewDoc && <DocumentViewer doc={viewDoc} onClose={() => setViewDoc(null)} />}

      {/* Header & Search */}
      <div className="flex flex-col gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-mono text-west-text tracking-widest flex items-center gap-3 drop-shadow-sm font-bold">
                    MEMORY CORE
                    <UploadCloud className="w-6 h-6 text-west-accent animate-pulse-slow" />
                </h1>
                <p className="text-west-accent/80 text-xs md:text-sm font-mono mt-2">:: DATA INGESTION & ARCHIVES</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-west-muted group-focus-within:text-west-accent transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-west-panel/50 border border-west-border text-west-text font-mono text-sm rounded-xl focus:ring-0 focus:border-west-accent block w-full pl-10 p-2.5 placeholder-west-muted transition-all shadow-sm focus:shadow-glow backdrop-blur-sm" 
                            placeholder="SEARCH DATABASE..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 border rounded-xl transition-all ${showFilters || activeFiltersCount > (searchQuery ? 1 : 0) ? 'border-west-accent bg-west-accent/10 text-west-accent' : 'border-west-border bg-west-panel/50 text-west-muted hover:text-west-text hover:bg-white/5'}`}
                        title="Advanced Filters"
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className={`
                        flex items-center justify-center gap-2 px-6 py-2.5 border font-mono text-sm transition-all min-w-[180px] rounded-full font-bold tracking-widest shadow-lg
                        ${isFormOpen 
                            ? 'border-red-500 text-red-500 bg-west-panel hover:bg-red-500/10' 
                            : 'bg-west-panel border-west-accent text-west-accent hover:bg-west-accent hover:text-west-bg hover:shadow-glow'}
                    `}
                >
                    {isFormOpen ? <span className="flex items-center gap-2"><X className="w-4 h-4" /> CANCEL</span> : <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> NEW ENTRY</span>}
                </button>
            </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
            <div className="glass-panel p-4 rounded-xl animate-in slide-in-from-top-2 duration-200 border-l-4 border-l-west-accent shadow-lg bg-west-panel/60 backdrop-blur-xl">
                {/* ... existing filter UI ... */}
                 <div className="flex items-center gap-2 mb-4 pb-2 border-b border-west-border/30">
                    <Filter className="w-3 h-3 text-west-accent" />
                    <span className="text-[10px] font-mono text-west-accent tracking-widest font-bold">ADVANCED FILTER PROTOCOLS</span>
                    <div className="ml-auto">
                        <button onClick={resetFilters} className="text-[10px] text-west-muted hover:text-red-500 flex items-center gap-1 transition-colors">
                            <RefreshCw className="w-3 h-3" /> RESET FILTERS
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {/* Category Filter */}
                     <div className="space-y-1">
                        <label className="text-[10px] text-west-muted font-mono uppercase">Category Class</label>
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full bg-west-bg/50 border border-west-border text-west-text text-xs font-mono p-2 pr-8 appearance-none focus:border-west-accent focus:outline-none rounded-lg"
                        >
                            <option value="ALL">ALL CATEGORIES</option>
                            <option value="SAFETY">SAFETY</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                            <option value="PROCEDURES">PROCEDURES</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>
                     {/* Dates */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-west-muted font-mono uppercase flex items-center gap-1">From Date</label>
                        <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full bg-west-bg/50 border border-west-border text-west-text text-xs font-mono p-2 focus:border-west-accent focus:outline-none rounded-lg" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-west-muted font-mono uppercase flex items-center gap-1">To Date</label>
                        <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full bg-west-bg/50 border border-west-border text-west-text text-xs font-mono p-2 focus:border-west-accent focus:outline-none rounded-lg" />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Ingestion Form - High Tech Data Port Style */}
      {isFormOpen && (
        <div className="mb-8 border border-white/10 bg-west-panel/80 p-6 relative backdrop-blur-2xl shadow-3d animate-in zoom-in-95 duration-300 rounded-2xl">
             {/* Tech Decoration */}
             <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-west-accent/50 rounded-tr-2xl"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-west-accent/50 rounded-bl-2xl"></div>

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-west-accent font-mono text-lg flex items-center gap-2 font-bold tracking-widest">
                    <UploadCloud className="w-5 h-5" />
                    DATA INGESTION PROTOCOL
                </h3>
                <div className="text-[10px] font-mono text-west-muted px-2 py-1 bg-west-accent/5 rounded border border-west-accent/10">SECURE CHANNEL: OPEN</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`
                            h-full min-h-[220px] border border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group
                            ${isUploading 
                                ? 'border-west-accent bg-west-accent/5 cursor-wait' 
                                : isDragging 
                                    ? 'border-west-accent bg-west-accent/20 scale-[1.02] shadow-glow'
                                    : extractionError
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-white/20 bg-black/20 hover:border-west-accent hover:bg-west-accent/5 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'}
                        `}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.docx,.doc,.xls,.xlsx,.md,.json,.csv,.jpg,.jpeg,.png,.mp4" />
                        
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-3 z-10">
                                <Loader2 className="w-12 h-12 text-west-accent animate-spin" />
                                <div className="w-full max-w-[150px] h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-west-accent transition-all duration-150 shadow-[0_0_10px_#06b6d4]" style={{width: `${uploadProgress}%`}}></div>
                                </div>
                                <span className="font-mono text-xs text-west-accent animate-pulse tracking-wide">{extractionStatusMsg}</span>
                            </div>
                        ) : fileName ? (
                            <div className="flex flex-col items-center gap-2 z-10 animate-in zoom-in">
                                <CheckCircle className={`w-12 h-12 ${extractionError ? 'text-red-500' : 'text-green-500'}`} />
                                <span className="font-mono text-sm text-west-text truncate max-w-[200px] font-bold">{fileName}</span>
                                <span className={`text-[10px] font-bold tracking-wide ${extractionError ? 'text-red-500' : 'text-green-500'}`}>{extractionError ? 'EXTRACTION FAILED' : 'UPLOAD COMPLETE'}</span>
                            </div>
                        ) : (
                            <>
                                <div className={`flex gap-3 mb-4 transition-all duration-300 ${isDragging ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}>
                                    {isDragging ? <Upload className="w-10 h-10 text-west-accent animate-bounce" /> : (
                                        <>
                                            <FileText className="w-10 h-10 text-west-muted" />
                                            <ImageIcon className="w-10 h-10 text-west-muted" />
                                        </>
                                    )}
                                </div>
                                <span className={`font-mono text-sm font-bold transition-colors ${isDragging ? 'text-west-accent' : 'text-west-text group-hover:text-west-accent'}`}>
                                    {isDragging ? 'DROP FILE TO UPLOAD' : 'DRAG & DROP OR CLICK'}
                                </span>
                                <div className="text-[10px] text-west-muted mt-2 max-w-[220px] leading-relaxed opacity-70">
                                    Supported: PDF, DOCX, XLS, Images, Text
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-west-muted font-mono uppercase mb-1">Document Title</label>
                            <input 
                                type="text" value={newTitle} onChange={(e) => handleTitleChange(e.target.value)}
                                className={`w-full bg-black/20 border p-3 text-west-text placeholder-west-muted/50 font-mono focus:outline-none transition-all text-sm rounded-xl ${duplicateError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-west-accent focus:shadow-glow'}`}
                                placeholder="e.g. Safety Protocol 7B"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-west-muted font-mono uppercase mb-1">Category</label>
                            <select 
                                value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}
                                className="w-full bg-black/20 border border-white/10 p-3 text-west-text font-mono focus:border-west-accent focus:outline-none transition-all text-sm rounded-xl"
                            >
                                <option value="SAFETY">SAFETY</option>
                                <option value="MAINTENANCE">MAINTENANCE</option>
                                <option value="PROCEDURES">PROCEDURES</option>
                                <option value="HR">HR</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="block text-[10px] text-west-muted font-mono uppercase">Extracted Content</label>
                             {extractionError && <span className="text-red-500 font-bold text-[10px] animate-pulse">ERROR: PARSING FAILED</span>}
                        </div>
                        <textarea 
                            value={newContent} onChange={(e) => setNewContent(e.target.value)}
                            className={`w-full h-32 bg-black/20 border p-3 text-west-text placeholder-west-muted/50 font-mono text-xs md:text-sm focus:outline-none resize-none transition-colors rounded-xl ${extractionError ? 'border-red-500' : 'border-white/10 focus:border-west-accent'}`}
                            placeholder="Content will appear here..."
                        />
                    </div>
                    
                    {/* Manual Image Attachment */}
                     <div className="bg-black/20 p-3 border border-white/10 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] text-west-muted font-mono uppercase">
                                Visual Attachments ({attachedImages.length})
                            </label>
                            <button onClick={() => attachmentInputRef.current?.click()} className="text-[10px] text-west-accent flex items-center gap-1 hover:underline font-bold">
                                <Plus className="w-3 h-3" /> ADD IMAGE
                            </button>
                            <input type="file" ref={attachmentInputRef} onChange={handleManualImageAttach} multiple accept="image/*" className="hidden" />
                        </div>
                        {attachedImages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                {attachedImages.map((img, idx) => (
                                    <div key={idx} className="relative group shrink-0 w-16 h-16 border border-white/20 rounded-lg overflow-hidden bg-black/50">
                                        <img src={img} alt="attach" className="w-full h-full object-cover" />
                                        <button onClick={() => removeAttachedImage(idx)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>

                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleAddDocument}
                            disabled={isUploading || !newTitle || extractionError || duplicateError}
                            className={`
                                px-6 py-3 font-mono text-sm transition-all flex items-center gap-2 rounded-xl font-bold shadow-lg
                                ${extractionError || duplicateError
                                    ? 'bg-red-500/10 border border-red-500 text-red-500 opacity-50 cursor-not-allowed'
                                    : 'bg-west-accent text-black hover:bg-cyan-400 hover:scale-105 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed'}
                            `}
                        >
                            <Save className="w-4 h-4" />
                            {duplicateError ? 'FILE EXISTS' : 'COMMIT TO MEMORY'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Cards Grid (Static Aero-Gel Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
        {filteredDocs.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-west-border text-west-muted font-mono opacity-50 rounded-2xl">
                NO RECORDS MATCHING QUERY PARAMETERS
            </div>
        )}
        {filteredDocs.map((doc) => (
            <div 
                key={doc.id} 
                onDoubleClick={() => setViewDoc(doc)}
                className="relative overflow-hidden flex flex-col h-full min-h-[200px] rounded-2xl border border-white/10 hover:border-west-accent/50 bg-west-panel/30 backdrop-blur-xl shadow-3d hover:scale-[1.01] transition-all duration-300 cursor-pointer group p-6"
            >
                {/* Aero-Gel Inner Highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl"></div>
                <div className="absolute top-0 left-0 w-1 h-0 bg-west-accent group-hover:h-full transition-all duration-500"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        {doc.mediaType === 'video' ? <FileVideo className="w-5 h-5 text-west-accent" /> :
                         doc.mediaType === 'image' ? <ImageIcon className="w-5 h-5 text-west-accent" /> :
                         <FileType className="w-5 h-5 text-west-accent" />}
                        <span className="font-mono text-west-accent text-xs tracking-wider opacity-70 group-hover:opacity-100 font-bold">{doc.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-west-muted border border-white/10 px-2 py-0.5 rounded font-mono bg-black/20 group-hover:border-west-accent/30 transition-colors">{doc.category}</span>
                        <button onClick={(e) => handleDeleteDocument(doc.id, e)} className="text-west-muted hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <h3 className="text-xl font-sans font-bold text-west-text mb-3 leading-tight group-hover:text-west-accent transition-colors line-clamp-1 drop-shadow-sm relative z-10" title={doc.title}>{doc.title}</h3>
                
                <div className="flex-1 mb-4 relative z-10">
                     <p className="text-xs font-mono text-west-muted opacity-80 line-clamp-4 leading-relaxed">
                        {doc.content}
                     </p>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-west-muted border-t border-white/10 pt-4 font-mono mt-auto relative z-10">
                    <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span>ENCRYPTED • {doc.lastUpdated}</span>
                    </div>
                    {/* Double Click Hint */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-west-accent">
                         <Maximize2 className="w-3 h-3" />
                         <span>2x CLICK</span>
                    </div>
                </div>
                
                {(doc.mediaUrl || (doc.attachedImages && doc.attachedImages.length > 0)) && (
                    <div className="absolute bottom-4 right-24 flex items-center gap-1 text-west-accent animate-pulse text-[10px] font-mono z-10">
                       <Paperclip className="w-3 h-3" />
                       <span>MEDIA</span>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
