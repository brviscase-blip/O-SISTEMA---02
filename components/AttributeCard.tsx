
import React from 'react';
import { TrendingUp, Heart, Zap, Plus } from 'lucide-react';
import { PlayerStatus, PlayerStats } from '../types';

interface AttributeCardProps {
  status: PlayerStatus;
  totalBonuses: PlayerStats;
  onUpdateStat?: (stat: keyof PlayerStatus['stats']) => void;
}

const AttributeCard: React.FC<AttributeCardProps> = ({ status, totalBonuses, onUpdateStat }) => {
  return (
    <div className="h-full bg-[#030712] border border-slate-800 flex flex-col rounded-sm shadow-xl min-h-0 overflow-hidden">
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
          <AttributeRow label="FORÇA" base={status.stats.strength} bonus={totalBonuses.strength} onUpdate={() => onUpdateStat?.('strength')} canUpgrade={status.statPoints > 0} color="text-white" />
          <AttributeRow label="AGILIDADE" base={status.stats.agility} bonus={totalBonuses.agility} onUpdate={() => onUpdateStat?.('agility')} canUpgrade={status.statPoints > 0} color="text-white" />
          <AttributeRow label="VITALIDADE" base={status.stats.vitality} bonus={totalBonuses.vitality} onUpdate={() => onUpdateStat?.('vitality')} canUpgrade={status.statPoints > 0} color="text-white" />
          <AttributeRow label="INTELIGÊNCIA" base={status.stats.intelligence} bonus={totalBonuses.intelligence} onUpdate={() => onUpdateStat?.('intelligence')} canUpgrade={status.statPoints > 0} color="text-white" />
          <AttributeRow label="PERCEPÇÃO" base={status.stats.perception} bonus={totalBonuses.perception} onUpdate={() => onUpdateStat?.('perception')} canUpgrade={status.statPoints > 0} color="text-white" />
        </div>
      </div>
    </div>
  );
};

const VitalStat = ({ label, current, max, bonus, icon, activeColor }: any) => {
  const finalMax = (Number(max) || 0) + (Number(bonus) || 0);
  const fillWidth = finalMax > 0 ? Math.min(100, (Number(current) / finalMax) * 100) : 0;
  
  return (
    <div className="flex items-center justify-between p-1.5 border border-slate-800 bg-black/40 rounded-sm relative overflow-hidden h-[48px]">
      <div className="flex items-center gap-2.5 z-10">
        <div className={`w-7 h-7 rounded-sm flex items-center justify-center border border-slate-800 bg-slate-950/50 ${activeColor}`}>{icon}</div>
        <div><p className="text-[9px] font-black text-white uppercase tracking-widest">{label}</p></div>
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

const AttributeRow = ({ label, base, bonus, onUpdate, canUpgrade, color }: any) => (
  <div className="flex items-center justify-between py-1 border-b border-slate-800/20 px-2 group/row hover:bg-white/5 h-[42px] min-h-0">
    <div><span className="text-[9px] font-black text-slate-500 uppercase leading-none">{label}</span></div>
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end leading-none">
        <span className={`text-sm font-black tabular-nums ${color}`}>{base + (Number(bonus) || 0)}</span>
        {Number(bonus) > 0 && <span className="text-[8px] font-black text-emerald-500">+{bonus}</span>}
      </div>
      {canUpgrade && (
        <button onClick={onUpdate} className="w-5 h-5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center rounded-sm transition-all border border-emerald-500/20">
          <Plus size={10} />
        </button>
      )}
    </div>
  </div>
);

export default AttributeCard;
