
import React from 'react';
import { Sword as SwordIcon, Gavel, Settings2 } from 'lucide-react';

interface ArsenalCardProps {
  equipped: { primary: any | null, secondary: any | null };
  onOpenManagement: () => void;
}

const ArsenalCard: React.FC<ArsenalCardProps> = ({ equipped, onOpenManagement }) => {
  return (
    <div className="h-full bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
      <div className="p-1.5 bg-black/40 border-b border-slate-800 flex items-center justify-between h-[30px] flex-shrink-0">
        <div className="flex items-center gap-2">
          <SwordIcon size={10} className="text-rose-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ARSENAL</h3>
        </div>
        <button onClick={onOpenManagement} className="p-1 text-rose-500 hover:text-white transition-all">
          <Settings2 size={12} />
        </button>
      </div>
      <div className="p-1 grid grid-cols-2 gap-1 flex-1 min-h-0">
        <WeaponSlot label="PRIMÁRIA" weapon={equipped.primary} icon={<SwordIcon size={16} />} color="rose" />
        <WeaponSlot label="SECUNDÁRIA" weapon={equipped.secondary} icon={<Gavel size={16} />} color="amber" />
      </div>
    </div>
  );
};

const WeaponSlot = ({ label, weapon, icon, color }: any) => {
  const hasWeapon = !!weapon;
  return (
    <div className={`flex flex-col rounded-sm border h-full transition-all relative overflow-hidden ${hasWeapon ? `border-${color}-500/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'bg-slate-950 border-slate-800/40 opacity-40'}`}>
      <div className="relative z-10 p-1.5 h-full flex flex-col">
        <span className="text-[7px] font-black text-slate-500 uppercase">{label}</span>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {!hasWeapon ? (
            <div className="mb-0.5 text-slate-800">{icon}</div>
          ) : (
            <>
              <h4 className="text-[10px] font-black uppercase leading-[1] text-white mb-0.5 drop-shadow-md line-clamp-1">{weapon.nome}</h4>
              <span className="text-[8px] font-black text-emerald-400 tabular-nums">{weapon.dano_inicial} ATK</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArsenalCard;
