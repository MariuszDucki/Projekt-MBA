
import React, { useState } from 'react';
import { X, FileText, UploadCloud, MessageSquare, ShieldAlert, Layers, BookOpen, Lock, Activity, ChevronRight, Server, Terminal } from 'lucide-react';

interface UserManualProps {
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const menuItems = [
      { id: 'overview', label: 'System Overview', icon: Activity },
      { id: 'memory', label: 'Memory Core (RAG)', icon: UploadCloud },
      { id: 'neural', label: 'Neural Link', icon: MessageSquare },
      { id: 'agent', label: 'Agent Mode', icon: ShieldAlert },
  ];

  return (
    // UPDATED OVERLAY: Uses slate-900/20 in light mode for contrast, black/60 in dark mode.
    <div className="fixed inset-0 z-[100] bg-slate-900/20 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in zoom-in-95 fade-in duration-300">
      
      {/* UPDATED MODAL CONTAINER: Increased translucency (bg-west-panel/90 & /60) to emphasize backdrop-blur-2xl */}
      <div className="w-full max-w-6xl bg-west-panel/90 dark:bg-west-panel/60 border border-west-glassBorder shadow-3d rounded-3xl flex flex-col h-full max-h-[90vh] overflow-hidden relative backdrop-blur-2xl">
        
        {/* Aero-Gel Inner Highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 pointer-events-none rounded-3xl"></div>

        {/* Header */}
        <div className="p-4 md:p-6 border-b border-west-border bg-west-paper/50 flex justify-between items-center shrink-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="bg-west-accent/10 p-2.5 rounded-xl border border-west-accent/20 shadow-glow">
                <BookOpen className="w-6 h-6 text-west-accent" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-mono text-west-text font-bold tracking-tight drop-shadow-sm">OPERATIONAL MANUAL</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-west-accent border border-west-accent/30 px-1.5 py-0.5 rounded bg-west-accent/5">v1.4.2</span>
                    <span className="text-[10px] font-mono text-west-muted uppercase">Interactive Documentation</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-west-hover rounded-full transition-colors text-west-muted hover:text-west-alert border border-transparent hover:border-west-alert/30">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body with Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
             
             {/* Sidebar Navigation */}
             <div className="w-full md:w-64 bg-west-bg/50 border-b md:border-b-0 md:border-r border-west-border p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
                <div className="text-[10px] font-mono text-west-muted uppercase tracking-widest mb-2 pl-2 font-bold">Table of Contents</div>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`
                            flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-sm font-mono group
                            ${activeSection === item.id 
                                ? 'bg-west-accent/10 border border-west-accent/30 text-west-text shadow-sm' 
                                : 'text-west-muted hover:bg-west-hover border border-transparent'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-west-accent' : 'text-west-muted group-hover:text-west-text'}`} />
                            <span className={activeSection === item.id ? 'font-bold' : ''}>{item.label}</span>
                        </div>
                        {activeSection === item.id && <ChevronRight className="w-3 h-3 text-west-accent" />}
                    </button>
                ))}
                
                <div className="mt-auto p-4 rounded-xl bg-west-bg/50 border border-west-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-3 h-3 text-west-accent" />
                        <span className="text-[10px] font-mono font-bold text-west-text">SECURE ACCESS</span>
                    </div>
                    <p className="text-[10px] text-west-muted leading-relaxed">
                        Dokumentacja jest szyfrowana. Kopiowanie bez autoryzacji zabronione.
                    </p>
                </div>
             </div>

             {/* Main Scrollable Area */}
             <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin bg-west-bg/30">
                <div className="max-w-3xl mx-auto space-y-8 pb-10">
                    
                    {/* OVERVIEW */}
                    {activeSection === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                             <h3 className="text-2xl font-sans font-bold text-west-text mb-4 flex items-center gap-3 border-b border-west-border pb-2">
                                <Activity className="w-6 h-6 text-west-accent" />
                                SYSTEM OVERVIEW
                            </h3>
                            <div className="bg-west-paper p-6 rounded-2xl border border-west-border shadow-sm">
                                <p className="text-base text-west-secondary leading-relaxed mb-6 font-medium">
                                    DELOS-AI to Twój inteligentny asystent operacyjny. W przeciwieństwie do zwykłego czata, ten system 
                                    <strong className="text-west-accent"> widzi, słyszy i ma dostęp do firmowej bazy wiedzy</strong>. 
                                    Jego zadaniem jest pomóc Ci w szybkim dotarciu do procedur, rozwiązywaniu awarii oraz zgłaszaniu incydentów bez odrywania rąk od pracy.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-west-bg/50 border border-west-border">
                                        <div className="text-xs font-mono text-west-muted uppercase mb-1">Architecture</div>
                                        <div className="font-bold text-west-text">Gemini 2.5 Flash + RAG</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-west-bg/50 border border-west-border">
                                        <div className="text-xs font-mono text-west-muted uppercase mb-1">Latency</div>
                                        <div className="font-bold text-west-text text-green-500">Real-time (400ms)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MEMORY CORE */}
                    {activeSection === 'memory' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-2xl font-sans font-bold text-west-text mb-4 flex items-center gap-3 border-b border-west-border pb-2">
                                <UploadCloud className="w-6 h-6 text-west-accent" />
                                MEMORY CORE
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="bg-west-paper p-6 rounded-2xl border border-west-border shadow-sm">
                                    <h4 className="font-mono font-bold text-west-text mb-4 text-sm uppercase">Data Ingestion Protocol</h4>
                                    <ol className="list-decimal list-inside space-y-3 text-sm text-west-secondary font-mono">
                                        <li className="p-2 hover:bg-west-hover rounded transition-colors">Przejdź do zakładki <strong>MEMORY</strong> w menu bocznym.</li>
                                        <li className="p-2 hover:bg-west-hover rounded transition-colors">Kliknij przycisk <span className="text-west-accent border border-west-accent/30 px-1 rounded bg-west-accent/10">NEW ENTRY</span>.</li>
                                        <li className="p-2 hover:bg-west-hover rounded transition-colors">Przeciągnij plik (PDF, DOCX, Excel, TXT, Zdjęcie) na strefę zrzutu.</li>
                                        <li className="p-2 hover:bg-west-hover rounded transition-colors">Uzupełnij metadane (Kategoria, Tytuł).</li>
                                        <li className="p-2 hover:bg-west-hover rounded transition-colors">Kliknij <strong>COMMIT TO MEMORY</strong>, aby zindeksować wiedzę.</li>
                                    </ol>
                                </div>

                                <div className="p-4 bg-west-warn/10 border border-west-warn/30 rounded-xl flex gap-3 items-start">
                                    <ShieldAlert className="w-5 h-5 text-west-warn shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-west-warn uppercase mb-1">Excel Warning</div>
                                        <p className="text-xs text-west-text/80">
                                            System czyta dane z komórek arkuszy, ale nie widzi dynamicznych wykresów XML. 
                                            Jeśli masz wykresy w Excelu, wklej je jako obrazy do arkusza przed wgraniem lub dodaj jako osobne załączniki.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NEURAL LINK */}
                    {activeSection === 'neural' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                             <h3 className="text-2xl font-sans font-bold text-west-text mb-4 flex items-center gap-3 border-b border-west-border pb-2">
                                <MessageSquare className="w-6 h-6 text-west-accent" />
                                NEURAL LINK
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-5 border border-west-border rounded-2xl bg-west-paper hover:border-west-accent/50 transition-all group">
                                    <div className="p-2 bg-west-bg rounded-lg w-fit mb-3 group-hover:bg-west-accent/10 transition-colors">
                                        <Terminal className="w-5 h-5 text-west-text group-hover:text-west-accent" />
                                    </div>
                                    <strong className="block text-west-text mb-2 font-mono text-sm uppercase">Multimodal Input</strong>
                                    <ul className="list-disc list-inside text-xs space-y-2 text-west-secondary">
                                        <li><strong>Tekst:</strong> Klasyczna konsola poleceń.</li>
                                        <li><strong>Głos:</strong> Kliknij mikrofon (ASR). Idealne w rękawicach.</li>
                                        <li><strong>Vision:</strong> Wyślij zdjęcie maszyny do analizy.</li>
                                    </ul>
                                </div>
                                <div className="p-5 border border-west-border rounded-2xl bg-west-paper hover:border-west-accent/50 transition-all group">
                                    <div className="p-2 bg-west-bg rounded-lg w-fit mb-3 group-hover:bg-west-accent/10 transition-colors">
                                        <Layers className="w-5 h-5 text-west-text group-hover:text-west-accent" />
                                    </div>
                                    <strong className="block text-west-text mb-2 font-mono text-sm uppercase">Generative UI</strong>
                                    <ul className="list-disc list-inside text-xs space-y-2 text-west-secondary">
                                        <li><strong>Checklisty:</strong> Interaktywne listy kroków.</li>
                                        <li><strong>Telemetria:</strong> Wizualizacja danych "na żywo".</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AGENT MODE */}
                    {activeSection === 'agent' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                             <h3 className="text-2xl font-sans font-bold text-west-text mb-4 flex items-center gap-3 border-b border-west-border pb-2">
                                <ShieldAlert className="w-6 h-6 text-west-accent" />
                                AGENT MODE
                            </h3>
                            
                            <div className="bg-west-paper border border-west-border p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-sm">
                                <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 shrink-0 shadow-glow shadow-red-500/20 animate-pulse-slow">
                                    <Server className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-west-text mb-2 text-sm uppercase font-mono">Autonomous Ticketing</h4>
                                    <p className="text-sm text-west-secondary mb-4 leading-relaxed">
                                        System posiada uprawnienia do samodzielnego tworzenia biletów w systemie ITSM.
                                        Wystarczy wydać polecenie naturalnym językiem, a agent sam skategoryzuje zgłoszenie.
                                    </p>
                                    <div className="bg-west-bg/80 border border-west-border rounded-xl p-3">
                                        <div className="text-[10px] text-west-muted font-mono mb-1">EXAMPLE PROMPT:</div>
                                        <code className="text-west-accent font-mono text-xs">
                                            "Zgłoś awarię podajnika na linii 3, priorytet wysoki, urwany pas."
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
             </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-west-border bg-west-paper/50 flex justify-between items-center text-[10px] font-mono text-west-muted shrink-0 backdrop-blur-md z-10">
            <div>LAST UPDATED: 2024-03-20</div>
            <div className="flex gap-4">
                <span>SIZE: 42 KB</span>
                <span>STATUS: ARCHIVED</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
