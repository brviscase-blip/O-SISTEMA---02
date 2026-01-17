
import React from 'react';
import { Quest } from '../types';
import { AlertCircle, CheckCircle2, ListTodo, Ghost } from 'lucide-react';

interface Props {
  quests: Quest[];
  onComplete: (id: string) => void;
}

const QuestSystem: React.FC<Props> = ({ quests, onComplete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
          <ListTodo size={14} /> MISSÕES ATIVAS
        </h3>
        <span className="text-[9px] font-black text-slate-600 uppercase">AVISO: Falha resulta em penalidade</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map((quest) => (
          <div key={quest.id} className="bg-[#0a0f1d] border border-slate-800 p-4 rounded-sm flex flex-col gap-3 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 border rounded-full uppercase ${
                  quest.type === 'URGENTE' ? 'text-rose-500 border-rose-500/30 bg-rose-500/5' : 'text-blue-400 border-blue-400/30 bg-blue-400/5'
                }`}>
                  {quest.type}
                </span>
                <h4 className="text-xs font-black text-white uppercase tracking-tight mt-2">{quest.title}</h4>
              </div>
              <button 
                onClick={() => onComplete(quest.id)}
                disabled={quest.status === 'CONCLUIDA'}
                className={`p-2 rounded-full transition-all ${
                  quest.status === 'CONCLUIDA' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-600 hover:text-white hover:bg-slate-800'
                }`}
              >
                {quest.status === 'CONCLUIDA' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
                <span>PROGRESSO</span>
                <span>{quest.progress} / {quest.goal}</span>
              </div>
              <div className="h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${quest.status === 'CONCLUIDA' ? 'bg-emerald-500' : 'bg-purple-600'}`} 
                  style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-600 uppercase">RECOMPENSA: {quest.reward}</span>
              {quest.status === 'CONCLUIDA' && (
                <div className="flex items-center gap-1 text-[8px] font-black text-purple-400">
                   <Ghost size={10} /> DISPONÍVEL PARA EXTRAÇÃO
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestSystem;
