
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
  History, ShieldCheck, Swords as CombatIcon, ShieldAlert
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
  switch (attr) {
    case 'FORÇA': return <Dumbbell size={size} />;
    case 'AGILIDADE': return <Zap size={size} />;
    case 'INTELIGÊNCIA': return <Brain size={size} />;
    default: return <Target size={size} />;
  }
};

const rankWeights: Record<string, number> = {
  'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6
};

const PlayerStatusWindow: React.FC<Props> = ({ status, onUpdateStat, onUnequipItem, onUpdatePlayer, onEquipItem }) => {
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
      const { data: affinityData } = await client.from('afinidades').select('*');
      
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
      if (!item) return acc;
      Object.entries(item.bonus).forEach(([stat, val]) => {
        const key = stat as keyof PlayerStats;
        if (key in acc) acc[key] += (val as number) || 0;
      });
      return acc;
    }, { strength: 0, agility: 0, intelligence: 0, perception: 0, vitality: 0 });
  }, [currentEquipment]);

  const filteredWeapons = useMemo(() => {
    return supabaseWeapons.filter(w => 
      w.nome.toLowerCase().includes(weaponSearch.toLowerCase())
    ).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
  }, [weaponSearch, supabaseWeapons]);

  const handleWeaponEquip = (weapon: any, slot: 'primary' | 'secondary') => {
    if (status.level < (weapon.nivel_desbloqueio || 1)) return;
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
    <div className="h-[100vh] w-full flex flex-col gap-2 p-2 bg-[#010307] overflow-hidden select-none">
      {/* STATUS HEADER */}
      <div className="bg-[#030712] border border-slate-800 p-2 shadow-2xl flex-shrink-0 rounded-sm h-[85px] flex flex-col justify-center">
        <div className="flex flex-row items-center justify-between gap-4 px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">SUNG JIN-WOO</h1>
              <div className={`px-2.5 py-0.5 rounded-sm border text-[10px] font-black tracking-[0.1em] ${getRankColor(status.rank)}`}>RANK {status.rank}</div>
            </div>
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.15em] mt-1 italic opacity-80">{status.title}</span>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase mb-1.5">NÍVEL</span>
                <span className="text-xl font-black text-purple-400 italic tabular-nums">Lv.{status.level}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase mb-1.5">PONTOS</span>
                <span className={`text-xl font-black italic ${status.statPoints > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>{status.statPoints}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase mb-1.5">OURO</span>
                <div className="flex items-center gap-2">
                   <Coins size={12} className="text-amber-500" />
                   <span className="text-xl font-black text-white tabular-nums">{status.gold}</span>
                </div>
             </div>
          </div>
        </div>
        <div className="mt-2.5 px-2">
          <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50"><div className="h-full transition-all duration-1000 bg-gradient-to-r from-purple-600 to-white" style={{ width: `${xpProgress}%` }} /></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 grid-rows-10 gap-2 min-h-0">
        <div className="col-span-3 row-span-10 grid grid-rows-10 gap-2 min-h-0">
            <div className="row-span-4 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0">
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center gap-2">
                    <TrendingUp size={10} className="text-purple-400" />
                    <h3 className="text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-400">ATRIBUTOS</h3>
                </div>
                <div className="p-2 flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                    <div className="space-y-1">
                        <VitalStat label="PONTOS DE VIDA" current={status.hp} max={status.maxHp} icon={<Heart size={18} />} activeColor="text-rose-500" />
                        <VitalStat label="PONTOS DE MANA" current={status.mp} max={status.maxMp} icon={<Zap size={18} />} activeColor="text-blue-400" />
                    </div>
                    <div className="border-t border-slate-800/50 pt-1 flex flex-col">
                        <AttributeRow label="FORÇA" base={status.stats.strength} bonus={totalBonuses.strength} onUpgrade={() => onUpdateStat?.('strength')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="AGILIDADE" base={status.stats.agility} bonus={totalBonuses.agility} onUpgrade={() => onUpdateStat?.('agility')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="VITALIDADE" base={status.stats.vitality} bonus={totalBonuses.vitality} onUpgrade={() => onUpdateStat?.('vitality')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="INTELIGÊNCIA" base={status.stats.intelligence} bonus={totalBonuses.intelligence} onUpgrade={() => onUpdateStat?.('intelligence')} canUpgrade={status.statPoints > 0} color="text-white" />
                        <AttributeRow label="PERCEPÇÃO" base={status.stats.perception} bonus={totalBonuses.perception} onUpgrade={() => onUpdateStat?.('perception')} canUpgrade={status.statPoints > 0} color="text-white" />
                    </div>
                </div>
            </div>
            <div className="row-span-4 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0">
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[36.2px]">
                    <div className="flex items-center gap-2">
                        <Backpack size={11} className="text-purple-400" />
                        <h3 className="text-[11.5px] font-black uppercase tracking-[0.2em] text-slate-400">EQUIPAMENTO</h3>
                    </div>
                    <button onClick={() => setIsEquipManagerOpen(true)} className="px-3 py-1 bg-purple-600/10 border border-purple-500/40 text-purple-400 hover:bg-purple-600 hover:text-white transition-all text-[8.5px] font-black uppercase rounded-sm"><Settings2 size={11} /></button>
                </div>
                <div className="p-1.5 grid grid-cols-3 grid-rows-2 gap-1.5 flex-1 min-h-0">
                    <EquipmentSlotBox slot="head" label="CABEÇA" item={(currentEquipment as any).head || null} />
                    <EquipmentSlotBox slot="chest" label="PEITORAL" item={(currentEquipment as any).chest || null} />
                    <EquipmentSlotBox slot="hands" label="MÃOS" item={(currentEquipment as any).hands || null} />
                    <EquipmentSlotBox slot="legs" label="PERNAS" item={(currentEquipment as any).legs || null} />
                    <EquipmentSlotBox slot="feet" label="PÉS" item={(currentEquipment as any).feet || null} />
                    <EquipmentSlotBox slot="ring" label="ANEL" item={(currentEquipment as any).ring || null} />
                </div>
            </div>
            <div className="row-span-2 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0">
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[36.2px]">
                    <div className="flex items-center gap-2">
                        <Sword size={11} className="text-rose-500" />
                        <h3 className="text-[11.5px] font-black uppercase tracking-[0.2em] text-slate-400">ARSENAL BÉLICO</h3>
                    </div>
                    <button onClick={() => setIsWeaponManagerOpen(true)} className="px-3 py-1 bg-rose-600/10 border border-rose-500/40 text-rose-500 hover:bg-rose-600 hover:text-white transition-all text-[8.5px] font-black uppercase rounded-sm"><Settings2 size={11} /></button>
                </div>
                <div className="p-1.5 grid grid-cols-2 gap-1.5 flex-1 min-h-0">
                    <WeaponSlot label="PRIMÁRIA" weapon={equippedWeapons.primary} icon={<Sword size={21} />} color="rose" />
                    <WeaponSlot label="SECUNDÁRIA" weapon={equippedWeapons.secondary} icon={<Gavel size={21} />} color="amber" />
                </div>
            </div>
        </div>

        <div className="col-span-9 row-span-10 grid grid-cols-9 grid-rows-10 gap-2 min-h-0">
            <div className="col-span-9 row-span-10 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl relative overflow-hidden group min-h-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[36.2px]">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={11} className="text-blue-400" />
                        <h3 className="text-[11.5px] font-black uppercase tracking-[0.2em] text-slate-400">STATUS DIMENSIONAL</h3>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#010307]/40">
                    <div className="w-20 h-20 bg-blue-900/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-4 relative">
                        <Lock size={32} className="text-blue-500/40 animate-pulse" /><div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" />
                    </div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Módulo Inativo</h4>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest max-w-xs leading-relaxed italic">O SISTEMA DE CARTAS FOI DESCONTINUADO. AGUARDE A SINCRONIZAÇÃO DO PRÓXIMO PROTOCOLO DE PODER.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* MODAL DO ARSENAL */}
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
                          affinities={affinities}
                          isPrimary={equippedWeapons.primary?.id === w.id} 
                          isSecondary={equippedWeapons.secondary?.id === w.id} 
                          onEquipPrimary={() => handleWeaponEquip(w, 'primary')} 
                          onEquipSecondary={() => handleWeaponEquip(w, 'secondary')} 
                          onShowDetail={() => setSelectedWeaponDetail(w)}
                        />
                    )) : <div className="w-full flex flex-col items-center justify-center opacity-30 py-20"><Lock size={48} className="text-slate-700 mb-4" /><p className="text-xs font-black uppercase tracking-widest">Nenhum artefato bélico autorizado</p></div>}
                  </div>
                )}
            </div>
        </FullscreenModal>
      )}

      {/* FULL IMAGE VISUALIZER - UPDATED TO MATCH HIGH-FIDELITY MOCKUP */}
      {selectedWeaponDetail && (
        <div className="fixed inset-0 z-[7000] bg-[#010307] flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden font-sans">
            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-[#010307] to-rose-950/20" />
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-blue-600/5 blur-[180px] rounded-full animate-pulse" />
            </div>

            {/* TOP HUD */}
            <div className="relative z-30 p-6 px-12 flex items-center justify-between bg-black/60 border-b border-slate-800/80 backdrop-blur-2xl">
               <div className="flex items-center gap-12">
                  <div className="flex flex-col items-center">
                    <div className={`px-6 py-1.5 border-2 text-[14px] font-black tracking-[0.4em] bg-black/90 rounded-sm shadow-[0_0_25px_rgba(0,0,0,0.8)] ${getRankColor(selectedWeaponDetail.rank)}`}>
                      RANK {selectedWeaponDetail.rank}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      {selectedWeaponDetail.nome}
                    </h2>
                    <div className="flex items-center gap-6 mt-3">
                       <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                          <Fingerprint size={14} className="text-blue-500" /> Assinatura Biométrica Verificada
                       </span>
                       <div className="h-1 w-32 bg-slate-800/80 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-blue-500 w-[65%] animate-pulse" /></div>
                    </div>
                  </div>
               </div>
               <button onClick={() => setSelectedWeaponDetail(null)} className="p-4 bg-rose-600/5 border-2 border-rose-600/30 text-rose-500 hover:bg-rose-600 hover:text-white rounded-sm transition-all shadow-2xl group">
                 <X size={32} className="group-hover:rotate-90 transition-transform" />
               </button>
            </div>
            
            <div className="relative flex-1 z-20 flex min-h-0 overflow-hidden p-8 gap-8">
               {/* LADO ESQUERDO: DIAGNÓSTICO E ANÁLISE TÁTICA */}
               <div className="w-[480px] flex flex-col gap-8 overflow-y-auto no-scrollbar">
                  {/* DIAGNÓSTICO DE PODER */}
                  <div className="bg-slate-950/80 border-2 border-slate-800/60 backdrop-blur-3xl p-8 rounded-sm relative overflow-hidden flex flex-col group h-[280px]">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
                     <h3 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                        <Activity size={18} /> DIAGNÓSTICO DE PODER
                     </h3>
                     <div className="flex flex-col gap-10">
                        <div className="flex justify-between items-end border-b border-slate-800/50 pb-6">
                           <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Potência Destrutiva</span>
                           <span className="text-6xl font-black text-emerald-400 italic tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{selectedWeaponDetail.dano_base} <small className="text-[13px] uppercase font-bold not-italic text-slate-600 ml-1">ATK</small></span>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-6 border border-slate-800/60 rounded-sm">
                           <div>
                              <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Atributo Dominante</span>
                              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{selectedWeaponDetail.atributo_principal}</span>
                           </div>
                           <div className="w-16 h-16 bg-blue-600/10 border-2 border-blue-500/30 rounded-sm flex items-center justify-center text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]">
                              {getAttributeIcon(selectedWeaponDetail.atributo_principal, 32)}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* ANÁLISE TÁTICA */}
                  <div className="bg-slate-950/80 border-2 border-slate-800/60 backdrop-blur-3xl p-8 rounded-sm flex-1 flex flex-col group">
                     <h3 className="text-[12px] font-black text-purple-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                        <Sparkles size={18} /> ANÁLISE TÁTICA
                     </h3>
                     
                     <div className="flex-1 flex flex-col gap-8">
                        {/* FOCO INICIAL / EFEITO */}
                        <div className="p-8 bg-purple-900/5 border-2 border-purple-500/10 rounded-sm relative transition-all hover:bg-purple-900/10 hover:border-purple-500/20 shadow-inner">
                           <div className="flex items-center gap-3 mb-4">
                              <ShieldCheck size={18} className="text-purple-400" />
                              <span className="text-[13px] font-black text-white uppercase tracking-[0.2em]">{selectedWeaponDetail.efeito_especial || 'FOCO INICIAL'}</span>
                           </div>
                           <p className="text-[15px] text-slate-400 leading-relaxed font-medium italic opacity-90">
                              {selectedWeaponDetail.desc_efeito || 'Uma arma básica fornecida pelo Sistema aos recém-despertos.'}
                           </p>
                        </div>

                        {/* MATRIZ DE AFINIDADE - LAYOUT HORIZONTAL */}
                        <div className="flex flex-col gap-4">
                           <div className="bg-emerald-950/10 border-2 border-emerald-500/20 p-6 rounded-sm flex flex-col">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-4 flex items-center gap-3">
                                <AdvantageIcon size={14}/> VANTAGEM TÁTICA
                              </span>
                              <div className="space-y-3 flex-1">
                                 {weaponAffinityData.strong.length > 0 ? weaponAffinityData.strong.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between text-white font-black text-[12px] italic border-b border-emerald-500/10 pb-2 last:border-0">
                                       <span>{a.defensor}</span>
                                       <span className="text-emerald-400">x{a.multiplicador}</span>
                                    </div>
                                 )) : <span className="text-[10px] text-slate-700 uppercase font-black italic tracking-widest">SEM DADOS...</span>}
                              </div>
                           </div>
                           <div className="bg-rose-950/10 border-2 border-rose-500/20 p-6 rounded-sm flex flex-col">
                              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-4 flex items-center gap-3">
                                <ShieldAlert size={14}/> FRAQUEZA TÁTICA
                              </span>
                              <div className="space-y-3 flex-1">
                                 {weaponAffinityData.weak.length > 0 ? weaponAffinityData.weak.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between text-white font-black text-[12px] italic border-b border-rose-500/10 pb-2 last:border-0">
                                       <span>{a.defensor}</span>
                                       <span className="text-rose-400">x{a.multiplicador}</span>
                                    </div>
                                 )) : <span className="text-[10px] text-slate-700 uppercase font-black italic tracking-widest">SEM DADOS...</span>}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* CENTRO: ARTEFATO VISUAL */}
               <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_75%)]">
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  {selectedWeaponDetail.img ? (
                    <img 
                      src={selectedWeaponDetail.img} 
                      className="max-w-[85%] max-h-[85%] object-contain drop-shadow-[0_0_120px_rgba(0,0,0,1)] z-10 transition-all duration-1000 animate-in zoom-in-50" 
                      alt="" 
                    />
                  ) : (
                    <Sword size={450} className="text-slate-900 opacity-10" />
                  )}

                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30">
                     <div className="px-12 py-5 bg-black/90 backdrop-blur-3xl border-2 border-white/10 rounded-full flex items-center gap-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)]">
                        <div className="flex items-center gap-4">
                           <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
                           <span className="text-[14px] font-black text-white uppercase tracking-[0.4em]">SINCRONIA ESTÁVEL</span>
                        </div>
                        <div className="w-px h-10 bg-slate-800" />
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">AFINIDADE DE CAMPO</span>
                           <span className="text-[13px] font-black text-blue-400 uppercase italic leading-none">PROTOCÓLO ATIVO</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* LADO DIREITO: LORE E EVOLUÇÃO */}
               <div className="w-[520px] flex flex-col gap-8 overflow-y-auto no-scrollbar">
                  {/* ARQUIVOS DE LORE */}
                  <div className="bg-slate-950/80 border-2 border-slate-800/80 backdrop-blur-3xl p-8 rounded-sm flex-[1.6] flex flex-col group h-[450px]">
                     <h3 className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                        <BookOpen size={18} /> ARQUIVOS DE LORE (MEMÓRIA)
                     </h3>
                     <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/60 border-2 border-emerald-500/20 p-10 rounded-sm relative shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
                        <ScrollText className="absolute top-10 right-10 text-emerald-500/5 pointer-events-none" size={140} />
                        <p className="text-[16px] text-slate-100 leading-relaxed font-medium italic opacity-95">
                           {selectedWeaponDetail.historia || 'Artefato bélico forjado em fendas dimensionais não catalogadas. A disciplina contida na lâmina permite a transmutação de instintos brutos em perícia marcial absoluta.'}
                        </p>
                     </div>
                  </div>

                  {/* EVOLUÇÃO E REFINO */}
                  <div className="bg-slate-950/80 border-2 border-slate-800/80 backdrop-blur-3xl p-8 rounded-sm flex-1 flex flex-col group">
                     <h3 className="text-[12px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                        <Layers size={18} /> EVOLUÇÃO E REFINO
                     </h3>
                     <div className="flex-1 flex flex-col gap-8 justify-center">
                        <div className="flex items-center gap-8 bg-black/60 border-2 border-slate-800/60 p-8 rounded-sm transition-all hover:border-amber-500/40 hover:bg-black/80 shadow-lg">
                           <div className="w-20 h-20 bg-amber-500/10 rounded-sm flex items-center justify-center border-2 border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]">
                              <FlaskConical size={40} className="text-amber-500" />
                           </div>
                           <div className="flex flex-col">
                              <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">MATERIAL DE REFINO</p>
                              <p className="text-xl font-black text-white uppercase italic tracking-tight">{selectedWeaponDetail.material_upgrade || 'FRAGMENTO DE FERRO'}</p>
                           </div>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.4em]">
                              <span className="text-slate-600">POTENCIAL ATUAL</span>
                              <span className="text-blue-400 flex items-center gap-2">
                                LV.{selectedWeaponDetail.lvl_min || 1} <span className="text-slate-800">/</span> {selectedWeaponDetail.lvl_max || 100}
                              </span>
                           </div>
                           <div className="h-4 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-900 p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-400 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                                style={{ width: `${Math.max(5, (selectedWeaponDetail.lvl_min / selectedWeaponDetail.lvl_max) * 100)}%` }} 
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* FOOTER HUD */}
            <div className="relative z-30 p-6 px-12 flex items-center justify-between bg-black/80 border-t border-slate-800 backdrop-blur-3xl">
               <div className="flex gap-24">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">CÓDIGO DE REGISTRO</span>
                     <span className="text-[13px] font-bold text-slate-400 tabular-nums tracking-[0.1em] italic">#{selectedWeaponDetail.id.substring(0,12).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">ESTADO OPERACIONAL</span>
                     <div className="flex items-center gap-3">
                        <Pulse size={16} className="text-emerald-500 animate-pulse" />
                        <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.2em]">SISTEMA OTIMIZADO</span>
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">HISTÓRICO</span>
                     <div className="flex items-center gap-3">
                        <History size={16} className="text-blue-500" />
                        <span className="text-[12px] font-black text-white uppercase tracking-[0.2em]">SINCRONIZADO</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-12">
                  <div className="text-right">
                     <p className="text-[13px] font-black text-slate-500 uppercase tracking-0.4em italic leading-none">NEXUS ARTIFACTS LAB</p>
                     <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em] mt-3">PROTOCOLO DE SOBERANIA V.18.2</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-900/10 border-2 border-blue-500/20 rounded-sm flex items-center justify-center shadow-inner"><Shield size={28} className="text-blue-500/30" /></div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

const VitalStat = ({ label, current, max, icon, activeColor }: any) => (
  <div className="flex items-center justify-between p-2 border border-slate-800 bg-black/40 rounded-sm relative overflow-hidden h-[60px]">
    <div className="flex items-center gap-3 z-10">
      <div className={`w-9 h-9 rounded-sm flex items-center justify-center border border-slate-800 bg-slate-950/50 ${activeColor}`}>{icon}</div>
      <div><p className="text-[11px] font-black text-white uppercase tracking-widest">{label}</p><p className="text-[7px] font-bold text-slate-600 uppercase italic">Integridade</p></div>
    </div>
    <div className="text-right z-10"><span className={`text-[16px] font-black tabular-nums ${activeColor}`}>{current}</span><span className="text-[10px] text-slate-600 font-bold ml-1">/ {max}</span></div>
    <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ${activeColor.replace('text', 'bg')}`} style={{ width: `${(current/max)*100}%` }} />
  </div>
);

