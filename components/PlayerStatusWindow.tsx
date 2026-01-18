
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Heart, Zap, Plus, Coins, Swords, Ghost, Lock,
  Sword, Shield, X, Target, Users,
  Droplets, Gavel,
  Flame, Skull, Activity, Info, Layers,
  Settings2, Search, CheckCircle2, Crosshair, Sparkles,
  Backpack, ShieldPlus, FlaskConical, BarChart3, Loader2,
  LockKeyhole, Dumbbell, Brain, TrendingUp as AdvantageIcon,
  ShieldAlert as DisadvantageIcon, ArrowRight, Eye, ShieldQuestion,
  ScrollText, BookOpen, Fingerprint, Activity as Pulse,
  History, ShieldCheck, Swords as CombatIcon, ShieldAlert,
  Sword as SwordIcon, Trophy
} from 'lucide-react';
import { PlayerStatus, EquipmentItem, EquipmentSlot, PlayerStats, Habit, Task, Vice, ItemRank, Weapon } from '../types';
import { getSupabaseClient } from '../supabaseClient';

interface Props {
  status: PlayerStatus;
  habits: Habit[];
  tasks: Task[];
  vices: Vice[];
  onUpdateStat?: (stat: keyof PlayerStatus['stats']) => void;
  onEquipItem?: (item: EquipmentItem) => void;
  onUnequipItem?: (slot: EquipmentSlot) => void;
  onUpdatePlayer?: (updates: Partial<PlayerStatus>) => void;
  onStartTrial?: (weapon: any) => void;
}

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'E': return 'text-slate-500 border-slate-500/30 bg-slate-500/5';
    case 'D': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
    case 'C': return 'text-blue-500 border-blue-500/30 bg-blue-500/5';
    case 'B': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
    case 'A': return 'text-amber-500 border-amber-500/30 bg-amber-500/5';
    case 'S': return 'text-rose-500 border-rose-500/30 bg-rose-500/5';
    default: return 'text-slate-700 border-slate-800 bg-transparent';
  }
};

const getAttributeIcon = (attr: string, size = 12) => {
  const normalized = attr?.toUpperCase();
  switch (normalized) {
    case 'FORÇA': return <Dumbbell size={size} />;
    case 'AGILIDADE': return <Zap size={size} />;
    case 'INTELIGÊNCIA': return <Brain size={size} />;
    default: return <Target size={size} />;
  }
};

const rankWeights: Record<string, number> = {
  'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6
};

