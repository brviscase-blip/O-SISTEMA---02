
import React, { useState, useMemo, useEffect } from 'react';
import { Coins, BarChart3, Lock, Heart, Zap, Activity } from 'lucide-react';
import { PlayerStatus, EquipmentItem, EquipmentSlot, PlayerStats } from '../types';
import AttributeCard from './AttributeCard';
import ArmorCard from './ArmorCard';
import ArsenalCard from './ArsenalCard';
import { WeaponArsenalModal, WeaponDetailModal } from './ArsenalModals';
import { ArmorModulationModal } from './ArmorModals';

interface Props {
  status: PlayerStatus;
  habits: any[];
  tasks: any[];
  vices: any[];
  onUpdateStat?: (stat: keyof PlayerStatus['stats']) => void;
  onEquipItem?: (item: EquipmentItem) => void;
  onUnequipItem?: (slot: EquipmentSlot) => void;
  onUpdatePlayer?: (updates: Partial<PlayerStatus>) => void;
  onStartTrial?: (weapon: any) => void;
}

const getRankTheme = (rank: string) => {
  switch (String(rank || 'E').toUpperCase()) {
    case 'S': return { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10' };
    case 'A': return { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'B': return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10' };
    case 'C': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'D': return { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    default: return { border: 'border-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/10' };
  }
};

const PlayerStatusWindow: React.FC<Props> = ({ status, onUpdateStat, onUnequipItem, onUpdatePlayer, onEquipItem, onStartTrial }) => {
  const [isArmorModalOpen, setIsArmorModalOpen] = useState(false);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<any | null>(null);

  const [equippedWeapons, setEquippedWeapons] = useState<{ primary: any | null, secondary: any | null }>(() => {
    const saved = localStorage.getItem('equipped_arsenal');
    return saved ? JSON.parse(saved) : { primary: null, secondary: null };
  });

  useEffect(() => {
    localStorage.setItem('equipped_arsenal', JSON.stringify(equippedWeapons));
  }, [equippedWeapons]);

  const xpProgress = Math.min(100, (Number(status.xp || 0) / Number(status.maxXp || 1)) * 100);
  const hpGlobalProgress = Math.min(100, (Number(status.hp || 0) / Number(status.maxHp || 1)) * 100);
  
  const totalBonuses = useMemo(() => {
    const INITIAL_STATS = { strength: 0, agility: 0, intelligence: 0, perception: 0, vitality: 0, hp: 0, mp: 0 };
    return Object.values(status.equipment || {}).reduce((acc: PlayerStats, item: any) => {
      if (!item || !item.bonus) return acc;
      Object.entries(item.bonus).forEach(([stat, val]) => {
        if (stat in acc) (acc as any)[stat] += Number(val) || 0;
      });
      return acc;
    }, INITIAL_STATS);
  }, [status.equipment]);

  return (
    <div className="h-full w-full flex flex-col gap-1.5 p-1.5 bg-[#010307] overflow-hidden select-none">
      {/* ESPINHA DORSAL: CABEÇALHO DE SOBREVIVÊNCIA */}
      <div className="bg-[#030712] border border-slate-800 p-3 shadow-2xl flex-shrink-0 rounded-sm h-[90px] flex flex-col justify-between">
        <div className="flex flex-row items-center justify-between gap-4 px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">SUNG JIN-WOO</h1>
              <div className={`px-2 py-0.5 rounded-sm border text-[8px] font-black tracking-[0.1em] ${getRankTheme(status.rank).text} ${getRankTheme(status.rank).border} ${getRankTheme(status.rank).bg}`}>RANK {status.rank}</div>
            </div>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[9px] font-black text-purple-500 uppercase tracking-[0.15em] italic opacity-80">{status.title || 'LEVELING...'}</span>
               <div className="w-1 h-1 rounded-full bg-slate-800" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NÍVEL {status.level}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* HP GLOBAL (VIDA REAL) */}
            <div className="flex flex-col items-end min-w-[120px]">
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">VITALIDADE REAL</span>
                 <Activity size={10} className="text-rose-600 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1.5 leading-none">
                 <span className="text-lg font-black text-white italic">{status.hp}</span>
                 <span className="text-[9px] font-bold text-slate-600">/ {status.maxHp}</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                 <div className="h-full bg-rose-600 transition-all duration-500" style={{ width: `${hpGlobalProgress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <StatHeader label="OURO" value={status.gold} color="text-white" icon={<Coins size={10} className="text-amber-500" />} />
              <StatHeader label="PONTOS" value={status.statPoints} color={status.statPoints > 0 ? 'text-emerald-400' : 'text-slate-700'} />
            </div>
          </div>
        </div>

        {/* BARRA DE XP EXPOENCIAL */}
        <div className="px-2 pb-1">
          <div className="flex justify-between items-end mb-1">
             <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">Sincronização de Progresso (XP)</span>
             <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{status.xp} / {status.maxXp}</span>
          </div>
          <div className="relative h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
            <div className="h-full transition-all duration-1000 bg-gradient-to-r from-purple-600 to-blue-400" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="flex-1 grid grid-cols-12 grid-rows-10 gap-1.5 min-h-0 overflow-hidden">
        <div className="col-span-3 row-span-10 grid grid-rows-10 gap-1.5 min-h-0">
          <div className="row-span-5">
            <AttributeCard status={status} totalBonuses={totalBonuses} onUpdateStat={onUpdateStat} />
          </div>
          <div className="row-span-3">
            <ArmorCard equipment={status.equipment as any} onOpenManagement={() => setIsArmorModalOpen(true)} />
          </div>
          <div className="row-span-2">
            <ArsenalCard equipped={equippedWeapons} onOpenManagement={() => setIsWeaponModalOpen(true)} />
          </div>
        </div>

        <div className="col-span-9 row-span-10 flex flex-col gap-1.5 min-h-0">
          <div className="flex-1 bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl relative overflow-hidden group">
            <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 size={10} className="text-blue-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">STATUS DIMENSIONAL</h3>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-[#010307]/40">
              <div className="w-16 h-16 bg-blue-900/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-3 relative">
                <Lock size={24} className="text-blue-500/40 animate-pulse" />
              </div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Matriz Ativa</h4>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest max-w-[240px] leading-relaxed italic">
                A SOBREVIVÊNCIA DEPENDE DA SUA CONSISTÊNCIA NO MUNDO REAL. <br/> 1000 NÍVEIS. 2 ANOS. UM ÚNICO JOGADOR.
              </p>
            </div>
          </div>
        </div>
      </div>

      <WeaponArsenalModal isOpen={isWeaponModalOpen} onClose={() => setIsWeaponModalOpen(false)} status={status} equipped={equippedWeapons} setEquipped={setEquippedWeapons} onShowDetail={setSelectedWeaponDetail} onStartTrial={onStartTrial} />
      <ArmorModulationModal isOpen={isArmorModalOpen} onClose={() => setIsArmorModalOpen(false)} status={status} onEquip={onEquipItem} onUnequip={onUnequipItem} onStartTrial={onStartTrial} />
      {selectedWeaponDetail && <WeaponDetailModal weapon={selectedWeaponDetail} onClose={() => setSelectedWeaponDetail(null)} />}
    </div>
  );
};

const StatHeader = ({ label, value, color, icon }: any) => (
  <div className="flex flex-col items-end leading-none">
    <span className="text-[8px] font-black text-slate-500 uppercase mb-1">{label}</span>
    <div className="flex items-center gap-1.5">
      {icon}
      <span className={`text-lg font-black italic tabular-nums ${color}`}>{value}</span>
    </div>
  </div>
);

export default PlayerStatusWindow;
