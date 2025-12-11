
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterfaceWrapper from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import Settings from './components/Settings';
import About from './components/About';
import BiometricAuth from './components/BiometricAuth';
import { AppView, Theme } from './types';
import { CheckCircle2, XCircle } from 'lucide-react';

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-[100] bg-west-panel border border-west-accent shadow-glow px-4 py-3 rounded-sm flex items-center gap-3 animate-in slide-in-from-right duration-300 backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-west-accent" />
            <span className="text-sm font-mono text-west-text">{message}</span>
            <button onClick={onClose} className="ml-2 text-west-muted hover:text-white"><XCircle className="w-4 h-4" /></button>
        </div>
    );
};

const App: React.FC = () => {
  // PERSISTENCE LAYER: Load View from LocalStorage
  const [currentView, setCurrentView] = useState<AppView>(() => {
      try {
          const savedView = localStorage.getItem('delos_active_view');
          return savedView ? (savedView as AppView) : AppView.DASHBOARD;
      } catch { return AppView.DASHBOARD; }
  });

  // PERSISTENCE LAYER: Load Theme from LocalStorage
  const [theme, setTheme] = useState<Theme>(() => {
      try {
          const savedTheme = localStorage.getItem('delos_theme');
          if (savedTheme) return savedTheme as Theme;
          // Default to system preference if no save found, or fallback to dark
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
          }
          return 'dark';
      } catch { return 'dark'; }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => setToastMsg(msg);

  // Save View on change
  useEffect(() => {
     localStorage.setItem('delos_active_view', currentView);
  }, [currentView]);

  // Apply and Save Theme on change
  useEffect(() => {
    const applyTheme = () => {
      // FIX: Tailwind darkMode: 'class' looks for class on <html>, not <body>
      const root = document.documentElement;
      
      root.classList.remove('light-theme', 'dark');
      
      let finalTheme = theme;
      if (theme === 'system') {
         finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      if (finalTheme === 'dark') {
          root.classList.add('dark');
          // Optional: Clean body just in case
          document.body.classList.add('dark');
          document.body.classList.remove('light-theme');
      } else {
          root.classList.add('light-theme');
          // Optional: Clean body just in case
          document.body.classList.add('light-theme');
          document.body.classList.remove('dark');
      }
      
      localStorage.setItem('delos_theme', theme);
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const renderContent = () => {
    switch (currentView) {
      case AppView.NEURAL_LINK:
        return <ChatInterfaceWrapper showToast={showToast} />;
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.MEMORY_CORE:
        return <KnowledgeBase />;
      case AppView.SETTINGS:
        return <Settings currentTheme={theme} onThemeChange={(t) => { setTheme(t); showToast(`Theme Protocol: ${t.toUpperCase()}`); }} />;
      case AppView.ABOUT:
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-west-bg text-west-text overflow-hidden selection:bg-west-accent selection:text-white transition-colors duration-500 relative">
      {!isAuthenticated && <BiometricAuth onComplete={() => setIsAuthenticated(true)} />}
      {isAuthenticated && (
        <>
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
            <Sidebar currentView={currentView} onChangeView={setCurrentView} />
            <main className="flex-1 relative flex flex-col bg-west-bg/50 transition-colors duration-500 animate-in fade-in duration-1000 overflow-hidden pb-16 md:pb-0">
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-west-accent/50 to-transparent shadow-glow z-10 shrink-0"></div>
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    {renderContent()}
                </div>
            </main>
        </>
      )}
    </div>
  );
};

export default App;
