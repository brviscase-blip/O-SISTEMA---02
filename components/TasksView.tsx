
import React, { useState, useMemo } from 'react';
import { 
  Zap, Target, ShieldX, CheckCircle2, Plus, Trash2, X, Info, 
  Calendar, Clock, Dumbbell, Book, Droplets, Utensils, Brain, Coffee, Star,
  ChevronLeft, ChevronRight, RotateCcw, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert,
  Minus, Check, Maximize2, Minimize2
} from 'lucide-react';
import { Habit, PlayerStatus, Task, Vice, ItemRank } from '../types';

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

const getRankTitle = (rank: ItemRank) => {
  if (['E', 'D'].includes(rank)) return 'Operativo';
  if (['C', 'B'].includes(rank)) return 'Elite';
  return 'Monarca';
};

const DAYS_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const ICON_LIST = [
  { id: 'zap', icon: <Zap size={22} /> },
  { id: 'target', icon: <Target size={22} /> },
  { id: 'dumbbell', icon: <Dumbbell size={22} /> },
  { id: 'book', icon: <Book size={22} /> },
  { id: 'droplets', icon: <Droplets size={22} /> },
  { id: 'utensils', icon: <Utensils size={22} /> },
  { id: 'brain', icon: <Brain size={22} /> },
  { id: 'coffee', icon: <Coffee size={22} /> },
  { id: 'star', icon: <Star size={22} /> },
  { id: 'shield', icon: <ShieldX size={22} /> },
];

