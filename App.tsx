
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
import AdminSettings from './components/AdminSettings';
import NotificationSystem, { Notification, NotificationType } from './components/NotificationSystem';
import { ViewType, PlayerStatus, ItemRank } from './types';

// Fórmulas da "Espinha Dorsal"
const getXPNeeded = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));
const getMaxDungeonHP = (lvl: number) => 100 + (lvl * 15);
const getRankByLevel = (lvl: number): ItemRank => {
  if (lvl <= 100) return 'E';
  if (lvl <= 250) return 'D';
  if (lvl <= 450) return 'C';
  if (lvl <= 650) return 'B';
  if (lvl <= 850) return 'A';
  return 'S';
};
const getMaxGlobalHPByRank = (rank: ItemRank) => {
  const map = { 'E': 100, 'D': 200, 'C': 300, 'B': 400, 'A': 500, 'S': 600 };
  return map[rank] || 100;
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('SISTEMA');
  const [selectedRank, setSelectedRank] = useState<ItemRank | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus | null>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [history, setHistory] = useState<Notification[]>([]);

  // Inicialização Calibrada
  useEffect(() => {
    if (!selectedRank) return;
    const rankKey = `rank_${selectedRank}_status`;
    const saved = localStorage.getItem(rankKey);
    
    if (saved) {
      setPlayerStatus(JSON.parse(saved));
    } else {
      const initialLvl = 1;
      const initialRank = getRankByLevel(initialLvl);
      const maxGlobal = getMaxGlobalHPByRank(initialRank);
      const maxDungeon = getMaxDungeonHP(initialLvl);
      
      setPlayerStatus({
        level: initialLvl, xp: 0, maxXp: getXPNeeded(initialLvl),
        rank: initialRank, job: 'Iniciante', title: 'LEVELING...',
        hp: maxGlobal, maxHp: maxGlobal, 
        dungeon_hp: maxDungeon, max_dungeon_hp: maxDungeon,
        mp: 50, maxMp: 50, gold: 0, statPoints: 0,
        stats: { strength: 10, agility: 10, intelligence: 10, perception: 10, vitality: 10 },
        equipment: {}, inventory: [], milestones: [],
        completedTrials: [], isPunished: false, criticalFailureCount: 0
      });
    }
  }, [selectedRank]);

  // Motor de Progressão e Sobrevivência
  const handleUpdatePlayer = (updates: Partial<PlayerStatus>) => {
    setPlayerStatus(prev => {
      if (!prev) return null;
      let next = { ...prev, ...updates };

      // Lógica de Dano Percentual Global
      if (updates.hp !== undefined && next.hp <= 0 && !next.isPunished) {
        next.hp = 0;
        next.isPunished = true;
        addNotification("SISTEMA: VITALIDADE ZERADA. PUNIÇÃO IMINENTE.", "error");
      }

      // Lógica de XP e Level Up Automática
      if (updates.xp !== undefined && next.xp >= next.maxXp) {
        while (next.xp >= next.maxXp) {
          next.xp -= next.maxXp;
          next.level += 1;
          next.maxXp = getXPNeeded(next.level);
          next.statPoints += 5;
          next.max_dungeon_hp = getMaxDungeonHP(next.level);
          next.dungeon_hp = next.max_dungeon_hp; // Cura combate no level up

          // Mudança de Rank Automática
          const newRank = getRankByLevel(next.level);
          if (newRank !== next.rank) {
            const oldRank = next.rank;
            next.rank = newRank;
            next.maxHp = getMaxGlobalHPByRank(newRank);
            next.hp = next.maxHp; // Cura global no rank up
            setEvolutionData({ type: 'RANK', oldValue: oldRank, newValue: newRank, rewards: [`MAX HP GLOBAL: ${next.maxHp}`, "Desbloqueio de Novas Áreas"] });
          } else {
            setEvolutionData({ type: 'LEVEL', oldValue: next.level - 1, newValue: next.level, rewards: ["+5 Atributos", `+15 HP Dungeon`] });
          }
        }
      }

      localStorage.setItem(`rank_${next.rank}_status`, JSON.stringify(next));
      return next;
    });
  };

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setHistory(prev => [...prev, { id, message, type }]);
  }, []);

  if (!selectedRank) return <RankSelector currentLevel={1} onSelectRank={setSelectedRank} />;
  
  return (
    <div className="flex h-screen w-full bg-[#010307] text-slate-200 font-sans overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isCollapsed={true} 
        onToggleCollapse={() => {}} 
        isMobileOpen={false} 
        onMobileClose={() => {}} 
        onExitRank={() => setSelectedRank(null)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#010307] relative h-full overflow-hidden">
        <Header />
        
        <div className="flex-1 w-full overflow-hidden relative">
          {playerStatus?.isPunished ? (
            <PunishmentZone 
              status={playerStatus} 
              onComplete={() => {
                handleUpdatePlayer({ isPunished: false, hp: Math.floor(playerStatus.maxHp * 0.1) });
                addNotification("ACESSO RESTABELECIDO.", "success");
              }}
            />
          ) : (
            <>
              {activeView === 'SISTEMA' && playerStatus && (
                <PlayerStatusWindow 
                  status={playerStatus} 
                  onUpdateStat={(s) => playerStatus.statPoints > 0 && handleUpdatePlayer({ statPoints: playerStatus.statPoints - 1, stats: {...playerStatus.stats, [s]: playerStatus.stats[s] + 1}})} 
                  onEquipItem={(item) => handleUpdatePlayer({ equipment: { ...playerStatus.equipment, [item.slot.toLowerCase()]: item } })} 
                  onUnequipItem={(slot) => handleUpdatePlayer({ equipment: { ...playerStatus.equipment, [slot]: null } })} 
                  onStartTrial={() => setActiveView('DUNGEON')} 
                  habits={[]} tasks={[]} vices={[]} 
                />
              )}
              {activeView === 'TAREFAS' && playerStatus && <TasksView playerStatus={playerStatus} onUpdatePlayer={handleUpdatePlayer} addNotification={addNotification} />}
              {activeView === 'DUNGEON' && playerStatus && <DungeonView playerStatus={playerStatus} setPlayerStatus={setPlayerStatus as any} addNotification={addNotification} />}
              {activeView === 'TIMELINE' && playerStatus && <TimelineView milestones={playerStatus.milestones} currentRank={playerStatus.rank} />}
            </>
          )}
        </div>
        
        {evolutionData && <EvolutionModal type={evolutionData.type} oldValue={evolutionData.oldValue} newValue={evolutionData.newValue} rewards={evolutionData.rewards} onClose={() => setEvolutionData(null)} />}
        {isAdminOpen && <AdminSettings onClose={() => setIsAdminOpen(false)} />}
      </main>
      <NotificationSystem notifications={history} removeNotification={(id) => setHistory(prev => prev.filter(n => n.id !== id))} />
    </div>
  );
};

export default App;
