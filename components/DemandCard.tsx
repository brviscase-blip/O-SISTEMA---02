
import React, { useState } from 'react';
// Added XCircle to imports
import { Clock, User, AlertCircle, CheckCircle2, PlayCircle, Ban, Edit2, Trash2, Timer, UserCheck, Zap, ListTodo, XCircle } from 'lucide-react';
import { DemandItem, DemandStatus, Priority, Difficulty } from '../types';

interface DemandCardProps {
  demand: DemandItem;
  isFocused?: boolean;
  onEdit?: (demand: DemandItem) => void;
  onDelete?: (id: string) => void;
  onManageSubs?: (demand: DemandItem) => void;
  onDropOnCard?: (draggedId: string, targetId: string) => void;
  isDraggable?: boolean;
}

// Added CANCELLED to statusConfig to satisfy Record<DemandStatus, ...> requirement
const statusConfig: Record<DemandStatus, { label: string, color: string, icon: React.ReactNode }> = {
  OPEN: { label: 'ABERTA', color: 'text-blue-400 bg-blue-400/10', icon: <AlertCircle size={10} /> },
  IN_PROGRESS: { label: 'EM CURSO', color: 'text-yellow-400 bg-yellow-400/10', icon: <PlayCircle size={10} /> },
  COMPLETED: { label: 'CONCLUÍDA', color: 'text-emerald-400 bg-emerald-400/10', icon: <CheckCircle2 size={10} /> },
  BLOCKED: { label: 'BLOQUEADA', color: 'text-rose-400 bg-rose-400/10', icon: <Ban size={10} /> },
  CANCELLED: { label: 'CANCELADA', color: 'text-slate-500 bg-slate-500/10', icon: <XCircle size={10} /> }
};

const priorityConfig: Record<Priority, { label: string, style: string }> = {
  HIGH: { label: 'ALTA', style: 'text-rose-500' },
  MEDIUM: { label: 'MÉDIA', style: 'text-yellow-500' },
  LOW: { label: 'BAIXA', style: 'text-slate-500' }
};

const difficultyConfig: Record<Difficulty, { label: string, style: string }> = {
  'FÁCIL': { label: 'FÁCIL', style: 'text-emerald-500' },
  'MÉDIA': { label: 'MÉDIA', style: 'text-amber-500' },
  'DIFÍCIL': { label: 'DIFÍCIL', style: 'text-orange-500' },
  'EXTREMA': { label: 'EXTREMA', style: 'text-rose-600' }
};

const DemandCard: React.FC<DemandCardProps> = ({ 
  demand, 
  isFocused = false,
  onEdit, 
  onDelete, 
  onManageSubs,
  onDropOnCard, 
  isDraggable 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const status = statusConfig[demand.status];
  const priority = priorityConfig[demand.priority];
  const difficulty = difficultyConfig[demand.difficulty || 'MÉDIA'];

  const totalSubs = demand.subActivities?.length || 0;
  const completedCount = demand.subActivities?.filter(s => s.completed).length || 0;
  
  const progress = totalSubs > 0 
    ? Math.round((completedCount / totalSubs) * 100)
    : (demand.status === 'COMPLETED' ? 100 : 0);

  const formatAccumulatedTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) return;
    const element = e.currentTarget as HTMLElement;
    e.dataTransfer.setData('demandId', demand.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (element) {
        element.style.opacity = '0.4';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('demandId');
    if (draggedId && draggedId !== demand.id) {
      onDropOnCard?.(draggedId, demand.id);
    }
  };

  return (
    <div 
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative bg-[#0a0f1d] border rounded-sm p-3 hover:border-slate-600 transition-all duration-300 flex flex-col h-[172px] w-full
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''} 
        ${isFocused ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20' : 'border-slate-800'}
        ${isDragOver ? 'border-blue-500 ring-1 ring-blue-500/30' : ''}
      `}
    >
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
           <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-widest uppercase ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
          {isFocused && <Zap size={8} className="text-blue-500 animate-pulse" fill="currentColor" />}
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold text-slate-600 tracking-wider uppercase">{demand.id}</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
             <button onClick={(e) => { e.stopPropagation(); onManageSubs?.(demand); }} className="p-0.5 hover:text-emerald-400 text-slate-500 transition-colors">
               <ListTodo size={10} />
             </button>
             <button onClick={(e) => { e.stopPropagation(); onEdit?.(demand); }} className="p-0.5 hover:text-blue-400 text-slate-500 transition-colors">
               <Edit2 size={10} />
             </button>
             <button onClick={(e) => { e.stopPropagation(); onDelete?.(demand.id); }} className="p-0.5 hover:text-rose-500 text-slate-500 transition-colors">
               <Trash2 size={10} />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <h3 className="text-[11px] font-black text-white mb-2 leading-tight tracking-tight line-clamp-2 h-[26px]">
          {demand.title}
        </h3>

        <div className="mb-2 space-y-1">
          <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-slate-600">
            <span>Progresso</span>
            <span className={progress === 100 ? 'text-emerald-500' : 'text-blue-400'}>{progress}%</span>
          </div>
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase">
             <Clock size={10} className="text-blue-500" />
             <span className="tabular-nums">{formatAccumulatedTime(demand.pomodoros || 0)}</span>
          </div>
          <div className="flex items-center gap-1 text-[8px] font-black tracking-tighter">
             <Zap size={10} className={difficulty.style} />
             <span className={difficulty.style}>{difficulty.label}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/50 pt-2 mt-auto space-y-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.05em] text-blue-400 truncate">
          <UserCheck size={9} className="text-blue-500 flex-shrink-0" />
          <span className="truncate">{demand.responsible}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 uppercase">
            <span>{demand.dueDate}</span>
          </div>
          <div className={`text-[8px] font-black uppercase tracking-widest ${priority.style}`}>
            {priority.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandCard;
