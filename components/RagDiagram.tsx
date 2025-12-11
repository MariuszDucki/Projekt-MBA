
import React from 'react';
import { Database, Search, MessageSquare, ShieldCheck, Sparkles, Cpu, Activity, FileText, Lock, Eye, Server, Zap } from 'lucide-react';

const StepTooltip = ({ 
  text, 
  side = 'top'
}: { 
  text: string, 
  side?: 'top' | 'bottom'
}) => {
  const posClasses = side === 'top' ? "bottom-full mb-3" : "top-full mt-3";
  const arrowClasses = side === 'top' 
    ? "top-full border-t-west-border border-b-transparent" 
    : "bottom-full border-b-west-border border-t-transparent";

  return (
    <div className={`absolute ${posClasses} left-1/2 -translate-x-1/2 w-48 bg-west-panel/95 border border-west-border text-west-text text-[10px] font-mono p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 text-center backdrop-blur-md transform ${side === 'top' ? 'translate-y-2' : '-translate-y-2'} group-hover:translate-y-0`}>
      <span className="text-west-accent font-bold block mb-1">:: SYSTEM LOG ::</span>
      {text}
      <div className={`absolute ${arrowClasses} left-1/2 -translate-x-1/2 border-[6px] border-x-transparent`}></div>
    </div>
  );
};