const PlayerStatusWindow: React.FC<Props> = ({ status, onUpdateStat, onUnequipItem, onUpdatePlayer, onEquipItem, onStartTrial }) => {
  const [isEquipManagerOpen, setIsEquipManagerOpen] = useState(false);
  const [isWeaponManagerOpen, setIsWeaponManagerOpen] = useState(false);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<any | null>(null);
  
  const [weaponSearch, setWeaponSearch] = useState('');
  const [supabaseWeapons, setSupabaseWeapons] = useState<any[]>([]);
  const [affinities, setAffinities] = useState<any[]>([]);
  const [isLoadingWeapons, setIsLoadingWeapons] = useState(false);

  const xpProgress = Math.min(100, (status.xp / status.maxXp) * 100);
  
  const INITIAL_EQUIPMENT: Record<string, EquipmentItem | null> = {
    head: null, chest: null, hands: null, legs: null, feet: null, ring: null
  };
  const currentEquipment = Object.keys(status.equipment).length === 0 ? INITIAL_EQUIPMENT : status.equipment;
  
  const [equippedWeapons, setEquippedWeapons] = useState<{ primary: any | null, secondary: any | null }>(() => {
    const saved = localStorage.getItem('equipped_arsenal');
    return saved ? JSON.parse(saved) : { primary: null, secondary: null };
  });

  useEffect(() => {
    localStorage.setItem('equipped_arsenal', JSON.stringify(equippedWeapons));
  }, [equippedWeapons]);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoadingWeapons(true);
    try {
      const { data: weaponData } = await client.from('armas').select('*');
      const { data: affinityData } = await client.from('armas_afinidades').select('*');
      
      if (weaponData) {
        const playerRankWeight = rankWeights[status.rank] || 0;
        const authorizedWeapons = weaponData.filter(w => (rankWeights[w.rank] || 0) <= playerRankWeight);
        setSupabaseWeapons(authorizedWeapons);
      }
      if (affinityData) setAffinities(affinityData);
    } catch (err) {
      console.error("Erro ao sincronizar Nexus:", err);
    } finally {
      setIsLoadingWeapons(false);
    }
  };

  useEffect(() => {
    if (isWeaponManagerOpen) fetchData();
  }, [isWeaponManagerOpen, status.rank]);

  const totalBonuses = useMemo(() => {
    return (Object.values(currentEquipment) as (EquipmentItem | null)[]).reduce((acc: PlayerStats, item: EquipmentItem | null) => {
      if (!item || !item.bonus) return acc;
      Object.entries(item.bonus).forEach(([stat, val]) => {
        const key = stat as keyof PlayerStats;
        if (key in acc) (acc as any)[key] += Number(val) || 0;
      });
      return acc;
    }, { strength: 0, agility: 0, intelligence: 0, perception: 0, vitality: 0, hp: 0, mp: 0 });
  }, [currentEquipment]);

  const effectiveMaxHp = status.maxHp + (totalBonuses.hp || 0);
  const effectiveMaxMp = status.maxMp + (totalBonuses.mp || 0);

  const filteredWeapons = useMemo(() => {
    return supabaseWeapons.filter(w => 
      w.nome.toLowerCase().includes(weaponSearch.toLowerCase())
    ).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
  }, [weaponSearch, supabaseWeapons]);

  const handleWeaponEquip = (weapon: any, slot: 'primary' | 'secondary') => {
    if (status.level < (weapon.nivel_desbloqueio || 1)) return;
    const needsTrial = Boolean(weapon.boss_id);
    if (needsTrial && !status.completedTrials.includes(weapon.id)) return;

    setEquippedWeapons(prev => {
        if (prev[slot]?.id === weapon.id) return { ...prev, [slot]: null };
        const otherSlot = slot === 'primary' ? 'secondary' : 'primary';
        if (prev[otherSlot]?.id === weapon.id) return { ...prev, [otherSlot]: null, [slot]: weapon };
        return { ...prev, [slot]: weapon };
    });
  };

  const weaponAffinityData = useMemo(() => {
    if (!selectedWeaponDetail || !affinities.length) return { strong: [], weak: [] };
    const attr = selectedWeaponDetail.atributo_principal;
    return {
      strong: affinities.filter(a => a.atacante === attr && a.vantagem === 'VANTAGEM'),
      weak: affinities.filter(a => a.atacante === attr && a.vantagem === 'DESVANTAGEM')
    };
  }, [selectedWeaponDetail, affinities]);

  return (
    <div className="h-full w-full flex flex-col gap-1.5 p-1.5 bg-[#010307] overflow-hidden select-none">
      {/* STATUS HEADER COMPACTO */}
      <div className="bg-[#030712] border border-slate-800 p-1.5 shadow-2xl flex-shrink-0 rounded-sm h-[70px] flex flex-col justify-center">
        <div className="flex flex-row items-center justify-between gap-4 px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">SUNG JIN-WOO</h1>
              <div className={`px-2 py-0.5 rounded-sm border text-[8px] font-black tracking-[0.1em] ${getRankColor(status.rank)}`}>RANK {status.rank}</div>
            </div>
            <span className="text-[9px] font-black text-purple-500 uppercase tracking-[0.15em] mt-0.5 italic opacity-80">{status.title}</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-500 uppercase mb-0.5">NÍVEL</span>
                <span className="text-lg font-black text-purple-400 italic tabular-nums leading-none">Lv.{status.level}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-500 uppercase mb-0.5">PONTOS</span>
                <span className={`text-lg font-black italic leading-none ${status.statPoints > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>{status.statPoints}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-500 uppercase mb-0.5">OURO</span>
                <div className="flex items-center gap-1.5">
                   <Coins size={10} className="text-amber-500" />
                   <span className="text-lg font-black text-white tabular-nums leading-none">{status.gold}</span>
                </div>
             </div>
          </div>
        </div>
        <div className="mt-2 px-2">
          <div className="relative h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50"><div className="h-full transition-all duration-1000 bg-gradient-to-r from-purple-600 to-white" style={{ width: `${xpProgress}%` }} /></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 grid-rows-10 gap-1.5 min-h-0 overflow-hidden">
        <div className="col-span-3 row-span-10 grid grid-rows-10 gap-1.5 min-h-0">
            {/* ATRIBUTOS REDIMENSIONADOS */}
            <div className="row-span-5 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center gap-2 flex-shrink-0">
                    <TrendingUp size={10} className="text-purple-400" />
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">ATRIBUTOS</h3>
                </div>
                <div className="p-1.5 flex-1 flex flex-col gap-1 min-h-0">
                    <div className="space-y-1 flex-shrink-0">
                        <VitalStat label="VIDA" current={status.hp} max={status.maxHp} bonus={totalBonuses.hp} icon={<Heart size={14} />} activeColor="text-rose-500" />
                        <VitalStat label="MANA" current={status.mp} max={status.maxMp} bonus={totalBonuses.mp} icon={<Zap size={14} />} activeColor="text-blue-400" />
                    </div>
                    <div className="border-t border-slate-800/50 pt-1 flex-1 flex flex-col justify-between">
                        <AttributeRow label="FORÇA" base={status.stats.strength} bonus={totalBonuses.strength} onUpgrade={() => onUpdateStat?.('strength')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="AGILIDADE" base={status.stats.agility} bonus={totalBonuses.agility} onUpgrade={() => onUpdateStat?.('agility')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="VITALIDADE" base={status.stats.vitality} bonus={totalBonuses.vitality} onUpgrade={() => onUpdateStat?.('vitality')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="INTELIGÊNCIA" base={status.stats.intelligence} bonus={totalBonuses.intelligence} onUpgrade={() => onUpdateStat?.('intelligence')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="PERCEPÇÃO" base={status.stats.perception} bonus={totalBonuses.perception} onUpgrade={() => onUpdateStat?.('perception')} canUpgrade={status.statPoints > 0} color="text-white" />
                    </div>
                </div>
            </div>
            {/* ARMADURAS COMPACTADAS */}
            <div className="row-span-3 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Backpack size={10} className="text-purple-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ARMADURAS</h3>
                    </div>
                    <button onClick={() => setIsEquipManagerOpen(true)} className="p-1 text-purple-400 hover:text-white transition-all"><Settings2 size={12} /></button>
                </div>
                <div className="p-1 grid grid-cols-3 grid-rows-2 gap-1 flex-1 min-h-0">
                    <EquipmentSlotBox slot="head" label="CABEÇA" item={(currentEquipment as any).head || null} />
                    <EquipmentSlotBox slot="chest" label="PEITORAL" item={(currentEquipment as any).chest || null} />
                    <EquipmentSlotBox slot="hands" label="MÃOS" item={(currentEquipment as any).hands || null} />
                    <EquipmentSlotBox slot="legs" label="PERNAS" item={(currentEquipment as any).legs || null} />
                    <EquipmentSlotBox slot="feet" label="PÉS" item={(currentEquipment as any).feet || null} />
                    <EquipmentSlotBox slot="ring" label="ANEL" item={(currentEquipment as any).ring || null} />
                </div>
            </div>
            {/* ARSENAL */}
            <div className="row-span-2 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Sword size={10} className="text-rose-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ARSENAL</h3>
                    </div>
                    <button onClick={() => setIsWeaponManagerOpen(true)} className="p-1 text-rose-500 hover:text-white transition-all"><Settings2 size={12} /></button>
                </div>
                <div className="p-1 grid grid-cols-2 gap-1 flex-1 min-h-0">
                    <WeaponSlot label="PRIMÁRIA" weapon={equippedWeapons.primary} icon={<Sword size={16} />} color="rose" />
                    <WeaponSlot label="SECUNDÁRIA" weapon={equippedWeapons.secondary} icon={<Gavel size={16} />} color="amber" />
                </div>
            </div>
        </div>

        <div className="col-span-9 row-span-10 grid grid-cols-9 grid-rows-10 gap-1.5 min-h-0">
            <div className="col-span-9 row-span-10 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl relative overflow-hidden group min-h-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={10} className="text-blue-400" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">STATUS DIMENSIONAL</h3>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-[#010307]/40 overflow-hidden">
                    <div className="w-16 h-16 bg-blue-900/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-3 relative">
                        <Lock size={24} className="text-blue-500/40 animate-pulse" /><div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" />
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Módulo Inativo</h4>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed italic">O SISTEMA DE CARTAS FOI DESCONTINUADO. AGUARDE A SINCRONIZAÇÃO DO PRÓXIMO PROTOCOLO DE PODER.</p>
                </div>
            </div>
        </div>
      </div>
      
      {isWeaponManagerOpen && (
        <FullscreenModal title="ARSENAL DE ATAQUE" icon={<Sword size={24}/>} color="rose" onClose={() => setIsWeaponManagerOpen(false)} onConfirm={() => setIsWeaponManagerOpen(false)}>
            <div className="w-80 border-r border-slate-800 p-6 flex flex-col gap-6">
                <SearchInput value={weaponSearch} onChange={setWeaponSearch} placeholder="Identificar arma no registro..." />
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
                   <div className="flex items-center gap-2 mb-2"><ShieldPlus size={12} className="text-blue-400" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Autoridade de Patente</span></div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-tight">Exibindo armamentos compatíveis com <span className={getRankColor(status.rank).split(' ')[0]}>{status.rank}</span> e seu nível global.</p>
                </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
                {isLoadingWeapons ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40"><Loader2 size={48} className="text-rose-500 animate-spin mb-4" /><p className="text-xs font-black uppercase tracking-[0.3em]">Sincronizando Arsenal...</p></div>
                ) : (
                  <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                    {filteredWeapons.length > 0 ? filteredWeapons.map(w => (
                        <WeaponCard 
                          key={w.id} 
                          weapon={w} 
                          playerLevel={status.level}
                          completedTrials={status.completedTrials}
                          affinities={affinities}
                          isPrimary={equippedWeapons.primary?.id === w.id} 
                          isSecondary={equippedWeapons.secondary?.id === w.id} 
                          onEquipPrimary={() => handleWeaponEquip(w, 'primary')} 
                          onEquipSecondary={() => handleWeaponEquip(w, 'secondary')} 
                          onShowDetail={() => setSelectedWeaponDetail(w)}
                          onStartTrial={() => { setIsWeaponManagerOpen(false); onStartTrial?.(w); }}
                        />
                    )) : <div className="w-full flex flex-col items-center justify-center opacity-30 py-20"><Lock size={48} className="text-slate-700 mb-4" /><p className="text-xs font-black uppercase tracking-widest">Nenhum artefato bélico autorizado</p></div>}
                  </div>
                )}
            </div>
        </FullscreenModal>
      )}

      {selectedWeaponDetail && (
        <div className="fixed inset-0 z-[7000] bg-[#010307]/95 flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden font-sans">
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-black to-slate-900/10" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-30 p-8 px-12 flex items-center justify-between border-b border-slate-800 bg-black/40 backdrop-blur-xl">
               <div className="flex items-center gap-10">
                  <div className={`px-5 py-1.5 border-2 text-[14px] font-black tracking-[0.4em] bg-black/80 rounded-sm ${getRankColor(selectedWeaponDetail.rank)}`}>
                    RANK {selectedWeaponDetail.rank}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {selectedWeaponDetail.nome}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                       <Fingerprint size={12} className="text-blue-500" /> Assinatura Biométrica Identificada <span className="text-slate-700">|</span> #{selectedWeaponDetail.id.substring(0,8)}
                    </div>
                  </div>
               </div>
               <button onClick={() => setSelectedWeaponDetail(null)} className="p-4 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-sm">
                 <X size={32} />
               </button>
            </div>
            
            <div className="relative z-20 flex-1 flex p-12 gap-12 overflow-hidden">
               <div className="w-[420px] flex flex-col gap-6 overflow-y-auto no-scrollbar">
                  <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-sm relative overflow-hidden flex flex-col group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                     <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Activity size={16} /> PERFORMANCE DE COMBATE
                     </h3>
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-black/40 p-4 border border-slate-800/50 rounded-sm">
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">DANO INICIAL</p>
                              <span className="text-2xl font-black text-slate-400 italic tabular-nums">{selectedWeaponDetail.dano_base} <small className="text-[10px] not-italic opacity-40">ATK</small></span>
                           </div>
                           <div className="bg-blue-600/5 p-4 border border-blue-500/20 rounded-sm">
                              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">DANO ATUAL</p>
                              <div className="flex items-center gap-2">
                                 <span className="text-3xl font-black text-white italic tabular-nums">{selectedWeaponDetail.dano_base} <small className="text-[10px] not-italic opacity-40">ATK</small></span>
                                 <TrendingUp size={14} className="text-emerald-500" />
                              </div>
                           </div>
                        </div>
                        <div className="bg-black/40 p-4 border border-slate-800/50 rounded-sm flex items-center justify-between group-hover:border-blue-500/30 transition-colors">
                           <div>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">ATRIBUTO BASE</p>
                              <span className="text-xl font-black text-white italic tracking-tighter uppercase">{selectedWeaponDetail.atributo_principal}</span>
                           </div>
                           <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-sm flex items-center justify-center text-blue-400">
                              {getAttributeIcon(selectedWeaponDetail.atributo_principal, 20)}
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <div className="space-y-2">
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <AdvantageIcon size={10}/> VANTAGEM
                              </span>
                              <div className="flex flex-col gap-1">
                                 {weaponAffinityData.strong.length > 0 ? weaponAffinityData.strong.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between bg-emerald-500/5 p-1.5 rounded-sm border border-emerald-500/10">
                                       <span className="text-[9px] font-bold text-white uppercase italic">{a.defensor}</span>
                                       <span className="text-[9px] font-black text-emerald-400 italic">x{a.multiplicador}</span>
                                    </div>
                                 )) : <span className="text-[8px] text-slate-700 uppercase italic">N/A</span>}
                              </div>
                           </div>
                           <div className="space-y-2">
                              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldAlert size={10}/> FRAQUEZA
                              </span>
                              <div className="flex flex-col gap-1">
                                 {weaponAffinityData.weak.length > 0 ? weaponAffinityData.weak.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between bg-rose-500/5 p-1.5 rounded-sm border border-rose-500/10">
                                       <span className="text-[9px] font-bold text-white uppercase italic">{a.defensor}</span>
                                       <span className="text-[9px] font-black text-rose-400 italic">x{a.multiplicador}</span>
                                    </div>
                                 )) : <span className="text-[8px] text-slate-700 uppercase italic">N/A</span>}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-sm relative overflow-hidden flex flex-col group flex-1">
                     <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Sparkles size={16} /> MATRIZ DE EFEITOS
                     </h3>
                     <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 p-4 bg-purple-900/10 border border-purple-500/20 rounded-sm overflow-y-auto no-scrollbar shadow-inner">
                           <span className="text-[11px] font-black text-white uppercase tracking-widest block mb-2">{selectedWeaponDetail.efeito_especial || 'NENHUM EFEITO DETECTADO'}</span>
                           <p className="text-[13px] text-slate-400 leading-relaxed italic">
                              {selectedWeaponDetail.desc_efeito || 'O Sistema não identificou modificadores anômalos para este artefato.'}
                           </p>
                        </div>
                        <div className="flex-1 pt-4 border-t border-slate-800/50 flex flex-col gap-3 justify-center">
                           <div className="flex items-center justify-between">
                              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">AUTENTICAÇÃO DE PATENTE</span>
                              <div className="flex items-center gap-1.5">
                                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[8px] font-black text-emerald-500/60 uppercase italic">SISTEMA VALIDADO</span>
                              </div>
                           </div>
                           <div className="flex flex-col items-center justify-center bg-[#010203] p-4 rounded-sm border border-slate-800/60 group-hover:border-blue-500/30 transition-all flex-1 relative overflow-hidden">
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                              <div className="relative z-10 flex flex-col items-center">
                                 <div className={`absolute w-32 h-32 rounded-full blur-[60px] opacity-10 ${getRankColor(selectedWeaponDetail.rank).replace('text', 'bg').split(' ')[0]}`} />
                                 <div className="flex flex-col items-center">
                                    <div className="flex items-baseline gap-4 mb-1">
                                       <span className="text-xl font-black text-white/10 uppercase italic tracking-tighter">RANK</span>
                                       <span className={`text-7xl font-black italic tracking-tighter leading-none ${getRankColor(selectedWeaponDetail.rank).split(' ')[0]} drop-shadow-[0_0_25px_currentColor]`}>
                                          {selectedWeaponDetail.rank}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex-1 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
                  {selectedWeaponDetail.img ? (
                    <img src={selectedWeaponDetail.img} className="max-w-[90%] max-h-[90%] object-contain z-10" alt="" />
                  ) : (
                    <Sword size={300} className="text-slate-900 opacity-20" />
                  )}
               </div>
            </div>
        </div>
      )}

      {isEquipManagerOpen && (
        <FullscreenModal title="SISTEMA DE MODULAÇÃO DE ARMADURA" icon={<Shield size={24}/>} color="blue" onClose={() => setIsEquipManagerOpen(false)} onConfirm={() => setIsEquipManagerOpen(false)}>
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(currentEquipment).map(([slot, item]) => (
                        <div key={slot} className="bg-[#030712] border border-slate-800 p-6 rounded-sm flex flex-col gap-4 relative">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{slot}</span>
                                {item && <button onClick={() => onUnequipItem?.(slot as any)} className="text-rose-500 hover:text-rose-400 transition-colors"><X size={16} /></button>}
                            </div>
                            {item ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex items-center justify-center">
                                        {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <Shield size={24} className="text-slate-700" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-black text-white uppercase italic">{item.nome}</h4>
                                        <span className={`text-[10px] font-black ${getRankColor(item.rank)}`}>RANK {item.rank}</span>
                                        <span className="text-[9px] font-bold text-emerald-500 mt-1">{item.bonus_status}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center border border-dashed border-slate-800 rounded-sm">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nenhum Registro</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </FullscreenModal>
      )}
    </div>
  );
};

const VitalStat = ({ label, current, max, bonus, icon, activeColor }: any) => {
  const finalMax = (Number(max) || 0) + (Number(bonus) || 0);
  const fillWidth = finalMax > 0 ? Math.min(100, (current / finalMax) * 100) : 0;
  
  return (
    <div className="flex items-center justify-between p-1.5 border border-slate-800 bg-black/40 rounded-sm relative overflow-hidden h-[48px]">
      <div className="flex items-center gap-2.5 z-10">
        <div className={`w-7 h-7 rounded-sm flex items-center justify-center border border-slate-800 bg-slate-950/50 ${activeColor}`}>{icon}</div>
        <div><p className="text-[9px] font-black text-white uppercase tracking-widest">{label}</p><p className="text-[6px] font-bold text-slate-600 uppercase italic">Integridade</p></div>
      </div>
      <div className="text-right z-10">
        <div className="flex items-center justify-end gap-1">
            <span className={`text-sm font-black tabular-nums ${activeColor}`}>{current}</span>
            <span className="text-[8px] text-slate-600 font-bold">/ {finalMax}</span>
            {Number(bonus) > 0 && <span className="text-[9px] font-black text-emerald-400">+{bonus}</span>}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-[1.5px] transition-all duration-1000 ${activeColor.replace('text', 'bg')}`} style={{ width: `${fillWidth}%` }} />
    </div>
  );
};

