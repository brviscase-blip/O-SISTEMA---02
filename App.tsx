import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PlayerStatusWindow from './components/PlayerStatusWindow';
import { DungeonView } from './components/DungeonView';
import TimelineView from './components/TimelineView';
import TasksView from './components/TasksView';
import SystemEventModal from './components/SystemEventModal';
import EvolutionModal from './components/EvolutionModal';
import AdminSettings from './components/AdminSettings';
import RankSelector from './components/RankSelector';
import NotificationSystem, { Notification, NotificationType } from './components/NotificationSystem';
import { ViewType, PlayerStatus, Habit, Task, Vice, ItemRank, EquipmentItem, EquipmentSlot } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('SISTEMA');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  
  // LOGICA DE RANK SELECTION
  const [selectedRank, setSelectedRank] = useState<ItemRank | null>(null);

  // ESTADO GLOBAL DE NIVEL (Este é o único dado que compartilha a trava de desbloqueio)
  const [globalLevel, setGlobalLevel] = useState<number>(() => {
    const saved = localStorage.getItem('global_player_level');
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('global_player_level', globalLevel.toString());
  }, [globalLevel]);

  // ESTADOS ESPECÍFICOS POR RANK (LocalStorage dinâmico)
  const getRankKey = (key: string) => `rank_${selectedRank || 'E'}_${key}`;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vices, setVices] = useState<Vice[]>([]);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus | null>(null);

  // Carregar dados quando o Rank mudar
  useEffect(() => {
    if (!selectedRank) return;

    const savedHabits = localStorage.getItem(getRankKey('habits'));
    setHabits(savedHabits ? JSON.parse(savedHabits) : []);

    const savedTasks = localStorage.getItem(getRankKey('tasks'));
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);

    const savedVices = localStorage.getItem(getRankKey('vices'));
    setVices(savedVices ? JSON.parse(savedVices) : []);

    const savedStatus = localStorage.getItem(getRankKey('status'));
    const defaultStatus: PlayerStatus = {
      level: globalLevel, xp: 0, maxXp: 1000, rank: selectedRank, job: 'HUMANO DESPERTO', title: 'O INICIANTE',
      hp: 100, maxHp: 100, mp: 20, maxMp: 20, gold: 0, statPoints: 0,
      stats: { strength: 10, agility: 10, intelligence: 10, perception: 10, vitality: 10 },
      equipment: {}, inventory: [], selectedCards: [], milestones: []
    };
    
    if (savedStatus) {
      const parsed = JSON.parse(savedStatus);
      // Garantir que o nível e rank condizem com a seleção global
      parsed.level = globalLevel;
      parsed.rank = selectedRank;
      setPlayerStatus(parsed);
    } else {
      setPlayerStatus(defaultStatus);
    }
  }, [selectedRank]);

  // Salvar dados quando houver mudanças
  useEffect(() => {
    if (!selectedRank) return;
    localStorage.setItem(getRankKey('habits'), JSON.stringify(habits));
  }, [habits, selectedRank]);

  useEffect(() => {
    if (!selectedRank) return;
    localStorage.setItem(getRankKey('tasks'), JSON.stringify(tasks));
  }, [tasks, selectedRank]);

  useEffect(() => {
    if (!selectedRank) return;
    localStorage.setItem(getRankKey('vices'), JSON.stringify(vices));
  }, [vices, selectedRank]);

  useEffect(() => {
    if (!selectedRank || !playerStatus) return;
    localStorage.setItem(getRankKey('status'), JSON.stringify(playerStatus));
    // Sincronizar nível global se o interno mudar
    if (playerStatus.level !== globalLevel) {
      setGlobalLevel(playerStatus.level);
    }
  }, [playerStatus, selectedRank]);

  // LOGICA DE EVOLUÇÃO
  useEffect(() => {
    if (!playerStatus) return;

    if (playerStatus.xp >= playerStatus.maxXp) {
      const excessXp = playerStatus.xp - playerStatus.maxXp;
      const oldLevel = playerStatus.level;
      const newLevel = oldLevel + 1;
      const oldRank = playerStatus.rank;
      
      const rankOrder: ItemRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
      let newRank = oldRank;
      
      // Lógica de Rank Up automática por nível (opcional, já que temos a segregação)
      if (newLevel % 100 === 0 && rankOrder.indexOf(oldRank) < rankOrder.length - 1) {
        newRank = rankOrder[rankOrder.indexOf(oldRank) + 1];
      }

      const isRankUp = newRank !== oldRank;
      const newMaxXp = Math.floor(playerStatus.maxXp * 1.2);
      
      setEvolutionData({
        type: isRankUp ? 'RANK' : 'LEVEL',
        oldValue: isRankUp ? oldRank : oldLevel,
        newValue: isRankUp ? newRank : newLevel,
        rewards: isRankUp 
          ? [`PROMOÇÃO PARA RANK ${newRank}`, "+10 Pontos de Status", "Restauração Completa"]
          : ["+5 Pontos de Status", "HP/MP Restaurados"]
      });

      setPlayerStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          level: newLevel,
          rank: newRank,
          xp: excessXp,
          maxXp: newMaxXp,
          statPoints: prev.statPoints + (isRankUp ? 10 : 5),
          hp: prev.maxHp,
          mp: prev.maxMp,
          milestones: [
            ...prev.milestones,
            {
              id: `EVO-${Date.now()}`,
              title: isRankUp ? `Ascensão de Rank: ${newRank}` : `Evolução de Nível: ${newLevel}`,
              description: isRankUp 
                ? `O Monarca atingiu a autoridade de Rank ${newRank}.` 
                : `O nível ${newLevel} foi alcançado.`,
              date: new Date().toISOString(),
              rank: newRank,
              level: newLevel
            }
          ]
        };
      });
    }
  }, [playerStatus?.xp, playerStatus?.maxXp]);

  const [history, setHistory] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif = { id, message, type };
    setHistory(prev => [...prev, newNotif]);
  }, []);

  const handleUpdatePlayer = (updates: Partial<PlayerStatus>) => {
    if (!playerStatus) return;
    setPlayerStatus(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  const handleEquipItem = (item: EquipmentItem) => {
    if (!playerStatus) return;
    setPlayerStatus(prev => {
      if (!prev) return null;
      return {
        ...prev,
        equipment: {
          ...prev.equipment,
          [item.slot]: item
        }
      };
    });
    addNotification(`${item.name} Equipado`, 'success');
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    if (!playerStatus) return;
    setPlayerStatus(prev => {
      if (!prev) return null;
      const newEquip = { ...prev.equipment };
      const itemName = newEquip[slot]?.name;
      delete newEquip[slot];
      if (itemName) addNotification(`${itemName} Removido`, 'warning');
      return {
        ...prev,
        equipment: newEquip
      };
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const handleMissionAction = (type: 'HABITO' | 'TAREFA' | 'VICIO', id: string) => {
    if (!playerStatus) return;
    if (type === 'HABITO') {
      const h = habits.find(x => x.id === id);
      if (!h || h.completedDays[today]) return;
      setHabits(prev => prev.map(x => x.id === id ? { ...x, completedDays: { ...x.completedDays, [today]: true }, streak: x.streak + 1 } : x));
      setPlayerStatus(prev => prev ? ({ ...prev, xp: prev.xp + h.xpReward, mp: Math.min(prev.maxMp, prev.mp + 5) }) : null);
      addNotification(`Hábito: +${h.xpReward} XP | +5 MP`, 'success');
    } else if (type === 'TAREFA') {
      const t = tasks.find(x => x.id === id);
      if (!t) return;
      if (t.isRecurring) {
        setTasks(prev => prev.map(x => x.id === id ? { ...x, lastCompleted: today } : x));
      } else {
        setTasks(prev => prev.map(x => x.id === id ? { ...x, completed: true } : x));
      }
      setPlayerStatus(prev => prev ? ({ ...prev, xp: prev.xp + t.xpReward }) : null);
      addNotification(`Tarefa: +${t.xpReward} XP`, 'success');
    }
  };

  // TELA DE SELEÇÃO INICIAL
  if (!selectedRank) {
    return <RankSelector currentLevel={globalLevel} onSelectRank={setSelectedRank} />;
  }

  // TELA DO SISTEMA PRINCIPAL (RANK ATIVO)
  return (
    <div className="flex min-h-screen w-full bg-[#010307] text-slate-200 font-sans">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
        onOpenAdmin={() => setIsAdminOpen(true)}
        onExitRank={() => setSelectedRank(null)} // Botão para voltar ao seletor
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#010307] relative min-h-screen">
        <Header 
          onSearchChange={() => {}} 
          title={selectedRank ? `PLANO DIMENSIONAL - RANK ${selectedRank}` : 'O SISTEMA'} 
          history={history} 
          onClearHistory={() => setHistory([])} 
          onRemoveHistoryItem={(id) => setHistory(prev => prev.filter(n => n.id !== id))} 
          onMenuClick={() => setIsMobileSidebarOpen(true)} 
        />
        
        <div className="flex-1 flex flex-col w-full overflow-y-auto overflow-x-hidden md:overflow-hidden no-scrollbar">
          {activeView === 'SISTEMA' && playerStatus && (
            <PlayerStatusWindow 
              status={playerStatus} 
              habits={habits}
              tasks={tasks}
              vices={vices}
              onUpdateStat={(stat) => {
                if (playerStatus.statPoints <= 0) return;
                setPlayerStatus(prev => prev ? ({...prev, statPoints: prev.statPoints - 1, stats: {...prev.stats, [stat]: prev.stats[stat] + 1}}) : null);
              }}
              onUpdatePlayer={handleUpdatePlayer}
              onEquipItem={handleEquipItem}
              onUnequipItem={handleUnequipItem}
            />
          )}
          {activeView === 'TAREFAS' && playerStatus && (
            <div className="pt-4 md:pt-0 h-full flex flex-col">
              <TasksView 
                playerStatus={playerStatus} 
                onUpdatePlayer={handleUpdatePlayer} 
                addNotification={addNotification}
                habits={habits}
                setHabits={setHabits}
                tasks={tasks}
                setTasks={setTasks}
                vices={vices}
                setVices={setVices}
              />
            </div>
          )}
          {activeView === 'DUNGEON' && playerStatus && (
            <DungeonView playerStatus={playerStatus} setPlayerStatus={setPlayerStatus as any} addNotification={addNotification} />
          )}
          {activeView === 'TIMELINE' && playerStatus && (
            <TimelineView milestones={playerStatus.milestones} currentRank={playerStatus.rank} />
          )}
        </div>
        
        {isAdminOpen && <AdminSettings onClose={() => setIsAdminOpen(false)} />}
        
        {activeEvent && (
          <SystemEventModal event={activeEvent} onComplete={() => setActiveEvent(null)} onFail={() => setActiveEvent(null)} />
        )}

        {evolutionData && (
          <EvolutionModal 
            type={evolutionData.type}
            oldValue={evolutionData.oldValue}
            newValue={evolutionData.newValue}
            rewards={evolutionData.rewards}
            onClose={() => setEvolutionData(null)}
          />
        )}
      </main>
      
      <NotificationSystem notifications={[]} removeNotification={() => {}} />
    </div>
  );
};

export default App;