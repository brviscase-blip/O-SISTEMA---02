
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
import AuthScreen from './components/AuthScreen';
import NotificationSystem, { Notification, NotificationType } from './components/NotificationSystem';
import { supabase } from './supabaseClient';
import { ViewType, PlayerStatus, ItemRank } from './types';
import { Loader2 } from 'lucide-react';

// Fórmulas da "Espinha Dorsal"
const getXPNeeded = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));
const getMaxDungeonHP = (lvl: number) => 100 + (lvl * 15);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeView, setActiveView] = useState<ViewType>('SISTEMA');
  const [selectedRank, setSelectedRank] = useState<ItemRank | null>(null);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus | null>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Gerenciamento de Sessão Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setPlayerStatus(null);
        setSelectedRank(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Carregar Perfil Global
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [session]);

  // 3. Sincronização de Instância de Rank
  const loadRankDimension = async (rank: ItemRank) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('rank_instances')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('rank_type', rank)
      .single();

    if (data) {
      setPlayerStatus({
        level: data.current_level_in_rank,
        xp: data.rank_xp,
        maxXp: getXPNeeded(data.current_level_in_rank),
        rank: rank,
        job: 'Caçador',
        title: 'DESPERTADO',
        hp: data.current_hp,
        maxHp: data.max_hp,
        dungeon_hp: data.current_hp, 
        max_dungeon_hp: getMaxDungeonHP(data.current_level_in_rank),
        mp: data.current_mp,
        maxMp: data.max_mp,
        gold: 0,
        statPoints: data.stat_points,
        stats: {
          strength: data.strength,
          agility: data.agility,
          intelligence: data.intelligence,
          vitality: data.vitality,
          perception: data.perception
        },
        equipment: {},
        inventory: [],
        milestones: [],
        completedTrials: [],
        isPunished: false,
        criticalFailureCount: 0
      });
      setSelectedRank(rank);
    } else {
      if (rank === 'E') {
        const initialStatus: PlayerStatus = {
          level: 1, xp: 0, maxXp: getXPNeeded(1), rank: 'E',
          job: 'Iniciante', title: 'LEVELING...',
          hp: 100, maxHp: 100, dungeon_hp: 115, max_dungeon_hp: 115,
          mp: 50, maxMp: 50, gold: 0, statPoints: 0,
          stats: { strength: 10, agility: 10, intelligence: 10, perception: 10, vitality: 10 },
          equipment: {}, inventory: [], milestones: [],
          completedTrials: [], isPunished: false, criticalFailureCount: 0
        };
        setPlayerStatus(initialStatus);
        setSelectedRank('E');
      }
    }
  };

  const handleUpdatePlayer = (updates: Partial<PlayerStatus>) => {
    setPlayerStatus(prev => prev ? { ...prev, ...updates } : null);
  };

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setHistory(prev => [...prev, { id, message, type }]);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addNotification("[SISTEMA: SINCRONIA ENCERRADA]", "info");
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#010307] flex items-center justify-center">
      <Loader2 size={40} className="text-blue-500 animate-spin" />
    </div>
  );

  if (!session) return <AuthScreen onAuthSuccess={setSession} />;

  if (!selectedRank) return (
    <RankSelector 
      currentLevel={profile?.total_level_combined || 1} 
      onSelectRank={loadRankDimension} 
    />
  );
  
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
                  profile={profile}
                  onUpdateProfile={setProfile}
                  onSignOut={handleLogout}
                  addNotification={addNotification}
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