const AttributeRow = ({ label, base, bonus, onUpgrade, canUpgrade, color }: any) => (
  <div className="flex items-center justify-between py-1 border-b border-slate-800/20 px-2 group/row hover:bg-white/5 h-[42px] min-h-0">
    <div><span className="text-[9px] font-black text-slate-500 uppercase leading-none">{label}</span><span className="text-[6px] font-bold text-slate-700 uppercase block italic">Poder</span></div>
    <div className="flex items-center gap-2"><div className="flex flex-col items-end leading-none"><span className={`text-sm font-black tabular-nums ${color}`}>{Number(base) + (Number(bonus) || 0)}</span>{Number(bonus) > 0 && <span className="text-[8px] font-black text-emerald-500">+{bonus}</span>}</div>{canUpgrade && <button onClick={onUpgrade} className="w-5 h-5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center rounded-sm transition-all border border-emerald-500/20"><Plus size={10} /></button>}</div>
  </div>
);

const EquipmentSlotBox = ({ slot, label, item }: any) => {
  const isEquipped = !!item;
  const getIcon = (s: string) => {
      if (s === 'head') return <Shield size={18} />;
      if (s === 'chest') return <Shield size={18} />;
      if (s === 'ring') return <BarChart3 size={18} />;
      return <Layers size={18} />;
  };
  return (
    <div className={`flex flex-col p-1.5 rounded-sm border transition-all h-full ${isEquipped ? 'bg-purple-600/5 border-purple-500/60' : 'bg-slate-950 border-slate-800/40 opacity-40'}`}>
      <span className="text-[7px] font-black text-slate-500 uppercase">{label}</span>
      <div className="flex-1 flex flex-col items-center justify-center text-center py-0.5"><div className={`mb-0.5 ${isEquipped ? 'text-purple-400' : 'text-slate-800'}`}>{getIcon(slot)}</div><h4 className={`text-[9px] font-black uppercase leading-[1.1] line-clamp-1 ${isEquipped ? 'text-white' : 'text-slate-800'}`}>{item?.nome || 'Vazio'}</h4></div>
    </div>
  );
};

