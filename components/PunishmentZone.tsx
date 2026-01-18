
import React, { useState, useEffect } from 'react';
import { Skull, AlertTriangle, ShieldAlert, Timer, CheckCircle2, Dumbbell, Zap } from 'lucide-react';
import { PlayerStatus } from '../types';

interface Props {
  status: PlayerStatus;
  onComplete: () => void;
}

const PunishmentZone: React.FC<Props> = ({ status, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(3600 * 4); // 4 horas para punição física
  const [completedExercises, setCompletedExercises] = useState({ pushups: false, situps: false, squats: false, run: false });

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isAllDone = Object.values(completedExercises).every(v => v);

  return (
    <div className="absolute inset-0 z-[9999] bg-[#050000] flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      {/* Background Glitch Effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,0,0,0.1)_2px)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-900/20 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-2xl w-full bg-[#0a0000] border-2 border-rose-900 p-10 rounded-sm shadow-[0_0_100px_rgba(225,29,72,0.3)] relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-rose-950/40 border-2 border-rose-600 rounded-full flex items-center justify-center text-rose-500 mb-8 animate-bounce shadow-[0_0_30px_rgba(225,29,72,0.5)]">
           <Skull size={50} />
        </div>

        <h1 className="text-4xl font-black text-rose-600 italic tracking-tighter uppercase mb-2">ZONA DE PUNIÇÃO ATIVADA</h1>
        <p className="text-[10px] font-black text-rose-900 uppercase tracking-[0.5em] mb-8">Protocolo de Sobrevivência: 0% Energia Vital</p>
        
        <div className="bg-rose-900/10 border border-rose-900/30 p-6 rounded-sm w-full mb-10">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2"><Timer size={14}/> TEMPO PARA O RESET DEFINITIVO</span>
              <span className="text-2xl font-black text-white italic tabular-nums">{formatTime(timeLeft)}</span>
           </div>
           <div className="h-1.5 w-full bg-rose-950 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 animate-pulse" style={{ width: `${(timeLeft / (3600 * 4)) * 100}%` }} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
           <ExerciseCard label="100 FLEXÕES" done={completedExercises.pushups} onToggle={() => setCompletedExercises(prev => ({...prev, pushups: !prev.pushups}))} />
           <ExerciseCard label="100 ABDOMINAIS" done={completedExercises.situps} onToggle={() => setCompletedExercises(prev => ({...prev, situps: !prev.situps}))} />
           <ExerciseCard label="100 AGACHAMENTOS" done={completedExercises.squats} onToggle={() => setCompletedExercises(prev => ({...prev, squats: !prev.squats}))} />
           <ExerciseCard label="CORRIDA 10KM" done={completedExercises.run} onToggle={() => setCompletedExercises(prev => ({...prev, run: !prev.run}))} />
        </div>

        <button 
          disabled={!isAllDone}
          onClick={onComplete}
          className={`w-full py-6 text-sm font-black uppercase tracking-[0.5em] transition-all rounded-sm flex items-center justify-center gap-4 ${isAllDone ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20' : 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50'}`}
        >
          {isAllDone ? <Zap size={20} /> : <ShieldAlert size={20} />}
          CONCLUIR MISSÃO DE SOBREVIVÊNCIA
        </button>

        <p className="mt-8 text-[9px] font-bold text-rose-950 uppercase tracking-widest leading-relaxed">
          AVISO: SE O CRONÔMETRO ZERAR OU O SISTEMA DETECTAR FRAUDE, <br/> OS DADOS DO JOGADOR SERÃO EXPURGADOS PERMANENTEMENTE.
        </p>
      </div>
    </div>
  );
};

const ExerciseCard = ({ label, done, onToggle }: any) => (
  <button onClick={onToggle} className={`flex items-center justify-between p-4 border rounded-sm transition-all ${done ? 'bg-emerald-900/10 border-emerald-500/50 text-emerald-400' : 'bg-black/40 border-rose-900/30 text-rose-900 hover:border-rose-600'}`}>
     <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
     {done ? <CheckCircle2 size={18} /> : <Dumbbell size={18} className="opacity-30" />}
  </button>
);

export default PunishmentZone;
