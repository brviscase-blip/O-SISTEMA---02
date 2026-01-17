
import React from 'react';
// Added XCircle to imports
import { AlertCircle, CheckCircle2, PlayCircle, Ban, Edit2, Trash2, UserCheck, FileText, Calendar, Timer, Zap, ListTodo, User, Plus, Clock, XCircle } from 'lucide-react';
import { DemandItem, DemandStatus, Priority, Difficulty } from '../types';

interface DemandTableProps {
  demands: DemandItem[];
  onEdit: (demand: DemandItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onManageSubs?: (demand: DemandItem) => void;
}

// Added CANCELLED to statusConfig to satisfy Record<DemandStatus, ...> requirement
const statusConfig: Record<DemandStatus, { label: string, color: string, icon: React.ReactNode }> = {
  OPEN: { label: 'Aberta', color: 'text-blue-400 bg-blue-400/10', icon: <AlertCircle size={10} /> },
  IN_PROGRESS: { label: 'Em Curso', color: 'text-yellow-400 bg-yellow-400/10', icon: <PlayCircle size={10} /> },
  COMPLETED: { label: 'Concluída', color: 'text-emerald-400 bg-emerald-400/10', icon: <CheckCircle2 size={10} /> },
  BLOCKED: { label: 'Bloqueada', color: 'text-rose-400 bg-rose-400/10', icon: <Ban size={10} /> },
  CANCELLED: { label: 'Cancelada', color: 'text-slate-500 bg-slate-500/10', icon: <XCircle size={10} /> }
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

const DemandTable: React.FC<DemandTableProps> = ({ demands, onEdit, onDelete, onAdd, onManageSubs }) => {
  const calculateProgress = (demand: DemandItem) => {
    const totalSubs = demand.subActivities?.length || 0;
    if (totalSubs > 0) {
      const completedSubs = demand.subActivities.filter(s => s.completed).length;
      return Math.round((completedSubs / totalSubs) * 100);
    }
    return demand.status === 'COMPLETED' ? 100 : 0;
  };

  const formatAccumulatedTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-dashed border-blue-500/30 bg-blue-500/5 text-blue-400 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
        >
          <Plus size={14} className="group-hover:scale-125 transition-transform" />
          Registrar Nova Demanda
        </button>
      </div>

      <div className="w-full overflow-x-auto bg-[#0f172a]/20 border border-slate-800 rounded-sm">
        <table className="w-full text-left border-collapse min-w-[1600px] table-fixed">
          <thead>
            <tr className="border-b-2 border-slate-700 bg-[#030712] shadow-sm">
              <th className="w-[70px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-400 uppercase">ID</th>
              <th className="w-[220px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Título</th>
              <th className="w-[110px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Status</th>
              <th className="w-[130px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Progresso</th>
              <th className="w-[60px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Sub</th>
              <th className="w-[150px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Solicitante</th>
              <th className="w-[150px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Responsável</th>
              <th className="w-[130px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Contrato</th>
              <th className="w-[100px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Início</th>
              <th className="w-[100px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Prazo</th>
              <th className="w-[110px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Tempo Foco</th>
              <th className="w-[80px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Dif.</th>
              <th className="w-[90px] px-3 py-5 text-[9px] font-black tracking-widest text-slate-200 uppercase">Prioridade</th>
              <th className="w-[100px] px-3 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {demands.map((demand) => {
              const status = statusConfig[demand.status];
              const priority = priorityConfig[demand.priority];
              const difficulty = difficultyConfig[demand.difficulty || 'MÉDIA'];
              const progress = calculateProgress(demand);
              const totalCount = demand.subActivities?.length || 0;
              const completedCount = demand.subActivities?.filter(s => s.completed).length || 0;

              return (
                <tr 
                  key={demand.id} 
                  className="group even:bg-[#0f172a]/40 odd:bg-transparent hover:bg-slate-800/40 transition-all duration-200"
                >
                  <td className="px-3 py-4 text-[10px] font-bold text-slate-600">{demand.id}</td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col max-w-full">
                      <span className="text-[13px] font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {demand.title}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{demand.description}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase">
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-blue-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    {totalCount > 0 && (
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500/80">
                        <ListTodo size={11} />
                        {completedCount}/{totalCount}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 text-[11px] font-semibold text-slate-400 truncate">
                    <div className="flex items-center gap-1.5">
                      <User size={10} className="text-slate-600 flex-shrink-0" />
                      <span className="truncate">{demand.requester}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[11px] font-semibold text-slate-400 truncate">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={10} className="text-slate-600 flex-shrink-0" />
                      <span className="truncate">{demand.responsible}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[11px] font-semibold text-slate-400 truncate">
                    <div className="flex items-center gap-1.5">
                      <FileText size={10} className="text-slate-600 flex-shrink-0" />
                      <span className="truncate">{demand.contract}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} className="text-slate-700" />
                      {demand.startDate}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} className="text-slate-600" />
                      {demand.dueDate}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[11px] font-bold text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-blue-500" />
                      <span className="tabular-nums">{formatAccumulatedTime(demand.pomodoros || 0)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${difficulty.style}`}>
                      {difficulty.label}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${priority.style}`}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onManageSubs?.(demand)}
                        className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                        title="Sub-atividades"
                      >
                        <ListTodo size={14} />
                      </button>
                      <button 
                        onClick={() => onEdit(demand)}
                        className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(demand.id)}
                        className="p-1 text-slate-500 hover:text-rose-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemandTable;
