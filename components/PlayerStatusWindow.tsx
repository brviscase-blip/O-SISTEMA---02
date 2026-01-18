
import React, { useState, useEffect } from 'react';
import { Activity, Settings, BarChart3, Package, Ghost, FlaskConical, Crown, Settings2 } from 'lucide-react';
import { PlayerStatus, EquipmentItem } from '../types';
import AttributeCard from './AttributeCard';
import ArmorCard from './ArmorCard';
import ArsenalCard from './ArsenalCard';
import { WeaponArsenalModal, WeaponDetailModal } from './ArsenalModals';
import { ArmorModulationModal } from './ArmorModals';
import AccountSettingsModal from './AccountSettingsModal';

interface Props {
  status: PlayerStatus;
  profile: any;
  onUpdateProfile: (newProfile: any) => void;
  onSignOut: () => void;
  addNotification: (msg: string, type: any) => void;
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
  profile,
  onUpdateProfile,
  onSignOut,
  addNotification,
  onUpdateStat, 
  onEquipItem, 
  onUnequipItem, 
  onStartTrial,
  onUpdatePlayer 
}) => {
  const [isArmorModalOpen, setIsArmorModalOpen] = useState(false);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<any | null>(null);

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
    <div className="h-full w-full flex flex-col gap-2 p-2 bg-[#010307] select-none overflow-hidden font-sans">
      {/* MONITOR VITAL GLOBAL (HEADER) */}
      <div className="flex-shrink-0 bg-[#030712] border border-slate-800 p-4 rounded-sm shadow-2xl flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
          <Activity size={80} className="text-slate-800" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsAccountModalOpen(true)}
              className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500/50 transition-all group"
            >
              <Settings size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {profile?.username || 'CAÇADOR NÃO IDENTIFICADO'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-sm">RANK {status.rank}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-slate-800 pl-2">NÍVEL {status.level}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
             <div className="flex flex-col items-end min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                   <Activity size={12} className="text-rose-600 animate-pulse" />
                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Vitalidade Real</span>
                </div>
                <div className="flex items-baseline gap-2 leading-none">
                   <span className="text-3xl font-black text-white italic tabular-nums">{status.hp}</span>
                   <span className="text-[10px] font-bold text-slate-600">/ {status.maxHp}</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-900">
                   <div className="h-full bg-rose-600 transition-all duration-1000 shadow-[0_0_15px_rgba(225,29,72,0.4)]" style={{ width: `${hpPercent}%` }} />
                </div>
             </div>

             <div className="flex items-center gap-8">
                <StatBox label="OURO" value={status.gold} color="text-amber-500" />
                <StatBox label="PONTOS" value={status.statPoints} color="text-emerald-500" />
             </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
          <div className="flex justify-between items-end text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 px-1">
             <span className="flex items-center gap-2 italic">Sincronização de Dados Biométricos</span>
             <span className="text-blue-500">{status.xp} / {status.maxXp} XP</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
             <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.2)]" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* DASHBOARD DE MATRIZ (12 COLUNAS) */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        
        {/* BLOCO OPERACIONAL (COLUNAS 1-8) */}
        {/* Row setup: auto (attributes), 1fr (armors/arsenal), 1fr (inventory/consumables) */}
        <div className="col-span-8 grid grid-rows-[auto_1fr_1fr] gap-2 min-h-0">
          
          {/* TOPO: Atributos Expandidos */}
          <div className="row-span-1">
            <AttributeCard status={status} totalBonuses={{} as any} onUpdateStat={onUpdateStat} />
          </div>

          {/* MEIO: Armaduras e Arsenal (Identidade 1fr) */}
          <div className="grid grid-cols-2 gap-2 min-h-0">
            <ArmorCard equipment={status.equipment} onOpenManagement={() => setIsArmorModalOpen(true)} />
            <ArsenalCard equipped={equippedWeapons} onOpenManagement={() => setIsWeaponModalOpen(true)} />
          </div>

          {/* BASE: Inventário Geral e Consumíveis (Identidade 1fr - Simétricos aos de cima) */}
          <div className="grid grid-cols-2 gap-2 min-h-0">
            <InventorySection title="INVENTÁRIO GERAL" slots={10} gridCols="grid-cols-5" icon={<Package size={10}/>} color="blue" />
            <InventorySection title="CONSUMÍVEIS" slots={10} gridCols="grid-cols-5" icon={<FlaskConical size={10}/>} color="emerald" />
          </div>
        </div>

        {/* BLOCO DE COMANDO (COLUNAS 9-12) */}
        <div className="col-span-4 grid grid-rows-[1.5fr_1fr] gap-2 min-h-0">
          
          {/* PLACEHOLDER SUPERIOR */}
          <div className="bg-[#030712] border border-slate-800 rounded-sm p-4 flex flex-col items-center justify-center text-center opacity-40 relative overflow-hidden">
             <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             <BarChart3 size={48} className="text-slate-800 mb-4" />
             <h3 className="text-sm font-black uppercase tracking-[0.4em]">Visualizer_Core</h3>
             <p className="text-[8px] font-bold text-slate-600 uppercase mt-2 tracking-widest italic">Aguardando Input Biométrico</p>
          </div>

          {/* EXÉRCITO DAS SOMBRAS */}
          <div className="bg-[#030712] border border-slate-800 rounded-sm p-4 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
               <Ghost size={14} className="text-blue-500" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Exército das Sombras</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
               <Ghost size={32} className="text-slate-700 mb-2" />
               <span className="text-[9px] font-black uppercase tracking-widest italic">Nenhuma Sombra Sobjugada</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AccountSettingsModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onSignOut={onSignOut}
        addNotification={addNotification}
      />
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

const InventorySection = ({ title, slots, gridCols, icon, color }: any) => {
  const colorMap: any = {
    blue: 'text-blue-400 border-blue-500/60 hover:text-white',
    emerald: 'text-emerald-400 border-emerald-500/60 hover:text-white',
    purple: 'text-purple-400 border-purple-500/60 hover:text-white'
  };

  return (
    <div className="h-full bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
      {/* Identical Header Pattern to Armor/Arsenal Cards */}
      <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={colorMap[color].split(' ')[0]}>{icon}</span>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        </div>
        <button className={`p-1 transition-all ${colorMap[color]}`}>
          <Settings2 size={12} />
        </button>
      </div>

      {/* Grid Area */}
      <div className={`p-1 flex-1 grid ${gridCols} gap-1 min-h-0`}>
        {Array.from({ length: slots }).map((_, i) => (
          <div 
            key={i} 
            className="aspect-square bg-slate-950 border border-slate-800/40 rounded-sm flex items-center justify-center group hover:border-blue-500/30 transition-colors relative overflow-hidden"
          >
            <div className="w-1 h-1 rounded-full bg-slate-900 group-hover:bg-blue-900 transition-colors" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-blue-500 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }: any) => (
  <div className="flex flex-col items-end leading-none">
    <span className="text-[8px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">{label}</span>
    <span className={`text-2xl font-black italic tabular-nums ${color}`}>{value}</span>
  </div>
);

export default PlayerStatusWindow;
