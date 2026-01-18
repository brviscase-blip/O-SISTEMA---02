
import React, { useState } from 'react';
import { Zap, Target, ShieldX, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Habit, PlayerStatus, Task, Vice } from '../types';

interface TasksViewProps {
  playerStatus: PlayerStatus;
  onUpdatePlayer: (updates: Partial<PlayerStatus>) => void;
  addNotification: (msg: string, type?: any) => void;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  vices: Vice[];
  setVices: React.Dispatch<React.SetStateAction<Vice[]>>;
}

const TasksView: React.FC<TasksViewProps> = ({ 
  playerStatus, onUpdatePlayer, addNotification,
  habits, setHabits, tasks, setTasks, vices, setVices
}) => {
  const [activeTab, setActiveTab] = useState<'HABITOS' | 'TAREFAS' | 'VICIOS'>('HABITOS');
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayDOW = now.getDay();

  // MOTOR DE PENALIDADE: Dano Percentual ao HP Global
  const applySystemPenalty = (percent: number, label: string) => {
    const damage = Math.ceil(playerStatus.maxHp * percent);
    onUpdatePlayer({ hp: Math.max(0, playerStatus.hp - damage) });
    addNotification(`PENALIDADE DO SISTEMA: -${damage} HP Global (${label})`, 'error');
  };

  const handleActionCheck = (type: 'HABITO' | 'TAREFA' | 'VICIO', id: string) => {
    if (type === 'HABITO') {
      const h = habits.find(x => x.id === id);
      if (!h || !h.days.includes(todayDOW)) return;
      const currentProgress = Number(h.completedDays[todayStr] || 0);
      
      if (currentProgress < h.targetValue) {
        const nextProgress = currentProgress + 1;
        const isFinished = nextProgress >= h.targetValue;
        setHabits(prev => prev.map(x => x.id === id ? {...x, completedDays: {...x.completedDays, [todayStr]: nextProgress}, streak: isFinished ? x.streak + 1 : x.streak} : x));
        if (isFinished) {
          onUpdatePlayer({ xp: playerStatus.xp + h.xpReward });
          addNotification(`HÁBITO VALIDADO: +${h.xpReward} XP`, 'success');
        }
      }
    } else if (type === 'TAREFA') {
      setTasks(prev => prev.map(t => {
        if (t.id === id && !t.completed) {
          onUpdatePlayer({ xp: playerStatus.xp + t.xpReward });
          addNotification(`MISSÃO CONCLUÍDA: +${t.xpReward} XP`, 'success');
          return { ...t, completed: true, currentProgress: t.targetValue, lastCompleted: todayStr };
        }
        return t;
      }));
    } else {
        // VÍCIOS: Recaída = Dano Grave (-20% HP Global)
        setVices(prev => prev.map(v => {
            if (v.id === id) {
                applySystemPenalty(0.20, 'RECAÍDA GRAVE');
                return { ...v, currentCount: v.currentCount + 1 };
            }
            return v;
        }));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#010307] w-full min-h-0 text-slate-200">
      <div className="sticky top-0 z-20 flex border-b border-white/5 bg-black/80 backdrop-blur-md px-2">
        <TabBtn label="Hábitos" active={activeTab === 'HABITOS'} color="purple-500" onClick={() => setActiveTab('HABITOS')} icon={<Zap size={14}/>} />
        <TabBtn label="Tarefas" active={activeTab === 'TAREFAS'} color="blue-500" onClick={() => setActiveTab('TAREFAS')} icon={<Target size={14}/>} />
        <TabBtn label="Vícios" active={activeTab === 'VICIOS'} color="rose-500" onClick={() => setActiveTab('VICIOS')} icon={<ShieldX size={14}/>} />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
         <ShieldAlert size={48} className="text-slate-700 mb-4" />
         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Módulo de Sobrevivência Sincronizado</p>
         <p className="text-[8px] font-bold text-slate-600 uppercase mt-2">Falhas leves reduzem 3% da sua Vitalidade Global.</p>
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

export default TasksView;
