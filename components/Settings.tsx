import React, { useState, useEffect } from 'react';
import { Theme, AuditLogEntry } from '../types';
import { Moon, Sun, Monitor, CheckCircle, AlertTriangle, Wifi, Shield, Cpu, Network, FileText, Lock, Activity, Zap, Scale, FileJson, Trash2, ShieldAlert, Download, RefreshCw, Eye, ShieldCheck } from 'lucide-react';
import RagDiagram from './RagDiagram';
import { getAuditLog, clearAuditLog, exportUserData, deleteUserData } from '../services/securityService';

interface SettingsProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const RiskMatrix = () => (
  <div className="bg-west-paper border border-west-border rounded-xl p-4">
    <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-mono font-bold text-orange-500 uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> NIST AI RMF Map
        </h4>
        <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20">RESIDUAL RISK: LOW</span>
    </div>
    <div className="grid grid-cols-3 gap-1 aspect-square max-h-[160px] max-w-[160px] mx-auto">
        {/* Row 1 */}
        <div className="bg-red-500/20 border border-red-500/30 rounded flex items-center justify-center text-[9px] text-red-500 font-bold hover:bg-red-500/40 transition-colors cursor-help" title="High Impact / High Prob">CRITICAL</div>
        <div className="bg-orange-500/20 border border-orange-500/30 rounded flex items-center justify-center text-[9px] text-orange-500 font-bold">HIGH</div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded flex items-center justify-center text-[9px] text-yellow-500 font-bold">MED</div>
        {/* Row 2 */}
        <div className="bg-orange-500/20 border border-orange-500/30 rounded flex items-center justify-center text-[9px] text-orange-500 font-bold">HIGH</div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded flex items-center justify-center text-[9px] text-yellow-500 font-bold">MED</div>
        <div className="bg-green-500/20 border border-green-500/30 rounded flex items-center justify-center text-[9px] text-green-500 font-bold">LOW</div>
        {/* Row 3 */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded flex items-center justify-center text-[9px] text-yellow-500 font-bold">MED</div>
        <div className="bg-green-500/20 border border-green-500/30 rounded flex items-center justify-center text-[9px] text-green-500 font-bold">LOW</div>
        <div className="bg-west-accent/20 border border-west-accent/50 rounded flex items-center justify-center text-[9px] text-west-accent font-bold ring-2 ring-west-accent ring-offset-2 ring-offset-black">CURRENT</div>
    </div>
    <div className="flex justify-between text-[9px] text-west-muted font-mono mt-2 px-2">
        <span>LIKELIHOOD</span>
        <span>IMPACT</span>
    </div>
  </div>
);

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
          relative group flex-1 p-4 rounded-xl border transition-all duration-300 ease-out overflow-hidden
          flex flex-col items-center justify-center gap-3
          ${isActive 
            ? 'border-west-accent bg-west-accent/10 shadow-3d scale-[1.02]' 
            : 'border-west-border bg-west-panel hover:bg-west-hover opacity-80 hover:opacity-100 hover:border-west-text/30'}
        `}
      >
        <div className={`p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-west-accent text-black' : 'bg-west-bg border border-west-border text-west-muted'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={`font-mono text-xs font-bold ${isActive ? 'text-west-accent' : 'text-west-muted'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-8 bg-west-bg/20 transition-opacity duration-300 pb-24 md:pb-8 ${isTransitioning ? 'opacity-90' : 'opacity-100'}`}>
      
      {/* Header */}
      <div className="mb-8 flex items-end justify-between border-b border-west-border pb-6 animate-in slide-in-from-top-4 duration-500">
        <div>
            <div className="flex items-center gap-3 mb-2">
                 <div className="bg-west-accent/10 p-2 rounded border border-west-accent/20">
                    <Scale className="w-6 h-6 text-west-accent" />
                 </div>
                 <h1 className="text-2xl md:text-3xl font-mono text-west-text tracking-widest font-bold">
                    TRUSTED AI ECOSYSTEM
                 </h1>
            </div>
            <p className="text-west-accent/80 text-xs font-mono mt-2 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                ISO 42001 :: COMPLIANCE ORCHESTRATOR
            </p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setLogs(getAuditLog())} className="p-2 border border-west-border rounded-lg hover:bg-west-hover text-west-muted hover:text-west-text transition-colors" title="Refresh Logs">
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: VISUALIZATIONS & CONTROLS */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* 1. EU AI ACT STATUS BANNER */}
            <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-west-panel p-6 shadow-3d animate-in slide-in-from-left duration-700">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Scale className="w-32 h-32 text-red-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-sans font-bold text-red-400 mb-1 flex items-center gap-2">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" alt="EU" className="w-6 h-4 rounded shadow-sm opacity-80" />
                             EU AI ACT COMPLIANCE
                        </h3>
                        <p className="text-xs text-west-secondary max-w-lg leading-relaxed">
                            System classified as <strong>Operational Support (Limited Risk)</strong>. 
                            Transparency obligations met via automated disclaimer injection and artifact watermarking.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-mono text-red-400 border border-red-500/50 px-3 py-1 rounded bg-red-500/10 font-bold uppercase tracking-wider">
                            Status: Monitor Mode
                        </span>
                        <span className="text-[9px] font-mono text-west-muted">Last Assessment: 2024-03-01</span>
                    </div>
                </div>
            </div>

            {/* 2. ISO 42001 ORCHESTRATOR (RagDiagram) */}
            <div className="bg-west-panel/50 border border-west-border rounded-xl p-1 overflow-hidden shadow-3d relative group">
                <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 tracking-wider">AIMS LIFECYCLE MONITOR</span>
                </div>
                <RagDiagram />
                {/* Overlay Description */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-west-bg to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[10px] font-mono text-west-accent text-center">Visualizing Data Flow & Control Points (ISO 42001 Clause 6.1)</p>
                </div>
            </div>

            {/* 3. AUDIT LOG (Bottom) */}
            <div className="bg-west-panel border border-west-border rounded-xl overflow-hidden shadow-3d flex flex-col h-[400px]">
                <div className="p-4 border-b border-west-border bg-west-bg/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-west-muted" />
                        <h3 className="text-xs font-mono font-bold text-west-text uppercase">Immutable Audit Trail</h3>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={clearAuditLog} className="text-[10px] text-red-500 hover:underline px-2 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> PURGE LOCAL
                         </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto scrollbar-thin p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-west-bg/50 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 text-[10px] font-mono text-west-muted border-b border-west-border w-24">TIMESTAMP</th>
                                <th className="p-3 text-[10px] font-mono text-west-muted border-b border-west-border w-20">ACTOR</th>
                                <th className="p-3 text-[10px] font-mono text-west-muted border-b border-west-border w-24">STANDARD</th>
                                <th className="p-3 text-[10px] font-mono text-west-muted border-b border-west-border">ACTION / HASH</th>
                                <th className="p-3 text-[10px] font-mono text-west-muted border-b border-west-border text-right w-20">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-west-border/30">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-xs font-mono text-west-muted opacity-50">
                                        NO AUDIT RECORDS FOUND
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-west-hover transition-colors group">
                                    <td className="p-3 text-[10px] font-mono text-west-muted whitespace-nowrap opacity-70">
                                        {log.timestamp.split('T')[1].split('.')[0]}
                                    </td>
                                    <td className="p-3 text-[10px] font-mono font-bold text-west-text">
                                        {log.actor}
                                    </td>
                                    <td className="p-3">
                                        <span className={`
                                            text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold whitespace-nowrap
                                            ${log.complianceStandard === 'ISO_42001' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                                              log.complianceStandard === 'ISO_27701' ? 'text-purple-400 border-purple-400/30 bg-purple-400/10' :
                                              log.complianceStandard === 'NIST_RMF' ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' :
                                              'text-west-muted border-west-border bg-west-bg/50'}
                                        `}>
                                            {log.complianceStandard || 'GENERIC'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-xs text-west-text font-medium">{log.action}</div>
                                        <div className="text-[10px] text-west-muted truncate max-w-[200px] md:max-w-md opacity-70 font-mono" title={log.details}>
                                            {log.details}
                                        </div>
                                        <div className="text-[9px] font-mono text-west-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                            HASH: {log.hash}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className={`text-[10px] font-bold ${
                                            log.status === 'BLOCKED' ? 'text-red-500' : 
                                            log.status === 'WARNING' ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="space-y-6">
            
            {/* 1. Theme & Appearance */}
            <div className="bg-west-panel border border-west-border rounded-xl p-5 shadow-3d">
                <h4 className="text-xs font-mono font-bold text-west-text uppercase mb-4 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-west-accent" /> Interface Theme
                </h4>
                <div className="flex gap-3">
                    <ThemeOption id="dark" label="DARK" icon={Moon} color="cyan" />
                    <ThemeOption id="light" label="LIGHT" icon={Sun} color="orange" />
                    <ThemeOption id="system" label="AUTO" icon={Cpu} color="purple" />
                </div>
            </div>

            {/* 2. NIST RMF (Risk Matrix) */}
            <RiskMatrix />

            {/* 3. ISO 27701 (Privacy Controls) */}
            <div className="bg-west-panel border border-west-border rounded-xl p-5 shadow-3d relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full"></div>
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> ISO 27701 PIMS
                </h4>
                <div className="space-y-3">
                    <div className="p-3 bg-west-bg/50 rounded-lg border border-west-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Eye className="w-4 h-4 text-west-muted" />
                            <div>
                                <div className="text-xs font-bold text-west-text">PII Scrubbing</div>
                                <div className="text-[9px] text-west-muted">Automatic Redaction</div>
                            </div>
                        </div>
                        <div className="w-8 h-4 bg-green-500/20 rounded-full border border-green-500/50 flex items-center px-0.5">
                            <div className="w-3 h-3 bg-green-500 rounded-full ml-auto shadow-[0_0_5px_#22c55e]"></div>
                        </div>
                    </div>

                    <div className="border-t border-west-border/30 pt-3 mt-2">
                        <span className="text-[9px] font-mono text-west-muted uppercase mb-2 block font-bold">Data Subject Rights (GDPR)</span>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={exportUserData}
                                className="flex flex-col items-center justify-center p-3 border border-west-border rounded-lg hover:border-purple-400 hover:bg-purple-500/5 transition-all text-center gap-2"
                            >
                                <Download className="w-4 h-4 text-purple-400" />
                                <span className="text-[9px] font-bold text-west-text">EXPORT DATA</span>
                            </button>
                            <button 
                                onClick={deleteUserData}
                                className="flex flex-col items-center justify-center p-3 border border-west-border rounded-lg hover:border-red-500 hover:bg-red-500/5 transition-all text-center gap-2 group"
                            >
                                <Trash2 className="w-4 h-4 text-west-muted group-hover:text-red-500" />
                                <span className="text-[9px] font-bold text-west-text group-hover:text-red-500">FORGET ME</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ISO 27001 (Security) */}
            <div className="bg-west-panel border border-west-border rounded-xl p-5 shadow-3d">
                 <h4 className="text-xs font-mono font-bold text-green-500 uppercase mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> ISO 27001 ISMS
                </h4>
                <ul className="space-y-2">
                    <li className="flex justify-between items-center p-2 rounded hover:bg-west-hover transition-colors">
                        <span className="text-[10px] font-mono text-west-secondary">A.12.6.1 Vulnerability Mgmt</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    </li>
                    <li className="flex justify-between items-center p-2 rounded hover:bg-west-hover transition-colors">
                        <span className="text-[10px] font-mono text-west-secondary">A.9.4.1 Access Control</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    </li>
                    <li className="flex justify-between items-center p-2 rounded hover:bg-west-hover transition-colors">
                        <span className="text-[10px] font-mono text-west-secondary">A.12.3.1 Backup (RAG)</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    </li>
                </ul>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;