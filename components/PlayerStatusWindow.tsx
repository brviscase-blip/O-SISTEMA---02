
import React, { useState, useEffect } from 'react';
import { Activity, Coins, BarChart3 } from 'lucide-react';
import { PlayerStatus, EquipmentItem } from '../types';
import AttributeCard from './AttributeCard';
import ArmorCard from './ArmorCard';
import ArsenalCard from './ArsenalCard';
import { WeaponArsenalModal, WeaponDetailModal } from './ArsenalModals';
import { ArmorModulationModal } from './ArmorModals';

interface Props {
  status: PlayerStatus;
  onUpdateStat: (stat: keyof PlayerStatus['stats']) => void;
  onUpdatePlayer?: (updates: Partial<PlayerStatus>) => void;
  onEquipItem: (item: EquipmentItem) => void;
  onUnequipItem: (slot: string) => void;
  onStartTrial: (item: any) => void;
  habits: any[];
  tasks: any[];
  vices: any[];
}

const PlayerStatusWindow: React.FC<Props> = ({ 
  status, 
  onUpdateStat, 
  onEquipItem, 
  onUnequipItem, 
  onStartTrial,
  onUpdatePlayer 
}) => {
  const [isArmorModalOpen, setIsArmorModalOpen] = useState(false);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<any | null>(null);

  // Estado local para armas equipadas (Arsenal) persistido
  const [equippedWeapons, setEquippedWeapons] = useState<{ primary: any | null, secondary: any | null }>(() => {
    const saved = localStorage.getItem('nexus_equipped_weapons');
    return saved ? JSON.parse(saved) : { primary: null, secondary: null };
  });

  useEffect(() => {
    localStorage.setItem('nexus_equipped_weapons', JSON.stringify(equippedWeapons));
  }, [equippedWeapons]);

  const hpPercent = (status.hp / status.maxHp) * 100;
  const xpPercent = (status.xp / status.maxXp) * 100;

  return (
    <div className="h-full w-full flex flex-col gap-2 p-2 bg-[#010307] select-none">
      {/* MONITOR VITAL GLOBAL (Espinha Dorsal) */}
      <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">SUNG JIN-WOO</h1>
            <div className="flex items-center gap-2 mt-1.5">
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-sm">RANK {status.rank}</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase">NÍVEL {status.level}</span>
            </div>
          </div>

          <div className="flex items-center gap-10">
             {/* Monitor de HP Global (Vida Real) */}
             <div className="flex flex-col items-end min-w-[150px]">
                <div className="flex items-center gap-2 mb-1">
                   <Activity size={12} className="text-rose-600 animate-pulse" />
                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Vitalidade Real</span>
                </div>
                <div className="flex items-baseline gap-2 leading-none">
                   <span className="text-2xl font-black text-white italic">{status.hp}</span>
                   <span className="text-[10px] font-bold text-slate-600">/ {status.maxHp}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-rose-600 transition-all duration-1000 shadow-[0_0_10px_rgba(225,29,72,0.5)]" style={{ width: `${hpPercent}%` }} />
                </div>
             </div>

             <div className="flex items-center gap-6">
                <StatBox label="OURO" value={status.gold} color="text-amber-500" />
                <StatBox label="PONTOS" value={status.statPoints} color="text-emerald-500" />
             </div>
          </div>
        </div>

        {/* Barra de XP Linear */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 px-1">
             <span>Sincronização de Dados</span>
             <span>{status.xp} / {status.maxXp} XP</span>
          </div>
          <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
             <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)]" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Grid de Atributos e Equipamentos */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        <div className="col-span-3 flex flex-col gap-2 min-h-0">
           <AttributeCard status={status} totalBonuses={{} as any} onUpdateStat={onUpdateStat} />
           <ArmorCard 
             equipment={status.equipment} 
             onOpenManagement={() => setIsArmorModalOpen(true)} 
           />
           <ArsenalCard 
             equipped={equippedWeapons} 
             onOpenManagement={() => setIsWeaponModalOpen(true)} 
           />
        </div>
        
        <div className="col-span-9 bg-[#030712] border border-slate-800 rounded-sm p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
               <BarChart3 size={64} className="text-slate-800 mb-6" />
               <h3 className="text-lg font-black uppercase tracking-[0.5em]">Matriz de Sincronia</h3>
               <p className="text-[10px] font-bold text-slate-600 uppercase mt-4 tracking-widest">
                  O SISTEMA ESTÁ MONITORANDO CADA AÇÃO NO MUNDO REAL. <br/>
                  FALHAS REPETIDAS RESULTARÃO EM EXPURGO DE DADOS.
               </p>
            </div>
        </div>
      </div>

      {/* Modais de Gerenciamento */}
      <WeaponArsenalModal 
        isOpen={isWeaponModalOpen} 
        onClose={() => setIsWeaponModalOpen(false)} 
        status={status} 
        equipped={equippedWeapons} 
        setEquipped={setEquippedWeapons} 
        onShowDetail={setSelectedWeaponDetail} 
        onStartTrial={onStartTrial} 
      />

      <ArmorModulationModal 
        isOpen={isArmorModalOpen} 
        onClose={() => setIsArmorModalOpen(false)} 
        status={status} 
        onEquip={onEquipItem} 
        onUnequip={onUnequipItem} 
        onStartTrial={onStartTrial} 
      />

      {selectedWeaponDetail && (
        <WeaponDetailModal 
          weapon={selectedWeaponDetail} 
          onClose={() => setSelectedWeaponDetail(null)} 
        />
      )}
    </div>
  );
};

const StatBox = ({ label, value, color }: any) => (
  <div className="flex flex-col items-end leading-none">
    <span className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">{label}</span>
    <span className={`text-xl font-black italic tabular-nums ${color}`}>{value}</span>
  </div>
);

export default PlayerStatusWindow;
