
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PlayerStatusWindow from './components/PlayerStatusWindow';
import { DungeonView } from './components/DungeonView';
import TimelineView from './components/TimelineView';
import TasksView from './components/TasksView';
import PunishmentZone from './components/PunishmentZone';
import EvolutionModal from './components/EvolutionModal';
import RankSelector from './components/RankSelector';
import NotificationSystem, { Notification, NotificationType } from './components/NotificationSystem';
import { ViewType, PlayerStatus, Habit, Task, Vice, ItemRank } from './types';

const getXPNeeded = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));

const getRankByLevel = (lvl: number): ItemRank => {
  if (lvl <= 100) return 'E';
  if (lvl <= 250) return 'D';
  if (lvl <= 450) return 'C';
  if (lvl <= 650) return 'B';
  if (lvl <= 850) return 'A';
  return 'S';
};

const getMaxHPByRank = (rank: ItemRank) => {
  const map = { 'E': 100, 'D': 200, 'C': 300, 'B': 400, 'A': 500, 'S': 600 };
  return map[rank] || 100;
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('SISTEMA');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [activeTrialWeapon, setActiveTrialWeapon] = useState<any | null>(null);
  const [selectedRank, setSelectedRank] = useState<ItemRank | null>(null);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vices, setVices] = useState<Vice[]>([]);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus | null>(null);

  // Inicialização com as novas regras matemáticas
  useEffect(() => {
    if (!selectedRank) return;
    const rankKey = `rank_${selectedRank}_status`;
    const saved = localStorage.getItem(rankKey);
    
    if (saved) {
      setPlayerStatus(JSON.parse(saved));
    } else {
      const initialLvl = 1;
      const maxGlobal = getMaxHPByRank(selectedRank);
      setPlayerStatus({
        level: initialLvl, xp: 0, maxXp: getXPNeeded(initialLvl),
        rank: selectedRank, job: 'Iniciante', title: 'Leveling...',
        hp: maxGlobal, maxHp: maxGlobal, 
        dungeon_hp: 100 + (initialLvl * 15), max_dungeon_hp: 100 + (initialLvl * 15),
        mp: 50, maxMp: 50, gold: 0, statPoints: 0,
        stats: { strength: 10, agility: 10, intelligence: 10, perception: 10, vitality: 10 },
        equipment: {}, inventory: [], milestones: [],
        completedTrials: [], isPunished: false, criticalFailureCount: 0
      });
    }
  }, [selectedRank]);

  // Função handleUpdatePlayer simulando a RPC do Supabase
  const handleUpdatePlayer = (updates: Partial<PlayerStatus>) => {
    setPlayerStatus(prev => {
      if (!prev) return null;
      let next = { ...prev, ...updates };

      // Se houver ganho de XP, verificar Level Up
      if (updates.xp !== undefined && next.xp >= next.maxXp) {
        while (next.xp >= next.maxXp) {
          next.xp -= next.maxXp;
          next.level += 1;
          next.maxXp = getXPNeeded(next.level);
          next.statPoints += 5;
          // Dungeon HP sobe +15 por nível
          next.max_dungeon_hp = 100 + (next.level * 15);
          next.dungeon_hp = next.max_dungeon_hp;
          
          // Verificar Mudança de Rank Automática
          const newRank = getRankByLevel(next.level);
          if (newRank !== next.rank) {
            const oldRank = next.rank;
            next.rank = newRank;
            next.maxHp = getMaxHPByRank(newRank);
            next.hp = next.maxHp; // Cura total ao subir de Rank
            setEvolutionData({ type: 'RANK', oldValue: oldRank, newValue: newRank, rewards: [`HP Global: ${next.maxHp}`, "Novas Dungeons Desbloqueadas"] });
          } else {
            setEvolutionData({ type: 'LEVEL', oldValue: next.level - 1, newValue: next.level, rewards: ["+5 Atributos", "+15 HP Dungeon"] });
          }
        }
      }

      // Verificação de Punição (HP Global <= 0)
      if (next.hp <= 0 && !next.isPunished) {
        next.hp = 0;
        next.isPunished = true;
        next.punishmentStartTime = new Date().toISOString();
        addNotification("SISTEMA: ENTRANDO NA ZONA DE PUNIÇÃO.", "error");
      }

      localStorage.setItem(`rank_${next.rank}_status`, JSON.stringify(next));
      return next;
    });
  };

  const [history, setHistory] = useState<Notification[]>([]);
  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setHistory(prev => [...prev, { id, message, type }]);
  }, []);

  if (!selectedRank) return <RankSelector currentLevel={1} onSelectRank={setSelectedRank} />;
  
  return (
    <div className="flex h-screen w-full bg-[#010307] text-slate-200 font-sans overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} onExitRank={() => setSelectedRank(null)} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#010307] relative h-full overflow-hidden">
        <Header title={`SISTEMA - RANK ${selectedRank}`} history={history} onClearHistory={() => setHistory([])} onRemoveHistoryItem={(id) => setHistory(prev => prev.filter(n => n.id !== id))} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        
        <div className="flex-1 w-full overflow-hidden relative">
          {playerStatus?.isPunished ? (
            <PunishmentZone status={playerStatus} onComplete={() => { handleUpdatePlayer({ isPunished: false, hp: Math.floor(playerStatus.maxHp * 0.1) }); addNotification("ACESSO RESTAURADO.", "success"); }} />
          ) : (
            <>
              {activeView === 'SISTEMA' && playerStatus && <PlayerStatusWindow status={playerStatus} onUpdateStat={(s) => playerStatus.statPoints > 0 && handleUpdatePlayer({ statPoints: playerStatus.statPoints - 1, stats: {...playerStatus.stats, [s]: playerStatus.stats[s] + 1}})} onEquipItem={(i) => handleUpdatePlayer({ equipment: {...playerStatus.equipment, [i.slot]: i} })} onUnequipItem={(s) => { const e = {...playerStatus.equipment}; delete e[s]; handleUpdatePlayer({ equipment: e }); }} onStartTrial={(w) => { setActiveTrialWeapon(w); setActiveView('DUNGEON'); }} habits={[]} tasks={[]} vices={[]} />}
              {activeView === 'TAREFAS' && playerStatus && <TasksView playerStatus={playerStatus} onUpdatePlayer={handleUpdatePlayer} addNotification={addNotification} habits={habits} setHabits={setHabits} tasks={tasks} setTasks={setTasks} vices={vices} setVices={setVices} />}
              {activeView === 'DUNGEON' && playerStatus && <DungeonView playerStatus={playerStatus} setPlayerStatus={setPlayerStatus as any} addNotification={addNotification} forcedTrialWeapon={activeTrialWeapon} onTrialEnd={() => setActiveTrialWeapon(null)} />}
              {activeView === 'TIMELINE' && playerStatus && <TimelineView milestones={playerStatus.milestones} currentRank={playerStatus.rank} />}
            </>
          )}
        </div>
        
        {evolutionData && <EvolutionModal type={evolutionData.type} oldValue={evolutionData.oldValue} newValue={evolutionData.newValue} rewards={evolutionData.rewards} onClose={() => setEvolutionData(null)} />}
      </main>
      <NotificationSystem notifications={history} removeNotification={(id) => setHistory(prev => prev.filter(n => n.id !== id))} />
    </div>
  );
};

export default App;
