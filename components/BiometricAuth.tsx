import React, { useEffect, useState } from 'react';
import { ScanFace, Fingerprint, ShieldCheck, Lock } from 'lucide-react';

interface BiometricAuthProps {
  onComplete: () => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'SCANNING' | 'PROCESSING' | 'GRANTED'>('SCANNING');

  useEffect(() => {
    // Phase 1: Scan
    const scanInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setStep('PROCESSING');
          return 100;
        }
        return prev + 1.5; // Speed of scan
      });
    }, 30);

    return () => clearInterval(scanInterval);
  }, []);

  useEffect(() => {
    if (step === 'PROCESSING') {
      const timer = setTimeout(() => {
        setStep('GRANTED');
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (step === 'GRANTED') {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20" 
           style={{
               backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
               backgroundSize: '50px 50px',
               transform: 'perspective(500px) rotateX(60deg)'
           }}>
        </div>

        <div className="relative z-10 flex flex-col items-center">
            {/* Face Scan / Fingerprint Animation */}
            <div className="relative w-64 h-64 border-2 border-west-accent/30 rounded-full flex items-center justify-center mb-8 bg-black/50 backdrop-blur-sm">
                <div className="absolute inset-0 rounded-full border-4 border-t-west-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-b-cyan-600 border-t-transparent border-l-transparent border-r-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
                
                {step === 'SCANNING' && <ScanFace className="w-32 h-32 text-west-accent opacity-80 animate-pulse" />}
                {step === 'PROCESSING' && <Fingerprint className="w-32 h-32 text-cyan-400 opacity-80 animate-pulse" />}
                {step === 'GRANTED' && <ShieldCheck className="w-32 h-32 text-green-500 animate-in zoom-in duration-300" />}

                {/* Scanner Line */}
                {step === 'SCANNING' && (
                    <div className="absolute w-full h-1 bg-west-accent/80 shadow-[0_0_15px_#06b6d4] animate-scanline top-0"></div>
                )}
            </div>

            <h1 className="text-3xl font-mono font-bold tracking-[0.3em] text-white mb-2">
                DELOS<span className="text-west-accent">SECURITY</span>
            </h1>

            <div className="h-12 flex items-center justify-center">
                {step === 'SCANNING' && (
                    <div className="text-west-accent font-mono animate-pulse">RETINAL SCAN IN PROGRESS... {Math.round(progress)}%</div>
                )}
                {step === 'PROCESSING' && (
                    <div className="text-cyan-400 font-mono animate-pulse">VERIFYING NEURAL SIGNATURE...</div>
                )}
                {step === 'GRANTED' && (
                    <div className="text-green-500 font-mono text-xl tracking-widest animate-bounce">ACCESS GRANTED</div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-100 ${step === 'GRANTED' ? 'bg-green-500' : step === 'PROCESSING' ? 'bg-cyan-400' : 'bg-west-accent'}`} 
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-8 text-[10px] text-slate-500 font-mono text-center">
                <p>BIOMETRIC ENCRYPTION: ACTIVE</p>
                <p>SESSION ID: {Date.now().toString(16).toUpperCase()}</p>
            </div>
        </div>
    </div>
  );
};

export default BiometricAuth;