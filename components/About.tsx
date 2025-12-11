
import React, { useState } from 'react';
import { Cpu, Shield, Zap, Eye, Mic, Database, Layers, UserCheck, BookOpen, ChevronRight, Activity, Server, Lock, Fingerprint } from 'lucide-react';
import UserManual from './UserManual';

const About: React.FC = () => {
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-west-bg/20 relative transition-all duration-700 pb-24 md:pb-8">
      {/* Manual Overlay */}
      {showManual && <UserManual onClose={() => setShowManual(false)} />}

      {/* Header */}
      <div className="mb-8 md:mb-10 border-b border-west-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in slide-in-from-top-4 duration-500">
        <div>
            <h1 className="text-2xl md:text-3xl font-mono text-west-text tracking-widest flex items-center gap-3 font-bold drop-shadow-sm">
            SYSTEM IDENTITY
            <UserCheck className="w-6 h-6 text-west-accent animate-pulse-slow" />
            </h1>
            <p className="text-west-accent/80 text-xs md:text-sm font-mono mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-west-accent rounded-full animate-pulse"></span>
                :: SPECIFICATION :: CAPABILITIES :: PROTOCOLS
            </p>
        </div>
        <button 
            onClick={() => setShowManual(true)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-west-panel/80 border border-west-accent/30 text-west-accent hover:bg-west-accent hover:text-black transition-all shadow-lg hover:shadow-glow font-mono text-sm rounded-xl font-bold backdrop-blur-md"
        >
            <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
            OPEN USER MANUAL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-in slide-in-from-bottom-2 duration-700">
        
        {/* Main Identity Card (Glass Monolith) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Section: Who am I */}
          <div className="relative overflow-hidden rounded-3xl border border-west-border bg-west-panel/40 backdrop-blur-xl shadow-3d p-6 md:p-8 group hover:border-west-accent/30 transition-all duration-500">
             {/* Aero-Gel Inner Highlight */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl"></div>
             
             <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10">
                <div className="shrink-0 flex items-start justify-center">
                    {/* UPDATED ICON CONTAINER: Adaptive gradient (Silver in Light, Black in Dark) */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-west-panel to-slate-200 dark:to-black border border-west-accent/50 flex items-center justify-center shadow-glow relative">
                        <Cpu className="w-12 h-12 text-west-accent drop-shadow-md" />
                        {/* UPDATED BADGE: High contrast background and accent text */}
                        <div className="absolute -bottom-2 -right-2 bg-west-panel border border-west-border px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-west-accent shadow-sm">v.1.4.2</div>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-sans font-bold text-west-text mb-3">DELOS-AI INDUSTRIAL CORE</h2>
                    <p className="text-sm md:text-base text-west-muted font-mono leading-relaxed mb-4">
                        Autonomiczny system wsparcia operacyjnego klasy Enterprise. Zaprojektowany do pracy w środowisku przemysłowym, zintegrowany z bazą wiedzy (RAG) oraz systemami telemetrii w czasie rzeczywistym.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-mono rounded font-bold">OPERATIONAL</span>
                        <span className="px-2 py-1 bg-west-accent/10 border border-west-accent/30 text-west-accent text-[10px] font-mono rounded font-bold">GEMINI-2.5-FLASH</span>
                        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-500 text-[10px] font-mono rounded font-bold">VECTOR-RAG</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Section: Capabilities Grid */}
          <div>
             <h3 className="text-sm font-mono text-west-muted uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-west-border pb-2">
                <Layers className="w-4 h-4" /> Core Modules
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { icon: Database, title: "Knowledge Retrieval", desc: "Semantyczne przeszukiwanie dokumentacji technicznej i procedur." },
                    { icon: Eye, title: "Visual Inspection", desc: "Analiza obrazu (Vision) w celu detekcji usterek i anomalii." },
                    { icon: Mic, title: "Voice Command", desc: "Interfejs głosowy (ASR/TTS) dla operatorów w rękawicach." },
                    { icon: Activity, title: "Telemetry Stream", desc: "Wizualizacja parametrów pracy maszyn w czasie rzeczywistym." }
                ].map((item, idx) => (
                    <div key={idx} className="group p-4 rounded-2xl bg-west-panel/30 border border-west-border hover:bg-west-panel/50 hover:border-west-accent/30 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <item.icon className="w-6 h-6 text-west-accent mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-sans font-bold text-west-text mb-1">{item.title}</h4>
                        <p className="text-xs text-west-muted font-mono leading-relaxed">{item.desc}</p>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Specs (Right Column) */}
        <div className="space-y-6">
            {/* Tech Specs Panel */}
            <div className="rounded-3xl border border-west-border bg-west-panel/40 backdrop-blur-xl shadow-3d p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-west-accent/5 rounded-bl-3xl"></div>
                <h3 className="text-sm font-mono text-west-text font-bold uppercase mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4 text-west-accent" /> Specification
                </h3>
                
                <div className="space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-west-border/30 pb-2">
                        <span className="text-west-muted">Model Architecture</span>
                        <span className="text-west-text font-bold">Transformer</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-west-border/30 pb-2">
                        <span className="text-west-muted">Context Window</span>
                        <span className="text-west-text font-bold">1M Tokens</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-west-border/30 pb-2">
                        <span className="text-west-muted">Knowledge Cutoff</span>
                        <span className="text-west-text font-bold">Live Index</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-west-border/30 pb-2">
                        <span className="text-west-muted">Response Latency</span>
                        <span className="text-green-500 font-bold">~400ms</span>
                    </div>
                </div>

                {/* System Resources */}
                <div className="mt-6 p-3 bg-west-bg/50 rounded-xl border border-west-border shadow-inner">
                    <div className="text-[10px] text-west-muted uppercase mb-2">System Resources</div>
                    <div className="w-full h-1.5 bg-west-border/20 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-west-accent w-[45%] animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-west-muted">
                        <span>CPU: 45%</span>
                        <span>MEM: 12GB</span>
                    </div>
                </div>
            </div>

            {/* Compliance Panel */}
            <div className="rounded-3xl border border-west-border bg-west-panel/40 backdrop-blur-xl shadow-3d p-6 relative group hover:border-red-500/30 transition-colors">
                <h3 className="text-sm font-mono text-west-text font-bold uppercase mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-west-warn" /> Security Protocols
                </h3>
                
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-xs font-mono text-west-muted group-hover:text-west-text transition-colors">
                        <Lock className="w-3 h-3 text-west-accent" />
                        <span>AES-256 Encryption (At Rest)</span>
                    </li>
                    <li className="flex items-center gap-3 text-xs font-mono text-west-muted group-hover:text-west-text transition-colors">
                        <Fingerprint className="w-3 h-3 text-west-accent" />
                        <span>Biometric Access Control</span>
                    </li>
                    <li className="flex items-center gap-3 text-xs font-mono text-west-muted group-hover:text-west-text transition-colors">
                        <Zap className="w-3 h-3 text-west-accent" />
                        <span>Prompt Injection Firewall</span>
                    </li>
                </ul>
                
                <div className="mt-6 pt-4 border-t border-west-border/30">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-west-muted">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        ISO 42001 COMPLIANT
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default About;
