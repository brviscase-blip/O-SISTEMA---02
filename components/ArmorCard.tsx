
import React from 'react';
import { Backpack, Settings2, Shield, Layers, BarChart3 } from 'lucide-react';
import { EquipmentItem } from '../types';

interface ArmorCardProps {
  equipment: Record<string, EquipmentItem | null>;
  onOpenManagement: () => void;
}

const ArmorCard: React.FC<ArmorCardProps> = ({ equipment, onOpenManagement }) => {
  return (
    <div className="h-full bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
      <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Backpack size={10} className="text-purple-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ARMADURAS</h3>
        </div>
        <button onClick={onOpenManagement} className="p-1 text-purple-400 hover:text-white transition-all">
          <Settings2 size={12} />
        </button>
      </div>
      <div className="p-1 grid grid-cols-3 grid-rows-2 gap-1 flex-1 min-h-0">
        <EquipmentSlotBox slot="head" label="CABEÇA" item={equipment.head} />
        <EquipmentSlotBox slot="chest" label="PEITORAL" item={equipment.chest} />
        <EquipmentSlotBox slot="hands" label="MÃOS" item={equipment.hands} />
        <EquipmentSlotBox slot="legs" label="PERNAS" item={equipment.legs} />
        <EquipmentSlotBox slot="feet" label="PÉS" item={equipment.feet} />
        <EquipmentSlotBox slot="ring" label="ANEL" item={equipment.ring} />
      </div>
    </div>
  );
};

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
      <div className="flex-1 flex flex-col items-center justify-center text-center py-0.5">
        <div className={`mb-0.5 ${isEquipped ? 'text-purple-400' : 'text-slate-800'}`}>{getIcon(slot)}</div>
        <h4 className={`text-[9px] font-black uppercase leading-[1.1] line-clamp-1 ${isEquipped ? 'text-white' : 'text-slate-800'}`}>
          {item?.nome || 'Vazio'}
        </h4>
      </div>
    </div>
  );
};

export default ArmorCard;
