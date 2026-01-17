
import React from 'react';
import { Play, Pause, RotateCcw, X, UserCheck, FileText, CheckCircle, Clock } from 'lucide-react';
import { DemandItem, Priority, Difficulty } from '../types';

interface FocusCardProps {
  demand: DemandItem;
  timeLeft: number;
  isActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onManualPomoAdd: () => void;
  onRemove: (id: string) => void;
  onComplete: (id: string) => void;
}

const priorityConfig: Record<Priority, { label: string, style: string }> = {
  HIGH: { label: 'ALTA', style: 'text-rose-500 border-rose-500/30 bg-rose-500/5' },
  MEDIUM: { label: 'MÉDIA', style: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5' },
  LOW: { label: 'BAIXA', style: 'text-slate-500 border-slate-500/30 bg-slate-500/5' }
};

const difficultyConfig: Record<Difficulty, { label: string, style: string }> = {
  'FÁCIL': { label: 'FÁCIL', style: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' },
  'MÉDIA': { label: 'MÉDIA', style: 'text-amber-500 border-amber-500/30 bg-amber-500/5' },
  'DIFÍCIL': { label: 'DIFÍCIL', style: 'text-orange-500 border-orange-500/30 bg-orange-500/5' },
  'EXTREMA': { label: 'EXTREMA', style: 'text-rose-600 border-rose-600/30 bg-rose-600/5' }
};

const FocusCard: React.FC<FocusCardProps> = ({ 
  demand, 
  timeLeft, 
  isActive, 
  onToggleTimer, 
  onResetTimer, 
  onManualPomoAdd,
  onRemove, 
  onComplete 
}) => {
  const priority = priorityConfig[demand.priority];
  const difficulty = difficultyConfig[demand.difficulty || 'MÉDIA'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAccumulatedTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (25 * 60)) * 100;

  return (
    <div className={`group relative bg-[#030712] border-2 rounded-sm p-4 flex flex-col h-[340px] w-full transition-all duration-500 shadow-2xl ${isActive ? 'border-blue-500 shadow-blue-500/30 ring-1 ring-blue-500/20' : 'border-slate-800'}`}>
      {/* Header com ID e Botões de Controle Rápido */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded-sm border border-slate-800">
            {demand.id}
          </span>
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-blue-400">
            <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
            {isActive ? 'Em Execução' : 'Standby'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onManualPomoAdd}
            className="text-slate-600 hover:text-blue-400 transition-colors p-1"
            title="Registrar Ciclo Manual"
          >
            <CheckCircle size={14} />
          </button>
          <button 
            onClick={() => onRemove(demand.id)}
            className="text-slate-600 hover:text-rose-500 transition-colors p-1"
            title="Remover do Foco"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Título e Metadados */}
      <div className="mb-4">
        <h3 className="text-[12px] font-black text-white uppercase tracking-tight mb-3 line-clamp-1 border-l-2 border-blue-500 pl-2">
          {demand.title}
        </h3>
        
        <div className="grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase truncate">
            <UserCheck size={10} className="text-blue-500 flex-shrink-0" />
            <span className="text-slate-600">Responsável:</span>
            <span className="text-blue-400 truncate">{demand.responsible}</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase truncate">
            <FileText size={10} className="text-slate-700 flex-shrink-0" />
            <span className="text-slate-600">Contrato:</span>
            <span className="text-slate-400 truncate">{demand.contract}</span>
          </div>
        </div>
      </div>

      {/* Cronômetro Central */}
      <div className={`flex-1 flex flex-col justify-center items-center rounded-sm border transition-all my-2 py-2 ${isActive ? 'bg-blue-500/5 border-blue-500/20' : 'bg-black/20 border-slate-800/30'}`}>
        <div className="relative mb-3">
          <div className={`text-4xl font-black tabular-nums tracking-tighter flex items-baseline gap-1 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
            {formatTime(timeLeft)}
            <span className="text-[8px] text-slate-600 tracking-widest uppercase font-bold">min</span>
          </div>
          <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleTimer}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl ${isActive ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'} text-white`}
          >
            {isActive ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
          </button>
          <button 
            onClick={onResetTimer}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-700"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Footer com Tags */}
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
         <div className="flex gap-1.5">
           <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${difficulty.style}`}>
             {difficulty.label}
           </span>
           <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${priority.style}`}>
             {priority.label}
           </span>
         </div>
         <div className="flex items-center gap-1 text-[8px] font-black text-blue-400 uppercase tracking-widest">
           <Clock size={10} />
           <span className="tabular-nums">{formatAccumulatedTime(demand.pomodoros || 0)}</span>
         </div>
      </div>
    </div>
  );
};

export default FocusCard;
