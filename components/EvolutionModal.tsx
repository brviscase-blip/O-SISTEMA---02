
import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, ShieldCheck, Star, ArrowUpRight, Crown, Sparkles } from 'lucide-react';
import { ItemRank } from '../types';

interface EvolutionModalProps {
  type: 'LEVEL' | 'RANK';
  oldValue: string | number;
  newValue: string | number;
  rewards: string[];
  onClose: () => void;
}

const EvolutionModal: React.FC<EvolutionModalProps> = ({ type, oldValue, newValue, rewards, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isRank = type === 'RANK';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Background FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] ${isRank ? 'bg-orange-500 animate-pulse' : 'bg-purple-600'}`} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className={`relative w-full max-w-2xl p-8 text-center transition-all duration-1000 transform ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 animate-bounce shadow-[0_0_30px_rgba(0,0,0,0.5)] ${isRank ? 'border-orange-500 bg-orange-950/30' : 'border-purple-500 bg-purple-950/30'}`}>
            {isRank ? <Crown size={48} className="text-orange-400" /> : <Zap size={48} className="text-purple-400" />}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-sm font-black uppercase tracking-[0.5em] mb-2 ${isRank ? 'text-orange-500' : 'text-purple-500'}`}>
          {isRank ? 'ASCENSÃO DE AUTORIDADE' : 'EVOLUÇÃO DETECTADA'}
        </h2>
        
        <div className="relative inline-block mb-12">
          <h1 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {isRank ? `RANK ${newValue}` : `NV. ${newValue}`}
          </h1>
          <div className="absolute -right-4 -top-4">
             <Sparkles className={isRank ? 'text-orange-400' : 'text-purple-400'} size={32} />
          </div>
        </div>

        {/* Transition info */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <span className="text-2xl font-black text-slate-600 italic tracking-tighter line-through">{type === 'RANK' ? `RANK ${oldValue}` : `NV.${oldValue}`}</span>
          <ArrowUpRight size={32} className="text-white opacity-20" />
          <span className={`text-4xl font-black italic tracking-tighter ${isRank ? 'text-orange-400' : 'text-purple-400'}`}>{type === 'RANK' ? `RANK ${newValue}` : `NV.${newValue}`}</span>
        </div>

        {/* Rewards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-12">
          {rewards.map((reward, i) => (
            /* Cast style to any to fix delay property error */
            <div key={i} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-sm text-left animate-in slide-in-from-bottom-2 duration-500" style={{ '--delay': `${i * 200}ms` } as any}>
              <div className={isRank ? 'text-orange-500' : 'text-purple-500'}>
                {reward.includes('HP') ? <ShieldCheck size={18} /> : <TrendingUp size={18} />}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{reward}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className={`group relative px-16 py-5 overflow-hidden rounded-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl ${isRank ? 'shadow-orange-500/20' : 'shadow-purple-500/20'}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${isRank ? 'from-orange-600 to-red-600' : 'from-purple-600 to-blue-600'}`} />
          <span className="relative z-10 text-xs font-black text-white uppercase tracking-[0.4em]">RETORNAR AO SISTEMA</span>
        </button>

      </div>

      {/* CSS Effects */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .evolution-shine::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          animation: shine 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default EvolutionModal;
