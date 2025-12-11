
import React from 'react';
import { Database, Search, BrainCircuit, MessageSquare, ShieldCheck, Sparkles, Cpu, Activity, FileText, Lock, Eye, Server } from 'lucide-react';

const StepTooltip = ({ 
  text, 
  align = 'center', 
  forceBottomMobile = false 
}: { 
  text: string, 
  align?: 'center' | 'start' | 'end',
  forceBottomMobile?: boolean 
}) => {
  let containerPos = "left-1/2 -translate-x-1/2";
  let arrowPos = "left-1/2 -translate-x-1/2";

  if (align === 'start') {
    containerPos = "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0";
    arrowPos = "left-1/2 -translate-x-1/2 md:left-10";
  } else if (align === 'end') {
    containerPos = "left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0";
    arrowPos = "left-1/2 -translate-x-1/2 md:left-auto md:right-10";
  }

  let posClasses = "bottom-full mb-4";
  let arrowClasses = "top-full border-t-white dark:border-t-zinc-950 border-t-west-border";

  if (forceBottomMobile) {
    posClasses = "top-full mt-4 md:top-auto md:bottom-full md:mb-4 md:mt-0";
    arrowClasses = `
        bottom-full border-b-white dark:border-b-zinc-950 
        md:bottom-auto md:top-full md:border-b-transparent md:border-t-west-border
    `;
  }

  return (
    <div className={`absolute ${posClasses} ${containerPos} w-48 md:w-56 bg-west-panel border border-west-border text-west-text text-[10px] md:text-[11px] font-mono p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 text-center backdrop-blur-md transform translate-y-2 group-hover:translate-y-0`}>
      <span className="text-west-accent font-bold block mb-1">:: PROTOCOL LOG ::</span>
      {text}
      <div className={`absolute ${arrowClasses} ${arrowPos} border-[6px] border-transparent transform -translate-x-1/2`}></div>
    </div>
  );
};

const ConnectionLine = ({ delay }: { delay: string }) => (
    <>
        <div className="hidden md:flex flex-1 h-[2px] bg-west-border relative overflow-hidden self-center mx-2 opacity-50">
           <div className={`absolute inset-0 bg-west-accent w-1/2 animate-[shimmer_2s_infinite_${delay}] opacity-80`}></div>
        </div>
        <div className="md:hidden h-8 w-[2px] bg-west-border self-center my-1 opacity-50"></div>
    </>
);

