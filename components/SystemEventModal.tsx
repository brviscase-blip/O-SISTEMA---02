
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Timer, CheckCircle2, AlertCircle, TrendingUp, Coins } from 'lucide-react';
import { SystemEvent } from '../types';

interface Props {
  event: SystemEvent;
  onComplete: () => void;
  onFail: () => void;
}

const SystemEventModal: React.FC<Props> = ({ event, onComplete, onFail }) => {
  const [timeLeft, setTimeLeft] = useState(event.duration || 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFail();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onFail]);

  return (
    <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-[#030712] border-2 border-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.4)] relative overflow-hidden flex flex-col">
        
        {/* Background Decorative Glitch */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_3px)]" />
        </div>

        <div className="p-1 bg-rose-600 flex items-center justify-center gap-3">
          <ShieldAlert size={14} className="text-white animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">AVISO DO SISTEMA</span>
        </div>

        <div className="p-8 space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-rose-500 italic uppercase tracking-tighter leading-tight">
              {event.title}
            </h2>
            <div className="h-0.5 w-20 bg-rose-600 mx-auto" />
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {/* Corrected: Access description from event.description if available, or title as fallback */}
              {(event as any).description || event.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-sm">
               <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RECOMPENSAS</span>
               </div>
               <div className="space-y-1">
                 {event.reward.xp && <p className="text-xs font-black text-white">+{event.reward.xp} XP</p>}
                 {event.reward.gold && <p className="text-xs font-black text-amber-500">+{event.reward.gold} OURO</p>}
                 {event.reward.stats && <p className="text-xs font-black text-emerald-400">+{event.reward.stats} PONTO STATUS</p>}
               </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-sm">
               <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={12} className="text-rose-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PENALIDADES</span>
               </div>
               <div className="space-y-1">
                 {event.penalty.hp ? (
                   <p className="text-xs font-black text-rose-500">-{event.penalty.hp} HP REAL</p>
                 ) : (
                   <p className="text-xs font-black text-slate-600">SEM PENALIDADES</p>
                 )}
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
               <span className="flex items-center gap-2"><Timer size={12} /> TEMPO RESTANTE</span>
               <span className={timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}>
                 {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
               </span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
               <div 
                 className={`h-full transition-all duration-1000 ${timeLeft < 10 ? 'bg-rose-500' : 'bg-rose-600'}`} 
                 style={{ width: `${(timeLeft / (event.duration || 60)) * 100}%` }}
               />
            </div>
          </div>

          <button 
            onClick={onComplete}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
          >
            <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
            CONFIRMAR CONCLUSÃO
          </button>
        </div>
        
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <Zap size={150} className="text-rose-600" />
        </div>
      </div>
    </div>
  );
};

export default SystemEventModal;