const RagDiagram: React.FC = () => {
  // CONFIGURATION: Fixed coordinate system to ensure SVG and HTML always align
  // Total Width: 1000px (matches min-w in parent)
  const Y_CENTER = 120;
  
  const POS = {
    USER: { x: 100, y: Y_CENTER },
    GUARD: { x: 350, y: Y_CENTER },
    RETRIEVAL: { x: 600, y: Y_CENTER },
    LLM: { x: 850, y: Y_CENTER },
    // Governance Nodes positions relative to the diagram
    GOV_TOP: { x: 500, y: 40 },
    GOV_BOT: { x: 500, y: 220 }
  };

  return (
    <div className="w-full bg-west-panel/30 border border-west-border rounded-xl relative overflow-hidden p-0 min-h-[400px] flex flex-col items-center justify-center select-none">
      <div className="absolute inset-0 bg-west-bg/40 pointer-events-none"></div>
      
      {/* BACKGROUND GRID DECORATION */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, var(--accent-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Header Label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
          <div className="p-1.5 bg-west-accent/10 rounded border border-west-accent/20 backdrop-blur-md">
            <Cpu className="w-4 h-4 animate-pulse text-west-accent" />
          </div>
          <span className="text-west-accent font-mono text-xs tracking-widest font-bold opacity-80">
              RAG PIPELINE VISUALIZER
          </span>
      </div>

      {/* MAIN DIAGRAM CONTAINER - Fixed Width to prevent alignment issues */}
      <div className="relative w-[1000px] h-[300px]">
        
        {/* === LAYER 1: SVG CONNECTIONS & ANIMATIONS === */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
            <defs>
                {/* Gradient for flow lines */}
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--border-color)" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="var(--accent-color)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--border-color)" stopOpacity="0.2" />
                </linearGradient>

                {/* Flying Document Icon Definition */}
                <g id="doc-icon">
                    <rect x="-12" y="-15" width="24" height="30" rx="3" fill="var(--bg-panel)" stroke="var(--accent-color)" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                    <line x1="-7" y1="-8" x2="7" y2="-8" stroke="var(--text-muted)" strokeWidth="2" />
                    <line x1="-7" y1="0" x2="7" y2="0" stroke="var(--text-muted)" strokeWidth="2" />
                    <line x1="-7" y1="8" x2="2" y2="8" stroke="var(--text-muted)" strokeWidth="2" />
                    {/* Corner fold */}
                    <path d="M 0 -15 L 12 -3 L 12 -15 Z" fill="var(--accent-color)" opacity="0.5" />
                </g>
                
                {/* Particle Effect for tails */}
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* MAIN DATA BUS LINE */}
            <path 
                d={`M ${POS.USER.x} ${POS.USER.y} L ${POS.LLM.x} ${POS.LLM.y}`} 
                stroke="url(#flowGradient)" 
                strokeWidth="2" 
                fill="none"
            />

            {/* GOVERNANCE CONNECTIONS (Dashed) */}
            {/* Guard -> Gov */}
            <path d={`M ${POS.GUARD.x} ${POS.GUARD.y - 40} Q ${POS.GUARD.x} ${POS.GOV_TOP.y}, ${POS.GUARD.x + 50} ${POS.GOV_TOP.y}`} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
            {/* Gov -> LLM */}
            <path d={`M ${POS.RETRIEVAL.x} ${POS.RETRIEVAL.y + 40} Q ${POS.RETRIEVAL.x} ${POS.GOV_BOT.y}, ${POS.RETRIEVAL.x + 50} ${POS.GOV_BOT.y}`} fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />

            {/* === ADVANCED ANIMATION: FLYING DOCUMENT === */}
            <g>
                {/* The Document Object */}
                <use href="#doc-icon">
                    <animateMotion 
                        dur="6s" 
                        repeatCount="indefinite"
                        path={`M ${POS.USER.x} ${POS.USER.y} L ${POS.LLM.x} ${POS.LLM.y}`}
                        keyPoints="0;0.33;0.66;1"
                        keyTimes="0;0.4;0.7;1"
                        calcMode="linear"
                    />
                    {/* Scale effect at nodes */}
                    <animateTransform 
                        attributeName="transform" 
                        type="scale" 
                        values="1; 1.2; 1; 1.2; 1; 1.2; 1" 
                        keyTimes="0; 0.33; 0.35; 0.66; 0.68; 0.98; 1" 
                        dur="6s" 
                        repeatCount="indefinite" 
                        additive="sum"
                    />
                </use>

                {/* Scanning Laser Effect (Vertical line that moves with doc) */}
                <rect x="-15" y="-20" width="30" height="2" fill="#ef4444" opacity="0">
                     <animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.3;0.4;1" dur="6s" repeatCount="indefinite" />
                     <animateMotion dur="6s" repeatCount="indefinite" path={`M ${POS.USER.x} ${POS.USER.y} L ${POS.LLM.x} ${POS.LLM.y}`} />
                     <animateTransform attributeName="transform" type="translate" values="0 -10; 0 30" dur="1s" repeatCount="indefinite" additive="sum" />
                </rect>
            </g>

            {/* Return Path (Response) - Faster Particle */}
            <circle r="3" fill="var(--accent-color)" filter="url(#glow)">
                <animateMotion 
                    dur="2s" 
                    begin="3s"
                    repeatCount="indefinite"
                    path={`M ${POS.LLM.x} ${POS.LLM.y + 10} Q ${(POS.USER.x + POS.LLM.x)/2} ${POS.LLM.y + 60} ${POS.USER.x} ${POS.USER.y + 10}`}
                />
                 <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2s" repeatCount="indefinite" />
            </circle>

        </svg>

        {/* === LAYER 2: HTML NODES (Absolute Positioning) === */}
        
        {/* NODE 1: USER */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-help" style={{ left: POS.USER.x, top: POS.USER.y }}>
            <div className="w-20 h-20 rounded-full border-2 border-west-border bg-west-panel flex items-center justify-center shadow-lg group-hover:border-west-text transition-all duration-300 relative">
                <div className="absolute inset-0 rounded-full bg-west-accent/5 animate-ping opacity-0 group-hover:opacity-100"></div>
                <MessageSquare className="w-8 h-8 text-west-text" />
            </div>
            <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center w-32">
                <div className="text-xs font-mono font-bold text-west-text">USER QUERY</div>
                <div className="text-[9px] text-west-muted mt-1">Input Normalization</div>
            </div>
            <StepTooltip text="Początek przepływu. Zapytanie użytkownika jest normalizowane i wstępnie procesowane." />
        </div>

        {/* NODE 2: GUARDRAILS */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-help" style={{ left: POS.GUARD.x, top: POS.GUARD.y }}>
            <div className="w-20 h-20 rounded-xl border-2 border-red-500/30 bg-red-500/5 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:bg-red-500/10 group-hover:scale-110 transition-all duration-300">
                <ShieldCheck className="w-9 h-9 text-red-500" />
                <div className="absolute -top-2 -right-2 bg-west-bg border border-red-500/50 rounded-full p-1">
                    <Lock className="w-3 h-3 text-red-500" />
                </div>
            </div>
            <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center w-32">
                <div className="text-xs font-mono font-bold text-red-500">GUARDRAILS</div>
                <div className="text-[9px] text-west-muted mt-1">PII Scrubbing & Security</div>
            </div>
            <StepTooltip text="Analiza bezpieczeństwa. Wykrywanie danych wrażliwych (PII) i prób ataku (Injection)." />
        </div>

        {/* NODE 3: RETRIEVAL */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-help" style={{ left: POS.RETRIEVAL.x, top: POS.RETRIEVAL.y }}>
             {/* Database Stack Effect */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                 <div className="w-8 h-2 bg-west-accent/20 rounded-full border border-west-accent/40"></div>
                 <div className="w-8 h-2 bg-west-accent/20 rounded-full border border-west-accent/40"></div>
                 <div className="w-8 h-2 bg-west-accent/20 rounded-full border border-west-accent/40"></div>
            </div>
            
            <div className="w-20 h-20 rounded border-2 border-west-accent bg-west-accent/10 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:bg-west-accent/20 transition-all duration-300 backdrop-blur-sm">
                <Database className="w-9 h-9 text-west-accent" />
            </div>
            <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center w-32">
                <div className="text-xs font-mono font-bold text-west-accent">VECTOR RAG</div>
                <div className="text-[9px] text-west-muted mt-1">Semantic Search</div>
            </div>
             <StepTooltip text="Wyszukiwanie wektorowe. Znajdowanie relewantnych dokumentów w bazie wiedzy." />
        </div>

        {/* NODE 4: LLM */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-help" style={{ left: POS.LLM.x, top: POS.LLM.y }}>
            <div className="w-24 h-24 rounded-full border-4 double border-west-text bg-gradient-to-br from-west-panel to-west-bg flex items-center justify-center shadow-glow group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-west-accent/20 to-transparent animate-pulse-slow"></div>
                {/* Rotating Ring */}
                <div className="absolute inset-0 border-t-2 border-west-accent/50 rounded-full animate-[spin_4s_linear_infinite]"></div>
                
                <Sparkles className="w-10 h-10 text-west-text animate-pulse relative z-10" />
            </div>
            <div className="absolute top-28 left-1/2 -translate-x-1/2 text-center w-32">
                <div className="text-sm font-sans font-bold text-west-text tracking-wider">GEMINI 2.5</div>
                <div className="text-[9px] text-west-muted mt-1">Context Synthesis</div>
            </div>
             <StepTooltip text="Generowanie odpowiedzi. LLM łączy kontekst z zapytaniem użytkownika." />
        </div>

        {/* === LAYER 3: GOVERNANCE OVERLAYS (Floating Panels) === */}
        
        {/* Top: Policy Check */}
        <div className="absolute p-3 rounded-lg border border-red-500/30 bg-west-panel/80 backdrop-blur-md shadow-lg flex items-center gap-3 animate-float" 
             style={{ left: POS.GUARD.x + 80, top: POS.GOV_TOP.y - 20 }}>
            <div className="p-1.5 bg-red-500/10 rounded-full animate-pulse">
                <Activity className="w-4 h-4 text-red-500" />
            </div>
            <div>
                <div className="text-[9px] font-mono text-west-muted uppercase">Risk Check</div>
                <div className="text-[10px] font-bold text-red-500">ISO 42001</div>
            </div>
        </div>

        {/* Bottom: Context Audit */}
        <div className="absolute p-3 rounded-lg border border-west-accent/30 bg-west-panel/80 backdrop-blur-md shadow-lg flex items-center gap-3 animate-float-delayed" 
             style={{ left: POS.RETRIEVAL.x + 80, top: POS.GOV_BOT.y }}>
             <div className="p-1.5 bg-west-accent/10 rounded-full">
                <FileText className="w-4 h-4 text-west-accent" />
            </div>
            <div>
                <div className="text-[9px] font-mono text-west-muted uppercase">Audit Log</div>
                <div className="text-[10px] font-bold text-west-accent">RECORDED</div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RagDiagram;