const AttributeRow = ({ label, base, bonus, onUpgrade, canUpgrade, color }: any) => (
  <div className="flex items-center justify-between py-1 border-b border-slate-800/20 px-2 group/row hover:bg-white/5 h-[60px]">
    <div><span className="text-[10px] font-black text-slate-500 uppercase leading-none">{label}</span><span className="text-[7px] font-bold text-slate-700 uppercase block italic">Nível de Poder</span></div>
    <div className="flex items-center gap-3"><div className="flex flex-col items-end leading-none"><span className={`text-[16px] font-black tabular-nums ${color}`}>{base + (bonus || 0)}</span>{bonus > 0 && <span className="text-[9px] font-black text-emerald-500">+{bonus}</span>}</div>{canUpgrade && <button onClick={onUpgrade} className="w-6 h-6 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center rounded-sm transition-all border border-emerald-500/20"><Plus size={12} /></button>}</div>
  </div>
);

const EquipmentSlotBox = ({ slot, label, item }: any) => {
  const isEquipped = !!item;
  const getIcon = (s: string) => {
      if (s === 'head') return <Shield size={21} />;
      if (s === 'chest') return <Shield size={21} />;
      if (s === 'ring') return <BarChart3 size={21} />;
      return <Layers size={21} />;
  };
  return (
    <div className={`flex flex-col p-2 rounded-sm border transition-all h-full ${isEquipped ? 'bg-purple-600/5 border-purple-500/60' : 'bg-slate-950 border-slate-800/40 opacity-40'}`}>
      <span className="text-[8.3px] font-black text-slate-500 uppercase">{label}</span>
      <div className="flex-1 flex flex-col items-center justify-center text-center py-1"><div className={`mb-1 ${isEquipped ? 'text-purple-400' : 'text-slate-800'}`}>{getIcon(slot)}</div><h4 className={`text-[10.4px] font-black uppercase leading-[1.2] line-clamp-2 ${isEquipped ? 'text-white' : 'text-slate-800'}`}>{item?.name || 'Vazio'}</h4></div>
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
            
            <div className="relative z-10 p-2 h-full flex flex-col">
                <span className="text-[8.3px] font-black text-slate-500 uppercase">{label}</span>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {!hasWeapon ? (
                        <>
                            <div className="mb-1 text-slate-800">{icon}</div>
                            <h4 className="text-[10.4px] font-black uppercase leading-[1.2] text-slate-800 italic">Vazio</h4>
                        </>
                    ) : (
                        <>
                            <h4 className="text-[11px] font-black uppercase leading-[1.1] text-white mb-1 drop-shadow-md line-clamp-2">{weapon.nome}</h4>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-white/10 rounded-sm">
                                <Zap size={8} className="text-emerald-400" />
                                <span className="text-[9px] font-black text-emerald-400 tabular-nums">{weapon.dano_base} ATK</span>
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

const WeaponCard = ({ weapon, playerLevel, affinities, isPrimary, isSecondary, onEquipPrimary, onEquipSecondary, onShowDetail }: any) => {
    const isLocked = playerLevel < (weapon.nivel_desbloqueio || 1);
    
    return (
        <div 
          style={{ width: '267px', height: '375px' }}
          className={`relative flex flex-col bg-[#030712] border-2 rounded-sm transition-all overflow-hidden flex-shrink-0 ${isLocked ? 'grayscale opacity-50 cursor-not-allowed border-slate-900' : 'hover:scale-[1.02] group'} ${isPrimary || isSecondary ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-slate-800'}`}
        >
            {isLocked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
                   <LockKeyhole size={24} className="text-rose-500 mb-2" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Acesso Negado</span>
                   <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Nível Global {weapon.nivel_desbloqueio} Requerido</span>
                </div>
            )}

            <div className="relative w-full h-[250px] bg-slate-950 border-b border-slate-800 overflow-hidden group-hover:bg-black transition-colors">
                {weapon.img ? (
                  <img src={weapon.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={weapon.nome} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
                    <Sword size={48} className={`transition-colors opacity-20 ${isPrimary || isSecondary ? 'text-rose-400' : 'text-slate-800'}`} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-black/30" />

                <div className="absolute top-2 left-2 z-20">
                   <span className={`px-2 py-0.5 border text-[9px] font-black tracking-widest backdrop-blur-md bg-black/60 ${getRankColor(weapon.rank)}`}>RANK {weapon.rank}</span>
                </div>
                
                <div className="absolute top-2 right-2 z-20 flex gap-1.5">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onShowDetail(); }}
                    className="p-1.5 bg-black/60 backdrop-blur-md border border-slate-800 rounded-sm text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-xl"
                    title="Detalhes do Artefato"
                   >
                    <Eye size={12} />
                   </button>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-slate-800 rounded-sm">
                    {getAttributeIcon(weapon.atributo_principal, 10)}
                    <span className="text-[8px] font-black text-white uppercase italic">{weapon.atributo_principal}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 z-20 flex flex-col items-center">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center line-clamp-1 w-full">{weapon.nome}</h4>
                    <div className="flex items-center gap-2 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                       <Zap size={10} className="text-emerald-500" />
                       <span className="text-[14px] font-black text-emerald-400 tabular-nums">{weapon.dano_base} ATK</span>
                    </div>
                </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col bg-[#030712] justify-between">
                <div className="pt-1 border-t border-slate-800/50">
                    <div className="flex items-center justify-between mb-4 px-1">
                       <div className="flex flex-col"><span className="text-[7px] text-slate-600 font-black uppercase">Fase do Artefato</span><span className="text-[10px] font-black text-blue-400">LV.{weapon.lvl_min || 1} / {weapon.lvl_max || 10}</span></div>
                       <div className="flex flex-col items-end"><span className="text-[7px] text-slate-600 font-black uppercase">Material Upgrade</span><span className="text-[8px] font-black text-slate-400 truncate max-w-[120px] text-right">{weapon.material_upgrade || '--'}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button disabled={isLocked} onClick={onEquipPrimary} className={`py-3 text-[10px] font-black uppercase rounded-sm border transition-all ${isPrimary ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>{isPrimary ? 'PRIMÁRIA' : 'EQUIPAR 1'}</button>
                        <button disabled={isLocked} onClick={onEquipSecondary} className={`py-3 text-[10px] font-black uppercase rounded-sm border transition-all ${isSecondary ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>{isSecondary ? 'SECUNDÁRIA' : 'EQUIPAR 2'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerStatusWindow;