const WeaponSlot = ({ label, weapon, icon, color }: any) => {
    const hasWeapon = !!weapon;
    return (
        <div className={`flex flex-col rounded-sm border h-full transition-all relative overflow-hidden ${hasWeapon ? `border-${color}-500/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'bg-slate-950 border-slate-800/40 opacity-40'}`}>
            {hasWeapon && weapon.img && (
                <div className="absolute inset-0 z-0">
                    <img src={weapon.img} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
            )}
            
            <div className="relative z-10 p-1.5 h-full flex flex-col">
                <span className="text-[7px] font-black text-slate-500 uppercase">{label}</span>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {!hasWeapon ? (
                        <>
                            <div className="mb-0.5 text-slate-800">{icon}</div>
                            <h4 className="text-[9px] font-black uppercase leading-[1.1] text-slate-800 italic">Vazio</h4>
                        </>
                    ) : (
                        <>
                            <h4 className="text-[10px] font-black uppercase leading-[1] text-white mb-0.5 drop-shadow-md line-clamp-1">{weapon.nome}</h4>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/40 border border-white/10 rounded-sm">
                                <Zap size={6} className="text-emerald-400" />
                                <span className="text-[8px] font-black text-emerald-400 tabular-nums">{weapon.dano_base} ATK</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const FullscreenModal = ({ title, icon, color, children, onClose, onConfirm }: any) => (
    <div className="fixed inset-0 z-[6000] bg-[#010307] flex flex-col animate-in fade-in duration-300">
        <div className={`bg-[#030712] border-b border-slate-800 p-6 flex items-center justify-between`}>
            <div className="flex items-center gap-6"><div className={`w-12 h-12 bg-${color}-900/20 border border-${color}-500/50 rounded flex items-center justify-center`}>{icon}</div><div><h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h2><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">CONFIGURAÇÃO DE SISTEMA ATIVA</p></div></div>
            <button onClick={onConfirm} className={`bg-${color}-600 hover:bg-${color}-500 text-white px-10 py-4 rounded-sm text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg`}><CheckCircle2 size={18} /> CONFIRMAR</button>
        </div>
        <div className="flex-1 flex min-h-0">{children}</div>
    </div>
);

const SearchInput = ({ value, onChange, placeholder }: any) => (
    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} /><input className="w-full bg-slate-900 border border-slate-800 rounded-sm pl-10 pr-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-700" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /></div>
);

const WeaponCard = ({ weapon, playerLevel, completedTrials, affinities, isPrimary, isSecondary, onEquipPrimary, onEquipSecondary, onShowDetail, onStartTrial }: any) => {
    const isLevelLocked = playerLevel < (weapon.nivel_desbloqueio || 1);
    const isTrialCompleted = completedTrials.includes(weapon.id);
    const needsTrial = Boolean(weapon.boss_id);
    const canEquip = !isLevelLocked && (isTrialCompleted || !needsTrial);
    const canChallenge = !isLevelLocked && needsTrial && !isTrialCompleted;
    
    return (
        <div 
          style={{ width: '267px', height: '375px' }}
          className={`relative flex flex-col bg-[#030712] border-2 rounded-sm transition-all overflow-hidden flex-shrink-0 ${isLevelLocked ? 'grayscale opacity-50 cursor-not-allowed border-slate-900' : 'hover:scale-[1.02] group'} ${isTrialCompleted && (isPrimary || isSecondary) ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : isTrialCompleted ? 'border-emerald-500/40' : 'border-slate-800'}`}
        >
            {isLevelLocked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
                   <LockKeyhole size={24} className="text-rose-500 mb-2" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Acesso Negado</span>
                </div>
            )}
            {canChallenge && (
                 <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1.5px] p-6 text-center">
                    <ShieldAlert size={24} className="text-amber-500 animate-pulse mb-3" />
                    <button onClick={onStartTrial} className="w-full py-3 bg-amber-600 text-white text-[10px] font-black uppercase rounded-sm">DESAFIAR BOSS</button>
                 </div>
            )}
            <div className="relative w-full h-[250px] bg-slate-950 overflow-hidden">
                {weapon.img && <img src={weapon.img} className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 left-0 w-full p-4 z-20 flex flex-col items-center">
                    <h4 className="text-sm font-black text-white uppercase text-center line-clamp-1 w-full">{weapon.nome}</h4>
                    <span className="text-[14px] font-black text-emerald-400">{weapon.dano_base} ATK</span>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2">
                    <button disabled={!canEquip} onClick={onEquipPrimary} className={`py-3 text-[10px] font-black uppercase rounded-sm border transition-all ${isPrimary ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-500'} disabled:opacity-30`}>1</button>
                    <button disabled={!canEquip} onClick={onEquipSecondary} className={`py-3 text-[10px] font-black uppercase rounded-sm border transition-all ${isSecondary ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-500'} disabled:opacity-30`}>2</button>
                </div>
            </div>
        </div>
    );
};

export default PlayerStatusWindow;
