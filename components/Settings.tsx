
import React, { useState, useEffect } from 'react';
import { Theme, AuditLogEntry } from '../types';
import { Moon, Sun, Monitor, CheckCircle, AlertTriangle, Wifi, Shield, Cpu, Network, FileText, Lock, Activity, Zap } from 'lucide-react';
import RagDiagram from './RagDiagram';
import { getAuditLog, clearAuditLog } from '../services/securityService';

interface SettingsProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentTheme, onThemeChange }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
      const fetchLogs = () => {
          setLogs(getAuditLog());
      };
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
  }, []);

  const handleThemeSwitch = (theme: Theme) => {
    setIsTransitioning(true);
    onThemeChange(theme);
    setTimeout(() => setIsTransitioning(false), 500);
  };
  
  const ThemeOption = ({ id, label, icon: Icon, color }: { id: Theme, label: string, icon: any, color: string }) => {
    const isActive = currentTheme === id;
    return (
      <button
        onClick={() => handleThemeSwitch(id)}
        className={`
          relative group flex-1 p-6 rounded-2xl border transition-all duration-300 ease-out overflow-hidden
          flex flex-col items-center justify-center gap-4
          ${isActive 
            ? 'border-west-accent bg-west-accent/10 shadow-3d scale-[1.02]' 
            : 'border-west-border bg-west-panel hover:bg-west-hover opacity-80 hover:opacity-100 hover:border-west-text/30'}
        `}
      >
        {/* Deep Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl"></div>

        {/* Selection Indicator */}
        <div className={`
            absolute top-3 right-3 w-2 h-2 rounded-full transition-all duration-500
            ${isActive ? 'bg-west-accent shadow-[0_0_8px_var(--accent-color)]' : 'bg-west-border'}
        `} />

        <div className={`
            p-4 rounded-full transition-all duration-500 transform group-hover:scale-110 shadow-lg
            ${isActive ? 'bg-west-accent text-black' : 'bg-west-bg border border-west-border text-west-muted'}
        `}>
            <Icon className="w-8 h-8" />
        </div>
        
        <div className="flex flex-col items-center relative z-10">
            <span className={`font-mono text-sm tracking-widest font-bold transition-colors duration-300 ${isActive ? 'text-west-accent' : 'text-west-muted'}`}>
                {label}
            </span>
            <span className={`text-[9px] font-mono mt-2 transition-all duration-500 bg-west-accent/10 px-2 py-0.5 rounded border border-west-accent/20 ${isActive ? 'text-west-text opacity-100 translate-y-0' : 'text-transparent opacity-0 translate-y-2'}`}>
                ACTIVE MODE
            </span>
        </div>
      </button>
    );
  };

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-8 bg-west-bg/20 transition-opacity duration-300 pb-24 md:pb-8 ${isTransitioning ? 'opacity-90' : 'opacity-100'}`}>
      
      {/* Header */}
      <div className="mb-10 flex items-end justify-between border-b border-west-border pb-6 animate-in slide-in-from-top-4 duration-500">
        <div>
            <h1 className="text-2xl md:text-3xl font-mono text-west-text tracking-widest flex items-center gap-3 drop-shadow-sm font-bold">
                SYSTEM CONFIG
                <Cpu className="w-8 h-8 text-west-accent animate-spin-slow" />
            </h1>
            <p className="text-west-accent/80 text-xs md:text-sm font-mono mt-2">:: GOVERNANCE :: LOGS :: DIAGNOSTICS</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-west-muted border border-west-border px-3 py-1.5 rounded-lg bg-west-panel backdrop-blur-md">
            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
            KERNEL: v1.4.2 STABLE
        </div>
      </div>

      {/* THEME SELECTION - NEW UI */}
      <section className="mb-12 animate-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 mb-4 px-1">
            <Monitor className="w-5 h-5 text-west-accent" />
            <h2 className="text-sm md:text-base font-mono text-west-text font-bold tracking-wider">INTERFACE THEME PROTOCOL</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
            <ThemeOption id="dark" label="DEEP SPACE" icon={Moon} color="#06b6d4" />
            <ThemeOption id="light" label="DAYLIGHT" icon={Sun} color="#0284c7" />
            <ThemeOption id="system" label="AUTO SYNC" icon={Zap} color="#a855f7" />
        </div>
      </section>

      {/* ISO COMPLIANCE LOGS (Terminal Style) */}
      <section className="mb-12 animate-in slide-in-from-bottom-3 duration-500">
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-west-warn" />
                <h2 className="text-sm md:text-base font-mono text-west-text font-bold tracking-wider">ISO 42001 AUDIT TRAIL</h2>
            </div>
            <button onClick={clearAuditLog} className="text-[10px] text-west-muted hover:text-red-500 font-mono transition-colors border border-west-border hover:border-red-500/30 px-3 py-1.5 rounded bg-west-panel hover:bg-red-500/10">
                CLEAR LOGS
            </button>
        </div>
        
        <div className="bg-west-paper border border-west-border rounded-2xl overflow-hidden h-72 overflow-y-auto font-mono text-xs scrollbar-thin shadow-inner relative backdrop-blur-xl">
            {/* Tech Scanline */}
            <div className="absolute top-0 left-0 w-full h-1 bg-west-accent/20 animate-scanline pointer-events-none z-10"></div>
            
            <table className="w-full text-left border-collapse relative z-0">
                <thead className="bg-west-panel sticky top-0 z-20 shadow-sm backdrop-blur-md">
                    <tr>
                        <th className="p-4 text-west-accent border-b border-west-border w-32 tracking-wider">TIME</th>
                        <th className="p-4 text-west-accent border-b border-west-border w-32 tracking-wider">ACTOR</th>
                        <th className="p-4 text-west-accent border-b border-west-border w-40 tracking-wider">ACTION</th>
                        <th className="p-4 text-west-accent border-b border-west-border w-32 tracking-wider">STATUS</th>
                        <th className="p-4 text-west-accent border-b border-west-border tracking-wider">DETAILS</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length === 0 ? (
                        <tr><td colSpan={5} className="p-12 text-center text-west-muted opacity-50 tracking-widest">NO SECURITY EVENTS LOGGED</td></tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id} className="border-b border-west-border hover:bg-west-hover transition-colors group">
                                <td className="p-3 text-west-muted font-mono pl-4 opacity-70">{log.timestamp.split('T')[1].split('.')[0]}</td>
                                <td className="p-3 text-west-text font-bold">{log.actor}</td>
                                <td className="p-3 text-sky-500 group-hover:text-sky-400 transition-colors">{log.action}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                                        log.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                                        log.status === 'WARNING' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 
                                        'bg-green-500/10 text-green-500 border-green-500/30'
                                    }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="p-3 text-west-muted truncate max-w-xs group-hover:text-west-text pr-4 transition-colors" title={log.details}>{log.details}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="mb-12 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-4 px-1">
            <Network className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm md:text-base font-mono text-west-text font-bold tracking-wider">NEURAL ARCHITECTURE VISUALIZATION</h2>
        </div>
        <div className="overflow-x-auto pb-4 rounded-3xl border border-west-border bg-west-paper/50 shadow-3d">
            {/* Increased min-w to 900px to ensure SVG paths align correctly with columns */}
            <div className="min-w-[900px] p-2">
                <RagDiagram />
            </div>
        </div>
      </section>

      {/* Diagnostics */}
      <section className="mb-8 animate-in slide-in-from-bottom-5 duration-700">
        <div className="flex items-center gap-2 mb-4 px-1">
            <Shield className="w-5 h-5 text-west-accent" />
            <h2 className="text-sm md:text-base font-mono text-west-text font-bold tracking-wider">CORE DIAGNOSTICS</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-west-border bg-west-panel/40 backdrop-blur-xl p-5 flex justify-between items-center group hover:border-green-500/30 transition-colors rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full shadow-inner">
                        <Wifi className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <div className="text-[10px] md:text-xs font-mono text-west-muted uppercase tracking-wider">NEURAL UPLINK</div>
                        <div className="text-xs md:text-sm font-mono text-west-text font-bold mt-1">CONNECTED (5ms)</div>
                    </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]"></div>
            </div>

            <div className="border border-west-border bg-west-panel/40 backdrop-blur-xl p-5 flex justify-between items-center group hover:border-west-accent/30 transition-colors rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                     <div className="p-3 bg-west-warn/10 rounded-full shadow-inner">
                        <AlertTriangle className="w-6 h-6 text-west-warn" />
                     </div>
                    <div>
                        <div className="text-[10px] md:text-xs font-mono text-west-muted uppercase tracking-wider">GUARDRAILS (ISO 42001)</div>
                        <div className="text-xs md:text-sm font-mono text-west-text font-bold mt-1">ACTIVE (PII + INJECTION)</div>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-west-accent border border-west-accent/30 px-2 py-0.5 rounded bg-west-accent/5 font-bold">SECURE</div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
