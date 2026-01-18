
import React from 'react';
import { Shield, Zap, Plus, Activity, Sparkles } from 'lucide-react';
import { PlayerStatus, PlayerStats } from '../types';

interface AttributeCardProps {
  status: PlayerStatus;
  totalBonuses: PlayerStats;
  onUpdateStat?: (stat: keyof PlayerStatus['stats']) => void;
}

const AttributeCard: React.FC<AttributeCardProps> = ({ status, totalBonuses, onUpdateStat }) => {
  return (
    <div className="bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
      {/* HEADER BAR */}
      <div className="p-2 bg-black/40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-blue-500" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Atributos de Combate</h3>
        </div>
        <div className="px-3 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-sm">
           <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Sincronia Tática Ativa</span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* TOP ROW: Vitalidade e Energia (Lado a Lado) */}
        <div className="grid grid-cols-2 gap-8">
          {/* Dungeon HP */}
          <div className="space-y-1.5">
             <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                   <Activity size={10} className="text-blue-500" />
                   <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Poder Vital (Dungeon)</span>
                </div>
                <span className="text-[12px] font-black text-white italic tabular-nums">{status.dungeon_hp} <span className="text-[8px] text-slate-500 uppercase not-italic">/ {status.max_dungeon_hp}</span></span>
             </div>
             <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 p-0.5">
                <div className="h-full bg-blue-600 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${(status.dungeon_hp / status.max_dungeon_hp) * 100}%` }} />
             </div>
          </div>

          {/* Mana / Energia */}
          <div className="space-y-1.5">
             <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                   <Sparkles size={10} className="text-purple-500" />
                   <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Energia Dimensional</span>
                </div>
                <span className="text-[12px] font-black text-white italic tabular-nums">{status.mp} <span className="text-[8px] text-slate-500 uppercase not-italic">/ {status.maxMp}</span></span>
             </div>
             <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 p-0.5">
                <div className="h-full bg-purple-600 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" style={{ width: `${(status.mp / status.maxMp) * 100}%` }} />
             </div>
          </div>
        </div>

        {/* BOTTOM ROW: Atributos Distribuídos */}
        <div className="border-t border-slate-800/50 pt-4 flex items-center justify-between gap-6 px-2">
           <AttrCol label="FORÇA" value={status.stats.strength} onAdd={() => onUpdateStat?.('strength')} canAdd={status.statPoints > 0} color="text-blue-500" />
           <div className="h-8 w-px bg-slate-800/50" />
           <AttrCol label="AGILIDADE" value={status.stats.agility} onAdd={() => onUpdateStat?.('agility')} canAdd={status.statPoints > 0} color="text-emerald-500" />
           <div className="h-8 w-px bg-slate-800/50" />
           <AttrCol label="VITALIDADE" value={status.stats.vitality} onAdd={() => onUpdateStat?.('vitality')} canAdd={status.statPoints > 0} color="text-rose-500" />
           <div className="h-8 w-px bg-slate-800/50" />
           <AttrCol label="INTELIGÊNCIA" value={status.stats.intelligence} onAdd={() => onUpdateStat?.('intelligence')} canAdd={status.statPoints > 0} color="text-purple-500" />
           <div className="h-8 w-px bg-slate-800/50" />
           <AttrCol label="PERCEPÇÃO" value={status.stats.perception} onAdd={() => onUpdateStat?.('perception')} canAdd={status.statPoints > 0} color="text-amber-500" />
        </div>
      </div>
    </div>
  );
};

const AttrCol = ({ label, value, onAdd, canAdd, color }: any) => (
  <div className="flex flex-col items-center gap-1 min-w-[70px]">
     <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-2">
        <span className={`text-xl font-black italic tabular-nums text-white`}>{value}</span>
        {canAdd && (
          <button onClick={onAdd} className={`w-5 h-5 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-sm flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-90`}>
             <Plus size={10} />
          </button>
        )}
     </div>
  </div>
);

export default AttributeCard;