const RagDiagram: React.FC = () => {
  return (
    <div className="w-full bg-west-panel/50 border border-west-border rounded-xl relative overflow-visible p-4 md:p-8 min-h-[550px] flex flex-col">
      <div className="absolute inset-0 bg-west-bg/30 pointer-events-none rounded-xl"></div>
      
      {/* Header */}
      <div className="hidden md:flex absolute top-6 left-6 md:left-8 items-center gap-2 z-30 whitespace-nowrap">
          <div className="p-1.5 bg-west-accent/10 rounded border border-west-accent/20 backdrop-blur-md">
            <Cpu className="w-5 h-5 animate-pulse text-west-accent" />
          </div>
          <h3 className="text-west-accent font-mono text-lg tracking-widest font-bold drop-shadow-sm bg-west-panel/90 px-4 py-1.5 rounded border border-west-border shadow-sm">
              ENTERPRISE RAG ARCHITECTURE
          </h3>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 pt-12 md:pt-20 relative">
        
        {/* SVG CONNECTIONS (GLOBAL LAYER) */}
        {/* UPDATED COORDINATES: Adjusted Start/End points to align with center of icons (Y=120 approx) and center of right panel */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block z-0" style={{ overflow: 'visible' }}>
            {/* Path 1: From Guardrails (Item 2 - approx x=200) to Governance (Right - x=710) */}
            <path 
                d="M 200 120 C 200 20, 710 20, 710 120" 
                fill="none" 
                stroke="#ef4444" 
                strokeOpacity="0.6" 
                strokeWidth="2" 
                strokeDasharray="8,4"
                className="animate-flow" 
            />
            
            {/* Path 2: From LLM (Item 4 - approx x=570) to Governance (Right - x=710) */}
            <path 
                d="M 570 120 C 570 20, 710 20, 710 120" 
                fill="none" 
                stroke="#06b6d4" 
                strokeOpacity="0.6" 
                strokeWidth="2" 
                strokeDasharray="8,4"
                className="animate-flow" 
            />
            
            {/* Moving Dots on paths */}
            <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                 <animateMotion dur="4s" repeatCount="indefinite" path="M 200 120 C 200 20, 710 20, 710 120" />
            </circle>
             <circle r="4" fill="#06b6d4" className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                 <animateMotion dur="3s" repeatCount="indefinite" path="M 570 120 C 570 20, 710 20, 710 120" />
            </circle>
        </svg>

        {/* LEFT COLUMN: PROCESSING PIPELINE */}
        <div className="flex-1 flex flex-col md:flex-row justify-between items-center gap-2 relative z-10">
            
            {/* STEP 1: USER INTERFACE */}
            <div className="flex flex-col items-center z-10 hover:z-50 group w-full md:w-auto relative cursor-help">
            <StepTooltip text="User Interface: Query Processing & Input Normalization." align="start" forceBottomMobile={true} />
            
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-west-muted bg-west-bg flex items-center justify-center group-hover:border-west-text transition-all relative shadow-lg">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-west-text" />
            </div>
            <div className="mt-4 text-center">
                <p className="text-xs md:text-sm font-mono font-bold text-west-text">USER UI</p>
            </div>
            </div>

            <ConnectionLine delay="0s" />

            {/* STEP 2: GUARDRAILS & INGESTION (X ≈ 200 center) */}
            <div className="flex flex-col items-center z-10 hover:z-50 group w-full md:w-auto relative cursor-help">
            <StepTooltip text="Data Ingestion & Safety Filter (PII Redaction)." forceBottomMobile={true} />
            
            <div className="relative">
                {/* Simulated Ingestion Pipeline Below */}
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-32 border border-west-border bg-west-panel rounded p-2 text-center backdrop-blur-sm hidden md:block">
                    <div className="text-[9px] font-mono text-west-muted mb-1">DATA PIPELINE</div>
                    <div className="flex justify-center gap-2">
                         <FileText className="w-4 h-4 text-west-muted" />
                         <Server className="w-4 h-4 text-west-muted" />
                    </div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-[1px] bg-west-border border-l border-dashed border-west-muted"></div>
                </div>

                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-red-500/50 bg-red-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:bg-red-500/20 transition-all relative">
                    <ShieldCheck className="w-8 h-8 text-red-500" />
                </div>
            </div>
            <div className="mt-4 text-center">
                <p className="text-xs md:text-sm font-mono font-bold text-red-500">GUARDRAILS</p>
            </div>
            </div>

            <ConnectionLine delay="0.5s" />

            {/* STEP 3: RETRIEVAL & VECTOR DB */}
            <div className="flex flex-col items-center z-10 hover:z-50 relative group w-full md:w-auto cursor-help">
            <StepTooltip text="Retrieval Mechanism: Cosine Similarity against Vector Index." />

            {/* Floating Database Box */}
            <div className="hidden md:block absolute -top-24 left-1/2 -translate-x-1/2 mb-6 p-2 border border-west-accent/50 bg-west-panel/90 rounded text-center w-32 shadow-[0_0_15px_rgba(6,182,212,0.15)] z-0 backdrop-blur">
                <Database className="w-5 h-5 text-west-accent mx-auto mb-1" />
                <span className="text-[9px] font-mono text-west-accent block font-bold">VECTOR DB</span>
            </div>
            <div className="hidden md:block absolute -top-12 h-12 w-[1px] bg-west-accent/50 z-0"></div>

            <div className="w-16 h-16 md:w-20 md:h-20 rounded border-2 border-west-accent bg-west-accent/10 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] relative z-10 backdrop-blur-sm bg-west-bg/80 group-hover:bg-west-accent/20 transition-all">
                <Search className="w-8 h-8 text-west-accent" />
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-xs md:text-sm font-mono font-bold text-west-accent">RETRIEVAL</p>
            </div>
            </div>

            <ConnectionLine delay="1s" />

            {/* STEP 4: LLM (X ≈ 570 center) */}
            <div className="flex flex-col items-center z-10 hover:z-50 group w-full md:w-auto relative cursor-help">
            <StepTooltip text="LLM Core: Gemini 2.5 Flash generating context-aware response." />

            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-double border-west-text bg-gradient-to-br from-west-panel to-west-bg flex items-center justify-center shadow-glow relative overflow-hidden group-hover:shadow-glow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-west-accent/20 to-transparent animate-pulse-slow"></div>
                <Sparkles className="w-10 h-10 text-west-text animate-pulse" />
                <div className="absolute inset-0 border-t border-west-text/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-xs md:text-base font-bold font-sans text-west-text tracking-wide">GEMINI 2.5</p>
            </div>
            </div>

        </div>

        {/* RIGHT COLUMN: GOVERNANCE LAYER (ISO 42001) - X Start ≈ 710 */}
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-west-border md:pl-8 pt-8 md:pt-0 flex flex-col justify-center relative z-10">
            <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-8 h-8 bg-west-bg border border-west-border rounded-full items-center justify-center hidden md:flex z-10">
                <Activity className="w-4 h-4 text-west-muted" />
            </div>

            <div className="bg-west-panel border border-blue-500/30 rounded-xl p-4 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-3xl"></div>
                
                <h4 className="text-blue-500 font-mono font-bold text-xs mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    AI GOVERNANCE
                </h4>
                
                <div className="space-y-3">
                    <div className="bg-west-bg/50 p-2 rounded border border-west-border flex items-center gap-2">
                        <Lock className="w-3 h-3 text-west-muted" />
                        <span className="text-[10px] font-mono text-west-text">Policy & Risk Mgmt</span>
                    </div>
                    <div className="bg-west-bg/50 p-2 rounded border border-west-border flex items-center gap-2">
                        <FileText className="w-3 h-3 text-west-muted" />
                        <span className="text-[10px] font-mono text-west-text">Audit Trail</span>
                    </div>
                    <div className="bg-west-bg/50 p-2 rounded border border-west-border flex items-center gap-2">
                        <Eye className="w-3 h-3 text-west-muted" />
                        <span className="text-[10px] font-mono text-west-text">Human Oversight</span>
                    </div>
                    <div className="bg-west-bg/50 p-2 rounded border border-west-border flex items-center gap-2">
                        <Activity className="w-3 h-3 text-west-muted" />
                        <span className="text-[10px] font-mono text-west-text">Performance Mon.</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-west-border text-[9px] font-mono text-blue-500/80 text-center">
                    ISO 42001 COMPLIANT
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RagDiagram;
