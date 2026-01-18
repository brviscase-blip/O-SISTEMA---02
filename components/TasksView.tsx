
import React, { useState } from 'react';
import { Zap, Target, ShieldX, CheckCircle2, ShieldAlert, Plus, Trash2, Heart } from 'lucide-react';
import { PlayerStatus, Habit, Task, Vice } from '../types';

interface TasksViewProps {
  playerStatus: PlayerStatus;
  onUpdatePlayer: (updates: Partial<PlayerStatus>) => void;
  addNotification: (msg: string, type?: any) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ playerStatus, onUpdatePlayer, addNotification }) => {
  const [activeTab, setActiveTab] = useState<'HABITOS' | 'TAREFAS' | 'VICIOS'>('HABITOS');
  
  // Dano Percentual Baseado no Relatório
  const applyPenalty = (percent: number, label: string) => {
    const damage = Math.ceil(playerStatus.maxHp * percent);
    onUpdatePlayer({ hp: Math.max(0, playerStatus.hp - damage) });
    addNotification(`SISTEMA: -${damage} HP (${label})`, 'error');
  };

  const completeQuest = (xp: number, label: string) => {
    onUpdatePlayer({ xp: playerStatus.xp + xp });
    addNotification(`MISSÃO CONCLUÍDA: +${xp} XP (${label})`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#010307] w-full h-full min-h-0 text-slate-200">
      <div className="sticky top-0 z-20 flex border-b border-white/5 bg-black/80 backdrop-blur-md px-2">
        <TabBtn label="Hábitos" active={activeTab === 'HABITOS'} color="purple-500" onClick={() => setActiveTab('HABITOS')} icon={<Zap size={14}/>} />
        <TabBtn label="Missões" active={activeTab === 'TAREFAS'} color="blue-500" onClick={() => setActiveTab('TAREFAS')} icon={<Target size={14}/>} />
        <TabBtn label="Penalidades" active={activeTab === 'VICIOS'} color="rose-500" onClick={() => setActiveTab('VICIOS')} icon={<ShieldX size={14}/>} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'TAREFAS' && (
           <div className="grid gap-4">
              <QuestActionCard title="Leitura de 15 min" xp={50} onClick={() => completeQuest(50, "Leitura")} />
              <QuestActionCard title="Treino Físico Completo" xp={200} onClick={() => completeQuest(200, "Treino")} />
           </div>
        )}

        {activeTab === 'VICIOS' && (
           <div className="grid gap-4">
              <PenaltyActionCard title="Recaída Leve" penalty={0.03} onClick={() => applyPenalty(0.03, "Leve")} />
              <PenaltyActionCard title="Recaída Moderada" penalty={0.08} onClick={() => applyPenalty(0.08, "Moderada")} />
              <PenaltyActionCard title="Vício (Grave)" penalty={0.20} onClick={() => applyPenalty(0.20, "Grave")} />
              <PenaltyActionCard title="24h Offline (Crítica)" penalty={0.50} onClick={() => applyPenalty(0.50, "Crítica")} />
           </div>
        )}

        {activeTab === 'HABITOS' && (
           <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Zap size={48} />
              <p className="text-[10px] font-black uppercase mt-4">Nenhum Hábito Cadastrado</p>
           </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ label, active, onClick, icon, color }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 py-4 transition-all border-b-2 ${active ? `border-${color} text-white bg-white/5` : 'border-transparent text-slate-600'}`}>
    <span className={active ? `text-${color}` : ''}>{icon}</span>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const QuestActionCard = ({ title, xp, onClick }: any) => (
  <button onClick={onClick} className="w-full p-4 bg-slate-900/50 border border-slate-800 rounded-sm flex items-center justify-between hover:border-blue-500 transition-all group">
     <div className="text-left">
        <h4 className="text-sm font-black text-white uppercase italic">{title}</h4>
        <span className="text-[10px] font-bold text-blue-500 tracking-widest">+ {xp} XP</span>
     </div>
     <CheckCircle2 size={24} className="text-slate-800 group-hover:text-blue-500" />
  </button>
);

const PenaltyActionCard = ({ title, penalty, onClick }: any) => (
  <button onClick={onClick} className="w-full p-4 bg-rose-950/10 border border-rose-900/30 rounded-sm flex items-center justify-between hover:border-rose-600 transition-all group">
     <div className="text-left">
        <h4 className="text-sm font-black text-rose-500 uppercase italic">{title}</h4>
        <span className="text-[10px] font-bold text-rose-900 tracking-widest">- {penalty * 100}% HP GLOBAL</span>
     </div>
     <Heart size={24} className="text-rose-950 group-hover:text-rose-600" />
  </button>
);

export default TasksView;
