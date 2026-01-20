
import React, { useState, useEffect } from 'react';
import { 
  User, Zap, Heart, Sparkles, TrendingUp, Shield, 
  Skull, Swords, Target, Flame, Trophy, MapPin,
  Activity, Crown, Loader2, Save, Settings2, Edit3
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import { getXPNeeded, getMaxGlobalHP } from '../App';

const TERRITORIOS_RANK: Record<string, string> = {
  'E': 'Posto Avançado Abandonado',
  'D': 'Minas de Cristal Baixo',
  'C': 'Pântano de Kasaka',
  'B': 'Trono do Cavaleiro',
  'A': 'Fortaleza de Baran',
  'S': 'Templo de Carthenon'
};

const RANK_COLORS: Record<string, string> = {
  'E': 'text-slate-500 border-slate-500/30 bg-slate-500/5',
  'D': 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5',
  'C': 'text-blue-500 border-blue-500/30 bg-blue-500/5',
  'B': 'text-purple-500 border-purple-500/30 bg-purple-500/5',
  'A': 'text-amber-500 border-amber-500/30 bg-amber-500/5',
  'S': 'text-rose-500 border-rose-500/40 bg-rose-500/10'
};

const PlayerNexus: React.FC = () => {
  const [player, setPlayer] = useState<any>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const fetchPlayerData = async () => {
    const client = getSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;

    const { data: playerData } = await client
      .from('player_survival')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const { data: configData } = await client
      .from('system_configs')
      .select('*');
    
    setPlayer(playerData);
    setConfigs(configData || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlayerData();
  }, []);

  const handleUpdateConfig = (id: string, newXp: number) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, xp_reward: newXp } : c));
  };

  const saveConfigs = async () => {
    setIsSavingConfig(true);
    const client = getSupabaseClient();
    for (const conf of configs) {
      await client.from('system_configs').update({ xp_reward: conf.xp_reward }).eq('id', conf.id);
    }
    setIsSavingConfig(false);
    alert("Protocolos de Sistema Recalibrados.");
  };

  const addXP = async (id: string) => {
    if (!player || isSyncing) return;
    const config = configs.find(c => c.id === id);
    if (!config) return;

    setIsSyncing(true);
    const amount = config.xp_reward;
    
    let newXP = player.current_xp + amount;
    let newLevel = player.level;
    let newRank = player.rank;

    // --- MOTOR DE PROGRESSÃO SINCRONIZADO ---
    while (newXP >= getXPNeeded(newLevel)) {
      newXP -= getXPNeeded(newLevel);
      newLevel++;
      
      // Evolução de Rank baseada nos limites do RankSelector.tsx
      if (newLevel >= 100 && newLevel < 200) newRank = 'D';
      else if (newLevel >= 200 && newLevel < 300) newRank = 'C';
      else if (newLevel >= 300 && newLevel < 400) newRank = 'B';
      else if (newLevel >= 400 && newLevel < 500) newRank = 'A';
      else if (newLevel >= 500) newRank = 'S';
    }

    const newMaxHP = getMaxGlobalHP(newLevel);
    const newMaxMP = 50 + (newLevel * 10);

    const client = getSupabaseClient();
    await client.from('player_survival').update({
      current_xp: newXP,
      level: newLevel,
      rank: newRank,
      max_global_hp: newMaxHP,
      max_dungeon_hp: 100 + (newLevel * 15),
      max_mp: newMaxMP,
      current_global_hp: newMaxHP, // Restaura vida ao upar (Dopamina Reward)
      current_mp: newMaxMP,
      last_sync: new Date().toISOString()
    }).eq('id', player.id);

    await fetchPlayerData();
    setIsSyncing(false);
  };

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full space-y-4 opacity-40">
       <Loader2 className="animate-spin text-blue-500" size={48} />
       <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando DNA...</p>
    </div>
  );

  if (!player) return (
    <div className="flex-1 flex items-center justify-center p-20">
       <div className="bg-rose-500/10 border border-rose-500/20 p-8 text-center rounded-sm">
          <Skull size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white uppercase italic">Protocolo não inicializado</h2>
       </div>
    </div>
  );

  const xpNext = getXPNeeded(player.level);
  const xpPercent = (player.current_xp / xpNext) * 100;
  const hpPercent = (player.current_global_hp / player.max_global_hp) * 100;
  const mpPercent = (player.current_mp / player.max_mp) * 100;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-40">
      {/* HEADER IDENTITY */}
      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity size={120} className="text-slate-800" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${RANK_COLORS[player.rank]} shadow-2xl transition-all duration-700`}>
            {player.rank === 'S' ? <Crown size={48} /> : <User size={48} />}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{player.username || 'CAÇADOR'}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className={`px-3 py-1 rounded-sm text-xs font-black uppercase tracking-widest border-2 ${RANK_COLORS[player.rank]}`}>RANK {player.rank}</span>
              <span className="text-sm font-bold text-slate-500 uppercase border-l border-slate-800 pl-4">NÍVEL {player.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 border border-slate-800 p-4 rounded-sm">
           <MapPin size={16} className="text-blue-500" />
           <div>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Território Atual</p>
              <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{TERRITORIOS_RANK[player.rank] || 'NEXUS CENTRAL'}</h3>
           </div>
        </div>
      </div>

      {/* VITAL BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusPanel label="VITALIDADE GLOBAL (HP)" value={player.current_global_hp} max={player.max_global_hp} percent={hpPercent} color="bg-emerald-600" glow="shadow-emerald-500/20" icon={<Heart size={14} className="text-emerald-500" />} />
        <StatusPanel label="ENERGIA DIMENSIONAL (MP)" value={player.current_mp} max={player.max_mp} percent={mpPercent} color="bg-blue-600" glow="shadow-blue-500/20" icon={<Sparkles size={14} className="text-blue-500" />} />
        <StatusPanel label={`XP PROGRESSÃO`} value={player.current_xp} max={xpNext} percent={xpPercent} color="bg-gradient-to-r from-amber-500 to-purple-600" glow="shadow-amber-500/20" icon={<TrendingUp size={14} className="text-amber-500" />} />
      </div>

      {/* REWARD CONFIG */}
      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
             <Settings2 size={14} className="text-blue-500" /> Protocolos de Recompensa (XP)
           </h3>
           <button onClick={saveConfigs} disabled={isSavingConfig} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-sm transition-all shadow-lg active:scale-95 disabled:opacity-50">
              {isSavingConfig ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Salvar Configurações
           </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {configs.map((conf) => (
             <div key={conf.id} className="bg-black/40 border border-slate-800 p-4 rounded-sm flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{conf.label}</span>
                   <Edit3 size={10} className="text-slate-700 group-hover:text-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                   <input 
                     type="number" 
                     value={conf.xp_reward} 
                     onChange={(e) => handleUpdateConfig(conf.id, parseInt(e.target.value) || 0)}
                     className="flex-1 bg-slate-950 border border-slate-800 p-3 text-xs font-black text-white italic outline-none focus:border-blue-500 transition-all tabular-nums"
                   />
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* ACTION INJECTION */}
      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
          <Zap size={14} className="text-blue-500" /> Injetar Atividade de Sistema
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {configs.map((conf) => {
             const icons: Record<string, any> = {
               'BLUE_DUNGEON': <Swords size={16}/>,
               'RED_DUNGEON': <Flame size={16}/>,
               'TRIAL': <Trophy size={16}/>,
               'HABIT': <Zap size={16}/>,
               'TASK': <Target size={16}/>,
               'VICE_VICTORY': <Shield size={16}/>
             };
             const colors: Record<string, string> = {
               'BLUE_DUNGEON': 'bg-blue-600',
               'RED_DUNGEON': 'bg-rose-600',
               'TRIAL': 'bg-amber-600',
               'HABIT': 'bg-purple-600',
               'TASK': 'bg-slate-700',
               'VICE_VICTORY': 'bg-emerald-600'
             };

             return (
               <ActionBtn 
                 key={conf.id}
                 label={conf.label} 
                 xp={conf.xp_reward} 
                 icon={icons[conf.id]} 
                 onClick={() => addXP(conf.id)} 
                 color={colors[conf.id]} 
               />
             );
           })}
        </div>
      </div>
    </div>
  );
};

const StatusPanel = ({ label, value, max, percent, color, icon, glow }: any) => (
  <div className="bg-black/40 border border-slate-800 p-6 rounded-sm space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">{icon}<span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span></div>
      <div className="flex items-baseline gap-1 text-white"><span className="text-xl font-black italic tabular-nums">{value}</span><span className="text-[9px] font-bold text-slate-600">/ {max}</span></div>
    </div>
    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
      <div className={`h-full rounded-full transition-all duration-1000 ${color} ${glow}`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const ActionBtn = ({ label, xp, icon, onClick, color }: any) => (
  <button onClick={onClick} className="group flex flex-col items-center justify-center p-4 bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all rounded-sm gap-2">
    <div className={`w-10 h-10 ${color} text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
    <div className="text-center">
      <p className="text-[8px] font-black text-white uppercase leading-tight">{label}</p>
      <p className="text-[7px] font-bold text-blue-500 uppercase mt-1">+{xp} XP</p>
    </div>
  </button>
);

export default PlayerNexus;
