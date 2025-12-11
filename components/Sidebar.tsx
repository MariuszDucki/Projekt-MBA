
import React from 'react';
import { LayoutDashboard, BrainCircuit, Database, Settings, Activity, Cpu, Info } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'STATUS' },
    { id: AppView.NEURAL_LINK, icon: BrainCircuit, label: 'NEURAL LINK' },
    { id: AppView.MEMORY_CORE, icon: Database, label: 'MEMORY' },
    { id: AppView.SETTINGS, icon: Settings, label: 'SYSTEM' },
    { id: AppView.ABOUT, icon: Info, label: 'ABOUT' },
  ];

  // DESKTOP / TABLET SIDEBAR (Deep Glass Pane)
  const DesktopSidebar = () => (
    <div className="hidden md:flex w-20 lg:w-64 flex-shrink-0 border-r border-west-border bg-west-panel backdrop-blur-xl flex-col justify-between z-20 relative h-full transition-all duration-300 shadow-2xl">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-west-border bg-west-paper/50">
            <div className="relative">
                <Cpu className="text-west-accent w-8 h-8 relative z-10" />
                <div className="absolute inset-0 bg-west-accent blur-md opacity-20 animate-pulse-slow"></div>
            </div>
            <span className="hidden lg:block ml-3 font-mono text-xl font-bold tracking-widest text-west-accent drop-shadow-sm">
                DELOS<span className="text-west-text opacity-80">AI</span>
            </span>
        </div>

        <nav className="mt-8 flex flex-col gap-3 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                group flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all duration-300 relative overflow-hidden
                ${currentView === item.id 
                  ? 'bg-gradient-to-r from-west-accent/20 to-transparent text-west-accent border border-west-accent/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' 
                  : 'text-west-muted hover:text-west-text hover:bg-west-hover border border-transparent'}
              `}
              title={item.label}
            >
              {currentView === item.id && <div className="absolute left-0 w-1 h-full bg-west-accent rounded-r-full"></div>}
              <item.icon className={`w-6 h-6 z-10 ${currentView === item.id ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
              <span className="hidden lg:block ml-4 font-mono tracking-widest text-sm z-10 font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-west-border bg-west-paper/30">
        <div className="flex items-center justify-center lg:justify-start gap-3 bg-west-bg p-2 rounded-lg border border-west-border backdrop-blur-sm shadow-inner transition-colors">
            <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-50"></div>
            </div>
            <div className="hidden lg:flex flex-col">
                <span className="text-[9px] text-west-muted font-mono uppercase tracking-wider">System Status</span>
                <span className="text-[10px] text-green-500 font-mono font-bold tracking-widest">ONLINE</span>
            </div>
        </div>
      </div>
    </div>
  );

  // MOBILE BOTTOM NAVIGATION (Floating Glass Dock)
  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-4 left-4 right-4 h-[70px] z-50">
        <div className="absolute inset-0 bg-west-panel/90 backdrop-blur-2xl rounded-2xl border border-west-border shadow-3d flex items-center justify-around px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                flex flex-col items-center justify-center p-1 rounded-xl w-full transition-all h-full relative
                ${currentView === item.id 
                  ? 'text-west-accent' 
                  : 'text-west-muted hover:text-west-text'}
              `}
            >
              {currentView === item.id && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-west-accent rounded-b-full shadow-[0_0_10px_#06b6d4]"></div>
              )}
              
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${currentView === item.id ? 'bg-west-accent/10 translate-y-1' : ''}`}>
                 <item.icon className={`w-6 h-6 ${currentView === item.id ? 'drop-shadow-glow' : ''}`} />
              </div>
              
              <span className={`text-[9px] font-mono tracking-wider mt-1 transition-all ${currentView === item.id ? 'opacity-100 font-bold' : 'opacity-0 scale-0'}`}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
};

export default Sidebar;