const TasksView: React.FC<TasksViewProps> = ({ 
  playerStatus, onUpdatePlayer, addNotification,
  habits, setHabits, tasks, setTasks, vices, setVices
}) => {
  const [activeTab, setActiveTab] = useState<'HABITOS' | 'TAREFAS' | 'VICIOS'>('HABITOS');
  const [showModal, setShowModal] = useState<'HABITO' | 'TAREFA' | 'VICIO' | null>(null);
  // PROTOCOLO DE FOCO: Calendários agora iniciam recolhidos por padrão
  const [globalExpanded, setGlobalExpanded] = useState(false);
  const rankTitle = getRankTitle(playerStatus.rank);
  
  const themeColor = activeTab === 'HABITOS' ? 'purple' : activeTab === 'TAREFAS' ? 'blue' : 'rose';
  const themeHex = activeTab === 'HABITOS' ? '#a855f7' : activeTab === 'TAREFAS' ? '#3b82f6' : '#f43f5e';

  const [itemToPrepareDelete, setItemToPrepareDelete] = useState<{ id: string, name: string, type: 'HABITO' | 'TAREFA' | 'VICIO' } | null>(null);
  const [deleteConfirmationActive, setDeleteConfirmationActive] = useState<{ id: string, name: string, type: 'HABITO' | 'TAREFA' | 'VICIO' } | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  
  const [individualExpansion, setIndividualExpansion] = useState<Record<string, boolean>>({});

  const [newHabitName, setNewHabitName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedIcon, setSelectedIcon] = useState('zap');
  const [targetQuantity, setTargetQuantity] = useState(1);
  const [reminderTime, setReminderTime] = useState('');
  
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [startDate, setStartDate] = useState(now.toISOString().split('T')[0]);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(now);
  const todayDOW = now.getDay();

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(viewYear, viewMonth, i);
      grid.push({ day: i, iso: getLocalDateString(date), dow: date.getDay() });
    }
    return grid;
  }, [viewMonth, viewYear]);

  const changeMonth = (offset: number) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const toggleGlobalExpansion = () => {
    const newState = !globalExpanded;
    setGlobalExpanded(newState);
    const updated: Record<string, boolean> = {};
    [...habits, ...tasks, ...vices].forEach(item => {
      updated[item.id] = newState;
    });
    setIndividualExpansion(updated);
  };

  const getIconById = (id: string, size = 18) => {
    const item = ICON_LIST.find(i => i.id === id);
    /* Fixed line 122: Cast to React.ReactElement and any for props to ensure 'size' property is accepted by lucide-react components when cloned */
    return item ? React.cloneElement(item.icon as React.ReactElement, { size } as any) : <Zap size={size} />;
  };

  const handleActionCheck = (type: 'HABITO' | 'TAREFA' | 'VICIO', id: string) => {
    if (type === 'HABITO') {
      const h = habits.find(x => x.id === id);
      if (!h || !h.days.includes(todayDOW)) return;

      const currentVal = h.completedDays[todayStr];
      const currentProgress = currentVal === true ? h.targetValue : (Number(currentVal) || 0);
      const isAlreadyFinished = currentProgress >= h.targetValue;

      if (isAlreadyFinished) {
        setHabits(prev => prev.map(x => x.id === id ? {
          ...x, 
          completedDays: { ...x.completedDays, [todayStr]: 0 },
          streak: Math.max(0, x.streak - 1)
        } : x));
        onUpdatePlayer({ xp: Math.max(0, playerStatus.xp - h.xpReward) });
        return;
      }

      const nextProgress = currentProgress + 1;
      const winThreshold = h.targetValue > 1 ? h.targetValue - 1 : h.targetValue;
      const isWin = nextProgress >= winThreshold;
      const isFullFinished = nextProgress >= h.targetValue;

      setHabits(prev => prev.map(x => x.id === id ? {
        ...x, 
        completedDays: { ...x.completedDays, [todayStr]: nextProgress },
        streak: isWin ? x.streak + 1 : x.streak
      } : x));

      if (isFullFinished) {
        onUpdatePlayer({ xp: playerStatus.xp + h.xpReward, mp: Math.min(playerStatus.maxMp, playerStatus.mp + 5) });
        addNotification(`Missão Concluída: +${h.xpReward} XP`, 'success');
      } else if (isWin && nextProgress === winThreshold) {
        addNotification(`Quase-Vitória: Sistema Validado`, 'info');
      }
    } else if (type === 'TAREFA') {
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          if (t.isRecurring && !t.days.includes(todayDOW)) {
            addNotification('Hoje não é dia de execução para esta tarefa.', 'warning');
            return t;
          }

          const currentProgress = t.currentProgress || 0;
          if (t.completed) {
            onUpdatePlayer({ xp: Math.max(0, playerStatus.xp - t.xpReward) });
            return { ...t, completed: false, currentProgress: 0 };
          }
          const nextProgress = currentProgress + 1;
          
          if (nextProgress >= t.targetValue) {
            onUpdatePlayer({ xp: playerStatus.xp + t.xpReward });
            addNotification(`Tarefa Concluída: +${t.xpReward} XP`, 'success');
            return { ...t, completed: true, currentProgress: nextProgress, lastCompleted: todayStr };
          }
          return { ...t, currentProgress: nextProgress };
        }
        return t;
      }));
    } else {
        setVices(prev => prev.map(v => {
            if (v.id === id) {
                const newCount = v.currentCount + 1;
                const oldVal = (v as any).incidentLog?.[todayStr] || 0;
                const newIncidentLog = { ...(v as any).incidentLog || {}, [todayStr]: oldVal + 1 };
                
                onUpdatePlayer({ hp: Math.max(1, playerStatus.hp - v.penaltyHp) });
                addNotification(`Protocolo Violado: -${v.penaltyHp} HP`, 'error');
                
                return { ...v, currentCount: newCount, incidentLog: newIncidentLog } as any;
            }
            return v;
        }));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const baseId = Math.random().toString(36).substring(2, 11);
    
    if (showModal === 'HABITO') {
      const newHabit: Habit = {
        id: baseId, name: newHabitName, icon: selectedIcon, startDate: startDate, reminderTime: reminderTime, days: selectedDays, completedDays: {}, xpReward: 100, streak: 0, targetValue: targetQuantity
      };
      setHabits(prev => [...prev, newHabit]);
      addNotification('Missão Ativada', 'alert');
    } else if (showModal === 'TAREFA') {
      const newTask: Task = {
        id: baseId, title: newHabitName, icon: selectedIcon, startDate: startDate, reminderTime: reminderTime, isRecurring: true, days: selectedDays, completed: false, targetValue: targetQuantity, currentProgress: 0, xpReward: 50 * targetQuantity
      };
      setTasks(prev => [...prev, newTask]);
      addNotification('Tarefa Registrada', 'success');
    } else if (showModal === 'VICIO') {
        const newVice: any = {
            id: baseId,
            name: newHabitName,
            initialLimit: 0,
            currentCount: 0,
            penaltyHp: 10,
            startDate: startDate,
            incidentLog: {}
        };
        setVices(prev => [...prev, newVice]);
        addNotification('Contenção Iniciada', 'error');
    }
    resetModalFields();
  };

  const resetModalFields = () => {
    setShowModal(null);
    setNewHabitName('');
    setTargetQuantity(1);
    setSelectedIcon(activeTab === 'HABITOS' ? 'zap' : activeTab === 'TAREFAS' ? 'target' : 'shield');
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    setReminderTime('');
    setStartDate(now.toISOString().split('T')[0]);
  };

  const toggleIndividual = (id: string) => {
    setIndividualExpansion(prev => ({ ...prev, [id]: !(prev[id] ?? globalExpanded) }));
  };

  const confirmDeleteFinal = () => {
    if (deleteConfirmationActive && deleteInput === deleteConfirmationActive.name) {
      if (deleteConfirmationActive.type === 'HABITO') {
        setHabits(prev => prev.filter(h => h.id !== deleteConfirmationActive.id));
      } else if (deleteConfirmationActive.type === 'TAREFA') {
        setTasks(prev => prev.filter(t => t.id !== deleteConfirmationActive.id));
      } else {
        setVices(prev => prev.filter(v => v.id !== deleteConfirmationActive.id));
      }
      addNotification('Registro Expurmado', 'error');
      setDeleteConfirmationActive(null);
      setDeleteInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#010307] w-full min-h-0 text-slate-200">
      <div className="sticky top-0 z-20 flex border-b border-white/5 bg-black/80 backdrop-blur-md px-2">
        <TabBtn label="Hábitos" active={activeTab === 'HABITOS'} color="purple-500" onClick={() => setActiveTab('HABITOS')} icon={<Zap size={14}/>} />
        <TabBtn label="Tarefas" active={activeTab === 'TAREFAS'} color="blue-500" onClick={() => setActiveTab('TAREFAS')} icon={<Target size={14}/>} />
        <TabBtn label="Vícios" active={activeTab === 'VICIOS'} color="rose-500" onClick={() => setActiveTab('VICIOS')} icon={<ShieldX size={14}/>} />
      </div>

      <div className="p-4 space-y-6 pb-32 overflow-y-auto no-scrollbar">
        {/* CABEÇALHO DE MÊS */}
        <div className={`flex justify-between items-center bg-[#030712] border ${activeTab === 'HABITOS' ? 'border-purple-900/50' : activeTab === 'TAREFAS' ? 'border-blue-900/50' : 'border-rose-900/50'} p-4 rounded-sm shadow-lg w-full transition-colors duration-500`}>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-white uppercase tracking-widest italic">{MONTHS_LABELS[viewMonth]} {viewYear}</h2>
            <span className={`text-[9px] font-bold ${activeTab === 'HABITOS' ? 'text-purple-500' : activeTab === 'TAREFAS' ? 'text-blue-500' : 'text-rose-500'} uppercase tracking-tighter transition-colors`}>
              Sincronização Temporal: {rankTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 text-slate-500 hover:text-white border border-slate-800 rounded-sm transition-colors"><ChevronLeft size={16}/></button>
            <button onClick={() => { setViewMonth(now.getMonth()); setViewYear(now.getFullYear()); }} className={`px-3 py-2 text-[9px] font-black text-white ${activeTab === 'HABITOS' ? 'bg-purple-600' : activeTab === 'TAREFAS' ? 'bg-blue-600' : 'bg-rose-600'} rounded-sm hover:opacity-80 transition-all`}>HOJE</button>
            <button onClick={() => changeMonth(1)} className="p-2 text-slate-500 hover:text-white border border-slate-800 rounded-sm transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>

        {/* BARRA DE CONTROLES */}
        <div className="flex flex-col gap-3 w-full">
          <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Info size={11} /> {activeTab === 'HABITOS' ? `Matriz de Consistência - ${rankTitle}` : activeTab === 'TAREFAS' ? 'Quadro de Execução' : 'Protocolos de Contenção'}
          </h3>
          
          <div className="flex items-center gap-2 px-1">
             <button 
                onClick={toggleGlobalExpansion}
                className="w-[52px] h-[30px] flex items-center justify-center bg-slate-900/50 border border-slate-800 rounded-sm text-slate-400 hover:text-white hover:border-slate-700 transition-all flex-shrink-0"
              >
                {globalExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              <button 
                onClick={() => { 
                    setShowModal(activeTab === 'HABITOS' ? 'HABITO' : activeTab === 'TAREFAS' ? 'TAREFA' : 'VICIO'); 
                    setTargetQuantity(1); 
                    setSelectedIcon(activeTab === 'HABITOS' ? 'zap' : activeTab === 'TAREFAS' ? 'target' : 'shield'); 
                }} 
                className={`w-[52px] h-[30px] group relative flex items-center justify-center overflow-hidden rounded-sm transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] shadow-lg flex-shrink-0 ${activeTab === 'HABITOS' ? 'shadow-purple-500/10' : activeTab === 'TAREFAS' ? 'shadow-blue-500/10' : 'shadow-rose-500/10'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${activeTab === 'HABITOS' ? 'from-purple-600 to-indigo-600' : activeTab === 'TAREFAS' ? 'from-blue-600 to-cyan-600' : 'from-rose-600 to-orange-600'}`} />
                <div className="absolute inset-[1.5px] bg-[#010307]/60 rounded-sm backdrop-blur-sm" />
                <Plus size={16} className="relative z-10 text-white transition-transform duration-300" />
              </button>
          </div>
        </div>

        {/* GRID DE CARDS UNIFICADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start w-full">
          {(activeTab === 'HABITOS' || activeTab === 'TAREFAS') && (activeTab === 'HABITOS' ? habits : tasks).map(item => {
            const name = 'name' in item ? item.name : item.title;
            const isExpanded = individualExpansion[item.id] ?? globalExpanded;
            const currentDayProgress = 'completedDays' in item 
              ? (item.completedDays[todayStr] === true ? item.targetValue : (Number(item.completedDays[todayStr]) || 0))
              : item.currentProgress;
            const winThreshold = item.targetValue > 1 ? item.targetValue - 1 : item.targetValue;
            const isTodayFinished = currentDayProgress >= winThreshold;
            const historyLog = 'completedDays' in item ? item.completedDays : { [item.lastCompleted || todayStr]: item.completed ? item.targetValue : 0 };

            return (
              <div key={item.id} className={`bg-[#030712] border ${activeTab === 'HABITOS' ? 'border-purple-900/30 hover:border-purple-500/50' : 'border-blue-900/30 hover:border-blue-500/50'} rounded-sm overflow-hidden shadow-2xl flex flex-col w-full group transition-all`}>
                <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${activeTab === 'HABITOS' ? 'bg-purple-950/20 border-purple-900/50 text-purple-500' : 'bg-blue-950/20 border-blue-900/50 text-blue-500'} border rounded flex items-center justify-center`}>
                      {getIconById(item.icon || (activeTab === 'HABITOS' ? 'zap' : 'target'), 20)}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{name}</h4>
                      <p className={`text-[8px] font-bold ${activeTab === 'HABITOS' ? 'text-purple-500/60' : 'text-blue-500/60'} uppercase`}>
                        {activeTab === 'HABITOS' ? `Streak: ${item.streak}` : `XP: ${item.xpReward}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleIndividual(item.id)} className="text-slate-500 hover:text-white p-2 transition-colors">
                      {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                    <button onClick={() => setItemToPrepareDelete({ id: item.id, name, type: activeTab === 'HABITOS' ? 'HABITO' : 'TAREFA' })} className="text-slate-800 hover:text-rose-500 p-1 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Status Hoje: {currentDayProgress}/{item.targetValue}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isTodayFinished ? (activeTab === 'HABITOS' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white') : 'bg-slate-800 text-slate-400'}`}>
                        {isTodayFinished ? 'VALIDADO' : 'PENDENTE'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full transition-all duration-700 ${activeTab === 'HABITOS' ? 'bg-purple-500' : 'bg-blue-500'}`} 
                        style={{ width: `${Math.min(100, (currentDayProgress / item.targetValue) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleActionCheck(activeTab === 'HABITOS' ? 'HABITO' : 'TAREFA', item.id)}
                    className={`w-full py-2 bg-${themeColor}-900/20 border border-${themeColor}-900/50 hover:bg-${themeColor}-600 hover:text-white text-${themeColor}-500 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2`}
                  >
                    {currentDayProgress >= item.targetValue ? <RotateCcw size={12} /> : <Check size={12} />} 
                    {currentDayProgress >= item.targetValue ? 'REINICIAR HOJE' : item.targetValue > 1 ? 'INCREMENTAR' : 'CONCLUIR MISSÃO'}
                  </button>
                </div>

                <div className={`${isExpanded ? 'block' : 'hidden'} p-3 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-2 duration-300`}>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_LABELS.map((l, i) => (
                      <span key={i} className={`text-[11px] font-black text-center ${('days' in item && item.days.includes(i)) ? (activeTab === 'HABITOS' ? 'text-purple-400' : 'text-blue-400') : 'text-slate-700'}`}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((cell, idx) => {
                      if (!cell) return <div key={`empty-${idx}`} className="aspect-square" />;
                      
                      const rawVal = historyLog[cell.iso];
                      const progressAtDay = rawVal === true ? item.targetValue : (Number(rawVal) || 0);
                      const isRequired = 'days' in item ? item.days.includes(cell.dow) : true;
                      
                      const threshold = item.targetValue > 1 ? item.targetValue - 1 : item.targetValue;
                      const isDayWin = progressAtDay >= threshold;
                      const isToday = cell.iso === todayStr;
                      const isPast = cell.iso < todayStr;
                      const isAfterStart = cell.iso >= item.startDate;
                      const isFailed = isPast && isAfterStart && isRequired && !isDayWin;

                      let bgClass = isRequired ? 'bg-[#020617] border-slate-900' : 'bg-[#010203] border-white/5 opacity-40';
                      if (isDayWin) bgClass = activeTab === 'HABITOS' ? 'bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
                      else if (isFailed) bgClass = 'bg-rose-700 border-rose-500';

                      const fillPercent = Math.min(100, (progressAtDay / item.targetValue) * 100);

                      return (
                        <div key={cell.iso} className={`aspect-square border flex flex-col items-center justify-center relative transition-all rounded-[1px] ${bgClass} ${isToday ? 'ring-1 ring-white/20 z-10' : ''}`}>
                          {isDayWin && item.targetValue > 1 && (
                            <div className="absolute inset-0 bg-white/10" style={{ height: `${fillPercent}%`, bottom: 0, top: 'auto' }} />
                          )}
                          <span className={`absolute top-0.5 left-1 text-[7px] font-black uppercase tracking-tighter ${isDayWin || isFailed ? 'text-white/40' : 'text-slate-800'}`}>
                            {cell.day}
                          </span>
                          <div className="relative z-10">
                            {item.targetValue === 1 ? (
                              isDayWin ? <CheckCircle2 size={12} className="text-white" /> : 
                              isFailed ? <X size={12} className="text-white/60" /> : null
                            ) : (
                              (isDayWin || progressAtDay > 0) ? (
                                <span className="text-[12px] font-black text-white italic tabular-nums">{progressAtDay}</span>
                              ) : isFailed ? (
                                <X size={12} className="text-white/40" />
                              ) : null
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {activeTab === 'VICIOS' && vices.map(vice => {
            const isExpanded = individualExpansion[vice.id] ?? globalExpanded;
            const incidentLog = (vice as any).incidentLog || {};
            const startDate = (vice as any).startDate || todayStr;

            return (
              <div key={vice.id} className="bg-[#030712] border border-rose-900/30 rounded-sm overflow-hidden shadow-2xl flex flex-col w-full group transition-all hover:border-rose-500/50">
                <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-950/20 border border-rose-900/50 rounded flex items-center justify-center text-rose-500">
                      <ShieldX size={20} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{vice.name}</h4>
                      <p className="text-[8px] font-bold text-rose-500/60 uppercase">Controle de Danos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleIndividual(vice.id)} className="text-slate-500 hover:text-white p-2 transition-colors">
                      {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                    <button onClick={() => setItemToPrepareDelete({ id: vice.id, name: vice.name, type: 'VICIO' })} className="text-slate-800 hover:text-rose-500 p-1 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center bg-rose-950/10 p-3 border border-rose-900/30 rounded-sm">
                    <div>
                      <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Incidentes Hoje</p>
                      <p className="text-xl font-black text-white italic tabular-nums">{incidentLog[todayStr] || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase">Total Acumulado</p>
                      <p className="text-sm font-black text-slate-400 tabular-nums">{vice.currentCount}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleActionCheck('VICIO', vice.id)}
                    className="w-full py-2 bg-rose-900/20 border border-rose-900/50 hover:bg-rose-600 hover:text-white text-rose-500 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    <ShieldAlert size={12} /> REGISTRAR RECAÍDA
                  </button>
                </div>

                <div className={`${isExpanded ? 'block' : 'hidden'} p-3 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-2 duration-300`}>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_LABELS.map(l => <span key={l} className="text-[11px] font-black text-slate-700 text-center">{l}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((cell, idx) => {
                      if (!cell) return <div key={`empty-vice-${idx}`} className="aspect-square" />;
                      
                      const count = incidentLog[cell.iso] || 0;
                      const isPast = cell.iso < todayStr;
                      const isToday = cell.iso === todayStr;
                      const isAfterStart = cell.iso >= startDate;

                      return (
                        <div 
                          key={cell.iso}
                          className={`aspect-square border flex flex-col items-center justify-center relative transition-all rounded-[1px]
                            ${count > 0 ? 'bg-rose-600 border-rose-400 shadow-[0_0_8px_rgba(225,29,72,0.3)]' : 
                              (isPast && isAfterStart) ? 'bg-emerald-600/40 border-emerald-500/30' : 
                              'bg-[#020617] border-slate-900'} 
                            ${isToday ? 'ring-1 ring-rose-500 z-10' : ''}`}
                        >
                            <span className={`absolute top-0.5 left-1 text-[7px] font-black uppercase tracking-tighter ${count > 0 || (isPast && isAfterStart) ? 'text-white/40' : 'text-slate-800'}`}>
                              {cell.day}
                            </span>

                            <div className="relative z-10">
                              {count > 0 ? (
                                  <span className="text-[12px] font-black text-white italic tabular-nums">{count}</span>
                              ) : (isPast && isAfterStart) ? (
                                  <CheckCircle2 size={12} className="text-emerald-400/60" />
                              ) : null}
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* ... restante do componente (modais) permanece idêntico ... */}
      {showModal && (
        <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#030712] border border-slate-800 rounded-sm overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                {showModal === 'HABITO' ? 'Nova Missão' : showModal === 'TAREFA' ? 'Nova Tarefa' : 'Protocolo de Contenção'}
              </h3>
              <button onClick={() => setShowModal(null)} className="text-slate-500 hover:text-white transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6 overflow-y-auto max-h-[80vh] no-scrollbar">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">IDENTIFICAÇÃO</label>
                <input required autoFocus placeholder={showModal === 'VICIO' ? "Ex: Consumo de Açúcar" : "Ex: Treino de Força"} value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} className={`w-full bg-slate-900/50 border border-${themeColor}-500/30 rounded-sm px-4 py-3 text-sm text-white outline-none focus:border-${themeColor}-500 transition-all placeholder:text-slate-800`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> INÍCIO</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
                </div>
                {showModal !== 'VICIO' && (
                  <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> LEMBRETE</label>
                  <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
                  </div>
                )}
              </div>

              {showModal !== 'VICIO' && (
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SIMBOLOGIA</label>
                    <div className="grid grid-cols-5 gap-2 bg-slate-950/50 p-3 border border-slate-900 rounded-sm">
                    {ICON_LIST.map(item => (
                        <button key={item.id} type="button" onClick={() => setSelectedIcon(item.id)} className={`aspect-square flex items-center justify-center border transition-all rounded-sm ${selectedIcon === item.id ? `bg-${themeColor}-600 border-${themeColor}-400 text-white shadow-[0_0_15px_${themeHex}66]` : 'bg-slate-900 border-slate-800 text-slate-700 hover:text-slate-400'}`}>{item.icon}</button>
                    ))}
                    </div>
                </div>
              )}

              {showModal !== 'VICIO' && (
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MEDIÇÃO</label>
                    <div className="flex flex-col gap-3 p-4 bg-slate-950/50 border border-slate-800 rounded-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Vezes por dia</span>
                        <div className="flex items-center gap-4 bg-slate-900 p-1 border border-slate-800 rounded-sm">
                            <button type="button" onClick={() => setTargetQuantity(Math.max(1, targetQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white"><Minus size={14} /></button>
                            <span className="text-sm font-black text-white w-8 text-center tabular-nums">{targetQuantity}</span>
                            <button type="button" onClick={() => setTargetQuantity(targetQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                </div>
              )}

              {showModal !== 'VICIO' && (
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> RECORRÊNCIA</label>
                    <div className="grid grid-cols-7 gap-1.5 p-3 bg-slate-950/50 border border-slate-800 rounded-sm">
                    {DAYS_LABELS.map((label, idx) => (
                        <button key={idx} type="button" onClick={() => setSelectedDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])} className={`h-10 rounded-sm text-[10px] font-black transition-all ${selectedDays.includes(idx) ? `bg-${themeColor}-600 text-white border border-${themeColor}-400` : 'bg-slate-900 border-slate-800 text-slate-600'}`}>{label}</button>
                    ))}
                    </div>
                </div>
              )}

              <button type="submit" className={`w-full py-4 bg-${themeColor}-600 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:opacity-80 transition-all shadow-lg active:scale-95`}>
                {showModal === 'VICIO' ? 'INSTALAR CONTENÇÃO' : 'ATIVAR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {itemToPrepareDelete && (
        <div className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-sm bg-[#030712] border ${itemToPrepareDelete.type === 'HABITO' ? 'border-purple-800/50' : itemToPrepareDelete.type === 'TAREFA' ? 'border-blue-800/50' : 'border-rose-800/50'} p-6 rounded-sm space-y-6 shadow-2xl`}>
            <div className="flex flex-col items-center text-center space-y-4">
               <div className={`w-16 h-16 ${itemToPrepareDelete.type === 'HABITO' ? 'bg-purple-900/10 border-purple-500/30' : itemToPrepareDelete.type === 'TAREFA' ? 'bg-blue-900/10 border-blue-500/30' : 'bg-rose-900/10 border-rose-500/30'} border flex items-center justify-center rounded-full`}>
                  <AlertTriangle className={itemToPrepareDelete.type === 'HABITO' ? 'text-purple-500' : itemToPrepareDelete.type === 'TAREFA' ? 'text-blue-500' : 'text-rose-500'} size={32} />
               </div>
               <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Aviso de Expurgo</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Deseja apagar <span className={itemToPrepareDelete.type === 'HABITO' ? 'text-purple-500' : itemToPrepareDelete.type === 'TAREFA' ? 'text-blue-500' : 'text-rose-500'}>"{itemToPrepareDelete.name}"</span>?</p>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setItemToPrepareDelete(null)} className="flex-1 py-3 bg-slate-900 text-[9px] font-black uppercase text-slate-500 hover:text-white border border-slate-800 transition-colors">CANCELAR</button>
               <button onClick={() => { setDeleteConfirmationActive(itemToPrepareDelete); setItemToPrepareDelete(null); }} className={`flex-1 py-3 ${itemToPrepareDelete.type === 'HABITO' ? 'bg-purple-600 hover:bg-purple-500' : itemToPrepareDelete.type === 'TAREFA' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-600 hover:bg-rose-500'} text-[9px] font-black uppercase text-white transition-all`}>PROSSEGUIR</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmationActive && (
        <div className="fixed inset-0 z-[6001] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#030712] border border-rose-900/50 p-6 rounded-sm space-y-6 shadow-[0_0_50px_rgba(225,29,72,0.2)] animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-16 h-16 bg-rose-900/20 border border-rose-500 flex items-center justify-center rounded-full"><ShieldAlert className="text-rose-500" size={32} /></div>
               <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Selo de Destruição</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Confirme o nome: <br/><span className="text-rose-500 italic mt-1 block">"{deleteConfirmationActive.name}"</span></p>
               </div>
            </div>
            <div className="space-y-4">
               <input autoFocus value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className="w-full bg-slate-900/50 border border-rose-500/30 rounded-sm px-4 py-3 text-center text-xs font-black text-white outline-none focus:border-rose-500 transition-all placeholder:text-slate-800" placeholder="Nome do registro..." />
               <div className="flex gap-2">
                 <button onClick={() => { setDeleteConfirmationActive(null); setDeleteInput(''); }} className="flex-1 py-3 bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Cancelar</button>
                 <button disabled={deleteInput !== deleteConfirmationActive.name} onClick={confirmDeleteFinal} className="flex-1 py-3 bg-rose-600 disabled:bg-slate-900 disabled:text-slate-700 disabled:opacity-50 text-[9px] font-black uppercase tracking-widest text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20">Apagar</button>
               </div>
            </div>
          </div>
        </div>
      )}
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
