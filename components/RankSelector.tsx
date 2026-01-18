
import React from 'react';
import { Lock, Crown, ChevronRight, Zap, Target, Swords, History, Shield } from 'lucide-react';
import { ItemRank, PlayerStatus } from '../types';

const RANK_TITLES: Record<ItemRank, string> = {
  'E': 'Iniciante',
  'D': 'Assassino',
  'C': 'O Necromante',
  'B': 'Monarca das Sombras',
  'A': 'Comandante de Legião',
  'S': 'Soberano da Eternidade'
};

interface RankCardProps {
  rank: ItemRank;
  minLevel: number;
  maxLevel: number;
  currentLevel: number;
  isUnlocked: boolean;
  onSelect: (rank: ItemRank) => void;
}

const RankCard: React.FC<RankCardProps> = ({ rank, minLevel, maxLevel, currentLevel, isUnlocked, onSelect }) => {
  const getRankTheme = (r: ItemRank) => {
    switch (r) {
      case 'E': return { color: 'text-slate-500', border: 'border-slate-500/30', glow: 'shadow-slate-500/5', bg: 'bg-slate-900/20' };
      case 'D': return { color: 'text-emerald-500', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/5', bg: 'bg-emerald-900/10' };
      case 'C': return { color: 'text-blue-500', border: 'border-blue-500/30', glow: 'shadow-blue-500/5', bg: 'bg-blue-900/10' };
      case 'B': return { color: 'text-purple-500', border: 'border-purple-500/30', glow: 'shadow-purple-500/5', bg: 'bg-purple-900/10' };
      case 'A': return { color: 'text-amber-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/5', bg: 'bg-amber-900/10' };
      case 'S': return { color: 'text-rose-500', border: 'border-rose-500/40', glow: 'shadow-rose-500/10', bg: 'bg-rose-950/20' };
      default: return { color: 'text-white', border: 'border-slate-800', glow: '', bg: 'bg-slate-900/20' };
    }
  };

  const theme = getRankTheme(rank);
  const progress = isUnlocked ? Math.min(100, ((currentLevel - minLevel) / (maxLevel - minLevel)) * 100) : 0;
  const classTitle = RANK_TITLES[rank];

  return (
    <div 
      onClick={() => isUnlocked && onSelect(rank)}
      className={`group relative flex flex-col p-6 border-2 rounded-sm transition-all duration-500 ${isUnlocked ? `${theme.border} ${theme.bg} cursor-pointer hover:scale-[1.02] hover:border-blue-500/50 shadow-2xl` : 'border-slate-900 bg-black/40 grayscale opacity-60 cursor-not-allowed'}`}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <Lock size={32} className="text-slate-700 mb-2" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível {minLevel} Requerido</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className={`text-4xl font-black italic tracking-tighter leading-none ${theme.color}`}>RANK {rank}</h3>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mt-2 italic group-hover:text-white transition-colors">{classTitle}</p>
        </div>
        {isUnlocked && <Crown size={20} className={`${theme.color} opacity-40 group-hover:opacity-100 transition-opacity`} />}
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-600">Progresso do Plano</span>
          <span className={theme.color}>{isUnlocked ? `${Math.floor(progress)}%` : '0%'}</span>
        </div>
        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-slate-800/50">
          <div 
            className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-slate-700 uppercase">
          <span>Lv. {minLevel}</span>
          <span>Lv. {maxLevel}</span>
        </div>
      </div>

      {isUnlocked && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <ChevronRight size={24} className="text-blue-500" />
        </div>
      )}
    </div>
  );
};

interface RankSelectorProps {
  currentLevel: number;
  onSelectRank: (rank: ItemRank) => void;
}

const RankSelector: React.FC<RankSelectorProps> = ({ currentLevel, onSelectRank }) => {
  const ranks: { rank: ItemRank; min: number; max: number }[] = [
    { rank: 'E', min: 1, max: 100 },
    { rank: 'D', min: 100, max: 200 },
    { rank: 'C', min: 200, max: 300 },
    { rank: 'B', min: 300, max: 400 },
    { rank: 'A', min: 400, max: 500 },
    { rank: 'S', min: 500, max: 999 },
  ];

  return (
    <div className="fixed inset-0 z-[7000] bg-[#010307] overflow-y-auto custom-scrollbar flex flex-col p-8 md:p-16">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Estilo imagem inspiração */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-4">
            <Shield size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Soberania Temporal Operacional</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
            Nexus de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Planos Dimensionais</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.2em] max-w-2xl mx-auto italic">
            Cada Rank é uma nova escala de poder. Selecione um plano autorizado para sincronizar seu DNA.
          </p>
        </div>

        {/* Grid de Ranks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {ranks.map((r) => (
            <RankCard 
              key={r.rank}
              rank={r.rank}
              minLevel={r.min}
              maxLevel={r.max}
              currentLevel={currentLevel}
              isUnlocked={currentLevel >= r.min}
              onSelect={onSelectRank}
            />
          ))}
        </div>

        {/* Footer info bars - inspirado no rodapé da imagem */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-sm flex flex-col items-center text-center gap-3 group hover:border-blue-500/30 transition-all">
            <History size={20} className="text-blue-500 opacity-60" />
            <div>
               <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Herança Estática</h4>
               <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Seus equipamentos transcendem os planos dimensionais.</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-sm flex flex-col items-center text-center gap-3 group hover:border-purple-500/30 transition-all">
            <Zap size={20} className="text-purple-500 opacity-60" />
            <div>
               <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Isolamento de Dados</h4>
               <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Hábitos e missões são independentes para cada Rank.</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900/20 border border-slate-800 rounded-sm flex flex-col items-center text-center gap-3 group hover:border-rose-500/30 transition-all">
            <Target size={20} className="text-rose-500 opacity-60" />
            <div>
               <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Progressão Linear</h4>
               <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">O nível global dita sua autoridade de acesso ao Nexus.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankSelector;
