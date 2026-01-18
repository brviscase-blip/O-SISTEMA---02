
import React from 'react';
import { Shield, Zap, Plus } from 'lucide-react';
import { PlayerStatus, PlayerStats } from '../types';

interface AttributeCardProps {
  status: PlayerStatus;
  totalBonuses: PlayerStats;
  onUpdateStat?: (stat: keyof PlayerStatus['stats']) => void;
}

const AttributeCard: React.FC<AttributeCardProps> = ({ status, totalBonuses, onUpdateStat }) => {
  return (
    <div className="bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
      <div className="p-2 bg-black/40 border-b border-slate-800 flex items-center gap-2">
        <Shield size={12} className="text-blue-500" />
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Atributos de Combate</h3>
      </div>
      
      <div className="p-3 space-y-3">
        {/* Dungeon HP (Escala +15 por Nível) */}
        <div className="space-y-1">
           <div className="flex justify-between items-end">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Poder Vital</span>
              <span className="text-[10px] font-black text-white italic">{status.dungeon_hp} / {status.max_dungeon_hp}</span>
           </div>
           <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(status.dungeon_hp / status.max_dungeon_hp) * 100}%` }} />
           </div>
        </div>

        <div className="space-y-1">
           <div className="flex justify-between items-end">
              <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Energia Dimensional</span>
              <span className="text-[10px] font-black text-white italic">{status.mp} / {status.maxMp}</span>
           </div>
           <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${(status.mp / status.maxMp) * 100}%` }} />
           </div>
        </div>

        <div className="border-t border-slate-800/50 pt-3 space-y-2">
           <AttrRow label="FOR" value={status.stats.strength} onAdd={() => onUpdateStat?.('strength')} canAdd={status.statPoints > 0} />
           <AttrRow label="AGI" value={status.stats.agility} onAdd={() => onUpdateStat?.('agility')} canAdd={status.statPoints > 0} />
           <AttrRow label="VIT" value={status.stats.vitality} onAdd={() => onUpdateStat?.('vitality')} canAdd={status.statPoints > 0} />
           <AttrRow label="INT" value={status.stats.intelligence} onAdd={() => onUpdateStat?.('intelligence')} canAdd={status.statPoints > 0} />
           <AttrRow label="PER" value={status.stats.perception} onAdd={() => onUpdateStat?.('perception')} canAdd={status.statPoints > 0} />
        </div>
      </div>
    </div>
  );
};

const AttrRow = ({ label, value, onAdd, canAdd }: any) => (
  <div className="flex items-center justify-between group">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-3">
        <span className="text-sm font-black text-white italic tabular-nums">{value}</span>
        {canAdd && (
          <button onClick={onAdd} className="w-5 h-5 bg-blue-600 text-white rounded-sm flex items-center justify-center hover:bg-blue-500 transition-all">
             <Plus size={10} />
          </button>
        )}
     </div>
  </div>
);

export default AttributeCard;
