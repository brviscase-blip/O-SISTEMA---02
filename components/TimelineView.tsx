
import React from 'react';
import { Milestone, ItemRank } from '../types';
import { Calendar, Award, Shield, Star, Crown, ChevronRight } from 'lucide-react';

interface Props {
  milestones: Milestone[];
  currentRank: ItemRank;
}

const getRankColor = (rank: ItemRank) => {
  switch (rank) {
    case 'E': return 'text-slate-400 border-slate-500 bg-slate-500/10';
    case 'D': return 'text-emerald-400 border-emerald-500 bg-emerald-500/10';
    case 'C': return 'text-blue-400 border-blue-500 bg-blue-500/10';
    case 'B': return 'text-purple-400 border-purple-500 bg-purple-500/10';
    case 'A': return 'text-orange-400 border-orange-500 bg-orange-500/10';
    case 'S': return 'text-rose-500 border-rose-500 bg-rose-500/10';
    default: return 'text-slate-400';
  }
};

const getRankTitle = (rank: ItemRank) => {
  if (['E', 'D'].includes(rank)) return 'Iniciante';
  if (['C', 'B'].includes(rank)) return 'Operativo';
  return 'Monarca';
};

const TimelineView: React.FC<Props> = ({ milestones, currentRank }) => {
  const sortedMilestones = [...milestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const rankTitle = getRankTitle(currentRank);

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-8 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#010307]">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-12 border-l-4 border-purple-600 pl-6">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">ÁLBUM DE CONQUISTAS</h1>
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] opacity-70">REGISTROS HISTÓRICOS DO {rankTitle.toUpperCase()}</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 via-blue-600 to-transparent transform -translate-x-1/2 opacity-30" />

          <div className="space-y-12">
            {sortedMilestones.map((milestone, index) => (
              <div 
                key={milestone.id} 
                className={`relative flex flex-col md:flex-row items-start md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Node Dot */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-black border-4 border-purple-600 transform -translate-x-1/2 z-10 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                   <Award size={14} className="text-purple-400" />
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-[45%] ml-12 md:ml-0 group`}>
                   <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm shadow-2xl transition-all duration-300 group-hover:border-purple-500/50 group-hover:translate-y-[-4px] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <Calendar size={12} className="text-purple-500" />
                          {new Date(milestone.date).toLocaleDateString()}
                        </div>
                        <div className={`px-2 py-0.5 rounded-sm border text-[8px] font-black tracking-widest ${getRankColor(milestone.rank)}`}>
                          RANK {milestone.rank}
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-white uppercase italic mb-2 tracking-tight">{milestone.title}</h3>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">{milestone.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                        <span className="text-[9px] font-black text-slate-600 uppercase">NÍVEL ALCANÇADO: {milestone.level}</span>
                        <ChevronRight size={14} className="text-slate-800 group-hover:text-purple-500 transition-colors" />
                      </div>
                   </div>
                </div>

                {/* Time Indicator (Empty spacer for MD layout) */}
                <div className="hidden md:block md:w-[45%]" />
              </div>
            ))}
          </div>
        </div>

        {milestones.length === 0 && (
          <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800">
             <Star size={48} className="text-slate-800 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">NENHUM MARCO REGISTRADO NO SISTEMA</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
