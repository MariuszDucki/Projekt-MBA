
import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck, Users, FileText, AlertTriangle, Box, Layers, Activity, AlertCircle, Clock, MapPin, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { getRuntimeKnowledgeBase, getRuntimeTickets } from '../services/geminiService';
import { Ticket } from '../types';

const statsData = [
  { subject: 'System Load', A: 120, fullMark: 150 },
  { subject: 'Safety Score', A: 98, fullMark: 150 },
  { subject: 'Efficiency', A: 86, fullMark: 150 },
  { subject: 'Uptime', A: 99, fullMark: 150 },
  { subject: 'Bandwidth', A: 85, fullMark: 150 },
  { subject: 'Response', A: 65, fullMark: 150 },
];

const activityData = [
  { name: '10:00', queries: 20 },
  { name: '12:00', queries: 65 },
  { name: '14:00', queries: 45 },
  { name: '16:00', queries: 90 },
  { name: '18:00', queries: 55 },
  { name: '20:00', queries: 15 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 min-h-[130px] flex flex-col justify-between rounded-2xl bg-west-panel backdrop-blur-xl border border-west-border shadow-3d">
        {/* Aero-Gel Inner Highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        
        {/* Dynamic Background Glow - Adapted for Light Mode to be less "muddy" */}
        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 blur-2xl rounded-full group-hover:bg-${color}-500/20 transition-colors opacity-50`}></div>

        <div className="flex justify-between items-start relative z-10 w-full p-5">
            <div>
                <p className="text-west-muted text-[10px] font-mono uppercase tracking-widest mb-1 font-bold opacity-80">{title}</p>
                <h3 className="text-3xl font-sans font-bold text-west-text mt-1 tracking-tight drop-shadow-sm">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 shadow-sm backdrop-blur-sm group-hover:border-${color}-500/50 transition-colors`}>
                 <Icon className={`text-${color}-500 w-5 h-5`} />
            </div>
        </div>
        
        {/* Bottom indicator bar */}
        <div className="relative w-full h-1 bg-west-text/10 mt-auto">
            <div className={`h-full bg-${color}-500 shadow-[0_0_8px_var(--color-500)] w-1/3 group-hover:w-full transition-all duration-1000 ease-out`} />
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
  const [docCount, setDocCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  const [chartColor, setChartColor] = useState('#06b6d4'); 
  const [gridColor, setGridColor] = useState('#292524');  
  const [textColor, setTextColor] = useState('#a8a29e');  
  const [tooltipStyle, setTooltipStyle] = useState({
      backgroundColor: '#1c1917',
      borderColor: '#292524',
      color: '#f5f5f4'
  });
  
  const [isHoloMode, setIsHoloMode] = useState(false);
  const [canRenderCharts, setCanRenderCharts] = useState(false);
  const [systemPulse, setSystemPulse] = useState(100);

  useEffect(() => {
    let frameId: number;
    const timer = setTimeout(() => {
         frameId = requestAnimationFrame(() => {
            setCanRenderCharts(true);
         });
    }, 500); 

    const updateStyles = () => {
        const styles = getComputedStyle(document.body);
        const accent = styles.getPropertyValue('--accent-color').trim();
        const border = styles.getPropertyValue('--border-color').trim();
        const textMuted = styles.getPropertyValue('--text-muted').trim();
        const bgPanel = styles.getPropertyValue('--bg-panel').trim();
        const textPrimary = styles.getPropertyValue('--text-primary').trim();

        setChartColor(accent);
        setGridColor(border);
        setTextColor(textMuted);
        setTooltipStyle({
            backgroundColor: bgPanel,
            borderColor: border,
            color: textPrimary
        });
    };

    const fetchData = () => {
        const docs = getRuntimeKnowledgeBase();
        setDocCount(docs.length);
        const currentTickets = getRuntimeTickets();
        setTickets([...currentTickets]);
        setTicketCount(currentTickets.length);
        setSystemPulse(prev => Math.min(100, Math.max(95, prev + (Math.random() - 0.5) * 2)));
    };

    // Initial load
    updateStyles();
    fetchData();

    const interval = setInterval(fetchData, 3000);
    
    // Observer for class changes on body (Dark/Light mode switch)
    const observer = new MutationObserver(() => {
        setTimeout(updateStyles, 100);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', updateStyles);

    return () => {
        clearTimeout(timer);
        cancelAnimationFrame(frameId);
        clearInterval(interval);
        observer.disconnect();
        window.removeEventListener('resize', updateStyles);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'CRITICAL': return 'text-red-500 border-red-500/50 bg-red-500/10';
        case 'HIGH': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
        case 'MEDIUM': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
        default: return 'text-west-muted border-west-border bg-west-panel';
    }
  };

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-8 bg-west-bg/20 relative transition-all duration-700 pb-24 md:pb-8 ${isHoloMode ? 'perspective-[1200px]' : ''}`}>
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in slide-in-from-top-4 duration-500">
            <div>
                <h1 className="text-2xl md:text-3xl font-mono text-west-text tracking-widest flex items-center gap-3 font-bold drop-shadow-sm">
                    SYSTEM STATUS
                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-west-accent animate-pulse-slow" />
                </h1>
                <p className="text-west-accent/80 text-xs md:text-sm font-mono mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-west-accent rounded-full animate-pulse"></span>
                    OPERATIONAL METRICS :: LIVE FEED
                </p>
            </div>
            <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                <button 
                    onClick={() => setIsHoloMode(!isHoloMode)}
                    className={`
                        flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border font-mono text-xs md:text-sm transition-all rounded-xl
                        ${isHoloMode 
                            ? 'border-west-accent text-west-accent bg-west-accent/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                            : 'border-west-border text-west-muted hover:text-west-text bg-west-panel/50 shadow-sm hover:bg-west-hover'}
                    `}
                >
                    {isHoloMode ? <Box className="w-4 h-4 animate-pulse" /> : <Layers className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isHoloMode ? 'DISABLE HOLO' : 'HOLO VIEW'}</span>
                </button>
            </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 animate-in slide-in-from-bottom-2 duration-500 delay-100">
            <StatCard title="Active Units" value="4" icon={Users} color="cyan" />
            <StatCard title="Docs Indexed" value={`${docCount}`} icon={FileText} color="indigo" />
            <StatCard title="System Load" value={`${systemPulse.toFixed(1)}%`} icon={ShieldCheck} color="emerald" />
            <StatCard title="Active Tickets" value={ticketCount.toString()} icon={AlertTriangle} color="rose" />
        </div>

        {/* Charts Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 transition-all duration-1000 transform-style-3d`}>
            
            {/* Radar Chart Panel - Matching Image Style (Tabbed) */}
            <div className={`
                relative h-[380px] md:h-[450px] shadow-3d transition-all duration-1000 ease-in-out flex flex-col rounded-[2rem] rounded-tl-none backdrop-blur-2xl bg-west-panel border border-west-border overflow-hidden
                ${isHoloMode ? 'rotate-y-6 rotate-x-6 scale-95 border-west-accent/40 bg-west-panel/50' : ''}
            `}>
                {/* Visual Tab Header (CSS Trick for the cut corner/tab look) */}
                <div className="absolute top-0 left-0 w-full h-[50px] border-b border-west-border pointer-events-none z-10"></div>
                <div className="absolute -top-[1px] -left-[1px] z-20 bg-west-panel border-r border-b border-t border-l border-west-border rounded-br-2xl px-6 py-3 shadow-sm">
                     <span className="text-[10px] font-mono font-bold text-west-text tracking-[0.15em] uppercase flex items-center gap-2">
                        DATA.VIZ.001 // METRICS
                     </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                
                <div className="flex-1 w-full pt-16 pb-4 px-4 min-h-0 min-w-0 overflow-hidden relative flex items-center justify-center" style={{ transform: isHoloMode ? 'translateZ(30px)' : 'none' }}>
                    {canRenderCharts && (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsData}>
                                <PolarGrid stroke={gridColor} strokeOpacity={0.4} strokeDasharray="4 4" gridType="polygon" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: textColor, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="System Metrics"
                                    dataKey="A"
                                    stroke={chartColor}
                                    strokeWidth={3}
                                    fill={chartColor}
                                    fillOpacity={0.2}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: tooltipStyle.backgroundColor, borderColor: tooltipStyle.borderColor, color: tooltipStyle.color, borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ color: chartColor }}
                                    cursor={{ stroke: chartColor, strokeWidth: 1 }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Line Chart Panel - Matching Image Style (Tabbed) */}
            <div className={`
                relative h-[380px] md:h-[450px] shadow-3d transition-all duration-1000 ease-in-out flex flex-col rounded-[2rem] rounded-tl-none backdrop-blur-2xl bg-west-panel border border-west-border overflow-hidden
                ${isHoloMode ? 'rotate-y-[-6deg] rotate-x-6 scale-95 border-west-accent/40 bg-west-panel/50' : ''}
            `}>
                 {/* Visual Tab Header */}
                 <div className="absolute top-0 left-0 w-full h-[50px] border-b border-west-border pointer-events-none z-10"></div>
                 <div className="absolute -top-[1px] -left-[1px] z-20 bg-west-panel border-r border-b border-t border-l border-west-border rounded-br-2xl px-6 py-3 shadow-sm">
                     <span className="text-[10px] font-mono font-bold text-west-text tracking-[0.15em] uppercase flex items-center gap-2">
                        DATA.VIZ.002 // TRAFFIC
                     </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                
                <div className="flex-1 w-full pt-20 pb-6 px-2 min-h-0 min-w-0 overflow-hidden relative pr-6" style={{ transform: isHoloMode ? 'translateZ(30px)' : 'none' }}>
                    {canRenderCharts && (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} vertical={false} />
                                <XAxis dataKey="name" stroke={textColor} tick={{fill: textColor, fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} dy={15} />
                                <YAxis stroke={textColor} tick={{fill: textColor, fontSize: 10}} width={30} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: tooltipStyle.backgroundColor, borderColor: tooltipStyle.borderColor, color: tooltipStyle.color, borderRadius: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ color: chartColor }}
                                    cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="queries" 
                                    stroke={chartColor} 
                                    strokeWidth={4} 
                                    dot={{fill: tooltipStyle.backgroundColor, stroke: chartColor, strokeWidth: 2, r: 5}} 
                                    activeDot={{r: 7, fill: chartColor, strokeWidth: 0}} 
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>

        {/* LIVE TICKET FEED (Glass Table) */}
        <div className="relative mb-20 md:mb-8 overflow-hidden rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 bg-west-panel backdrop-blur-xl border border-west-border shadow-3d">
            {isHoloMode && <div className="absolute inset-0 bg-west-accent/5 pointer-events-none animate-pulse-slow"></div>}
            
            <div className="flex justify-between items-center p-5 border-b border-west-border bg-west-bg/20">
                <h3 className="text-sm font-mono text-west-text flex items-center gap-2 font-bold tracking-wider">
                    <AlertCircle className="w-4 h-4 text-west-warn" />
                    LIVE INCIDENT FEED
                </h3>
                <div className="flex items-center gap-4">
                     <span className="text-[10px] text-green-500 animate-pulse flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> SYNCED
                    </span>
                    <span className="text-[10px] font-mono text-west-muted hidden sm:inline border border-west-border px-2 py-0.5 rounded bg-west-bg/50">
                        TOTAL: {tickets.length}
                    </span>
                </div>
            </div>
            
            {tickets.length === 0 ? (
                <div className="text-center py-20 font-mono text-west-muted text-xs opacity-60">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-green-500" />
                    NO PENDING INCIDENTS. SYSTEM NOMINAL.
                </div>
            ) : (
                <div className="">
                     {/* Table Header */}
                     <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-mono text-west-muted uppercase border-b border-west-border bg-west-bg/30">
                        <div className="col-span-2">Ticket ID</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-3">Location</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2 text-right">Status</div>
                     </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {tickets.map((ticket, idx) => (
                            <div key={ticket.id} className={`group ${idx !== tickets.length - 1 ? 'border-b border-west-border' : ''}`}>
                                {/* Desktop Row */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 hover:bg-west-hover transition-all items-center">
                                    <div className="col-span-2 font-mono text-xs text-west-accent font-bold group-hover:tracking-wider transition-all">{ticket.id}</div>
                                    <div className="col-span-2">
                                        <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <div className="col-span-3 font-mono text-xs text-west-text flex items-center gap-1 opacity-80">
                                        <MapPin className="w-3 h-3 text-west-muted" />
                                        {ticket.location}
                                    </div>
                                    <div className="col-span-3 font-sans text-sm text-west-muted truncate group-hover:text-west-text transition-colors" title={ticket.description}>
                                        {ticket.description}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-xs text-west-text flex items-center justify-end gap-2">
                                        {ticket.status}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-west-accent" />
                                    </div>
                                </div>

                                {/* Mobile Card (Glass) */}
                                <div className="md:hidden p-5 hover:bg-west-hover transition-colors relative overflow-hidden border-l-2 border-transparent">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.priority === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-west-border'}`}></div>
                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <span className="font-mono text-west-accent font-bold text-sm">{ticket.id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <div className="pl-2 mt-2">
                                        <p className="text-xs font-mono text-west-text mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-west-accent" /> {ticket.location}
                                        </p>
                                        <p className="text-sm text-west-muted italic leading-relaxed opacity-90">
                                            "{ticket.description}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
