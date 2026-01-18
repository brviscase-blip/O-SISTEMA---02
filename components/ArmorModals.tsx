
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, X, Loader2, Search, CheckCircle2, 
  ShieldCheck, Dumbbell, Zap, Brain, Target,
  Plus, Layers, ShieldAlert, Heart, Skull, LockKeyhole, Eye
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import { PlayerStatus, ItemRank } from '../types';

const getRankTheme = (rank: string) => {
  switch (String(rank || 'E').toUpperCase()) {
    case 'S': return { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/30', drop: 'drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]' };
    case 'A': return { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/30', drop: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' };
    case 'B': return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/30', drop: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]' };
    case 'C': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/30', drop: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' };
    case 'D': return { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/30', drop: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]' };
    default: return { border: 'border-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/10', glow: '', drop: '' };
  }
};

const getAttributeIcon = (attr: string, size = 12) => {
  const normalized = String(attr || '').toUpperCase();
  switch (normalized) {
    case 'FORÇA': return <Dumbbell size={size} />;
    case 'AGILIDADE': return <Zap size={size} />;
    case 'INTELIGÊNCIA': return <Brain size={size} />;
    case 'VITALIDADE': return <Heart size={size} />;
    case 'PERCEPÇÃO': return <Eye size={size} />;
    default: return <Target size={size} />;
  }
};

const rankWeights: Record<string, number> = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };

export const ArmorModulationModal = ({ isOpen, onClose, status, onEquip, onUnequip, onStartTrial }: any) => {
  const [search, setSearch] = useState('');
  const [activeSlot, setActiveSlot] = useState<string | 'ALL'>('ALL');
  const [armorPieces, setArmorPieces] = useState<any[]>([]);
  const [armorSets, setArmorSets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const slots = ['CABEÇA', 'PEITORAL', 'MÃOS', 'PERNAS', 'PÉS', 'ANEL'];

  useEffect(() => {
    if (isOpen) {
      const fetch = async () => {
        const client = getSupabaseClient();
        setIsLoading(true);
        const { data: pieces } = await client.from('armaduras').select('*');
        const { data: sets } = await client.from('conjuntos_armadura').select('*');
        if (pieces) setArmorPieces(pieces);
        if (sets) setArmorSets(sets);
        setIsLoading(false);
      };
      fetch();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const playerWeight = rankWeights[status.rank] || 0;
    return armorPieces.filter(p => {
      const matchesSearch = String(p.nome).toLowerCase().includes(search.toLowerCase());
      const matchesSlot = activeSlot === 'ALL' || p.slot === activeSlot;
      const matchesRank = (rankWeights[p.rank] || 0) <= playerWeight;
      return matchesSearch && matchesSlot && matchesRank;
    }).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
  }, [armorPieces, search, activeSlot, status.rank]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] bg-[#010307] flex flex-col animate-in fade-in duration-300">
      <div className="bg-[#030712] border-b border-slate-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-900/20 border border-blue-500/50 rounded flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Shield size={24}/>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">MODULAÇÃO DE ARMADURA</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60">Condições de Uso: Nível Mínimo e Trial de Boss</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-sm text-xs font-black uppercase flex items-center gap-3 transition-all shadow-xl active:scale-95">
          <CheckCircle2 size={18} /> CONFIRMAR
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-80 border-r border-slate-800 p-6 flex flex-col gap-6 bg-black/20 overflow-y-auto no-scrollbar">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              className="w-full bg-slate-900 border border-slate-800 rounded-sm pl-10 pr-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
              placeholder="Identificar peça..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Filtro de Compartimento</h4>
            <button 
              onClick={() => setActiveSlot('ALL')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm border transition-all text-[10px] font-black uppercase tracking-widest ${activeSlot === 'ALL' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
            >
              <Layers size={14} /> TODOS OS SLOTS
            </button>
            {slots.map(s => (
              <button 
                key={s}
                onClick={() => setActiveSlot(s)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm border transition-all text-[10px] font-black uppercase tracking-widest ${activeSlot === s ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
              >
                <div className="w-1 h-1 rounded-full bg-current opacity-40" /> {s}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
             <div className="flex items-center gap-2 mb-2"><ShieldCheck size={12} className="text-emerald-400" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Segurança</span></div>
             <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-tight">O Sistema impede a equipagem de artefatos cujos Guardiões ainda não foram derrotados.</p>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-[#010307]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40"><Loader2 size={48} className="text-blue-500 animate-spin mb-4" /><p className="text-xs font-black uppercase tracking-[0.3em]">Sincronizando Modulação...</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filtered.map(piece => {
                const slotKey = piece.slot.toLowerCase().replace('ç', 'c').replace('é', 'e');
                const isEquipped = status.equipment[slotKey]?.id === piece.id;
                const parentSet = armorSets.find(s => s.id === piece.conjunto_id);
                
                return (
                  <ArmorPieceCard 
                    key={piece.id} 
                    piece={piece} 
                    isEquipped={isEquipped}
                    parentSet={parentSet}
                    playerLevel={status.level}
                    completedTrials={status.completedTrials}
                    onEquip={() => onEquip(piece)}
                    onUnequip={() => onUnequip(slotKey)}
                    onStartTrial={() => onStartTrial(parentSet || piece)}
                  />
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-30">
                  <ShieldAlert size={64} className="text-slate-700 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">Nenhum registro defensivo disponível neste canal</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArmorPieceCard = ({ piece, isEquipped, parentSet, playerLevel, completedTrials, onEquip, onUnequip, onStartTrial }: any) => {
  const theme = getRankTheme(piece.rank);
  const bonusAttr = piece.bonus ? Object.keys(piece.bonus)[0] : 'hp';
  const bonusVal = piece.bonus ? (Object.values(piece.bonus)[0] as any) : 0;
  
  const requiredLevel = parentSet?.nivel_desbloqueio || piece.nivel_desbloqueio || 1;
  const isLevelLocked = playerLevel < requiredLevel;

  const bossId = parentSet?.boss_id || piece.boss_id;
  const needsTrial = Boolean(bossId);
  const isTrialCompleted = (completedTrials || []).includes(parentSet?.id || piece.id);

  const canEquip = !isLevelLocked && (!needsTrial || isTrialCompleted);

  return (
    <div className={`relative group flex flex-col bg-[#030712] border-2 rounded-sm transition-all duration-300 overflow-hidden w-full aspect-[3/4] max-h-[420px] ${isLevelLocked ? 'grayscale border-slate-900' : `${theme.border} hover:scale-[1.02] hover:${theme.glow}`} shadow-2xl`}>
      <div className={`absolute top-4 left-4 z-30 px-3 py-1 bg-black/80 border rounded-sm text-[11px] font-black tracking-widest ${theme.text} ${theme.border} ${theme.drop}`}>RANK {piece.rank}</div>
      <button className="absolute top-4 right-4 z-30 w-8 h-8 bg-black/60 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
        <Heart size={16} />
      </button>

      <div className="relative w-full h-[60%] bg-slate-950 overflow-hidden">
        {piece.img ? (
          <img src={piece.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            <Shield size={80} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-90" />
        
        {/* PROTOCOLO DE PROVA DE MÉRITO (ESTILO BÉLICO PADRONIZADO) */}
        {!isLevelLocked && needsTrial && !isTrialCompleted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/40 backdrop-blur-[1px]">
            <Skull size={48} className="text-rose-500 animate-pulse mb-2" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-black px-2 py-1">Prova de Mérito</span>
            <button onClick={(e) => { e.stopPropagation(); onStartTrial(); }} className="mt-4 px-6 py-2 bg-rose-600 text-white text-[9px] font-black uppercase rounded-sm hover:bg-rose-500 transition-all shadow-lg">ENTRAR NO TRIAL</button>
          </div>
        )}

        {isLevelLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90">
            <LockKeyhole size={40} className="text-slate-600 mb-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nível {requiredLevel} Requerido</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 z-20">
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 mb-2 inline-block">{piece.slot}</span>
          <h4 className={`text-sm font-black text-white uppercase truncate drop-shadow-lg italic ${theme.drop}`}>{piece.nome}</h4>
        </div>
      </div>

      <div className="flex-1 p-4 bg-[#030712] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">MODULAÇÃO STATUS</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-black italic text-xs">
              <Plus size={10} /> {bonusVal} {String(piece.atributo || bonusAttr).toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-sm flex flex-col gap-1">
              <span className="text-[7px] font-black text-slate-700 uppercase">Vantagem</span>
              <span className="text-[8px] font-bold text-emerald-500 truncate uppercase">{piece.vantagem_defensiva || 'NENHUMA'}</span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-2 rounded-sm flex flex-col gap-1">
              <span className="text-[7px] font-black text-slate-700 uppercase">Fraqueza</span>
              <span className="text-[8px] font-bold text-rose-500 truncate uppercase">{piece.fraqueza_defensiva || 'NENHUMA'}</span>
            </div>
          </div>
        </div>

        <button 
          disabled={!canEquip}
          onClick={isEquipped ? onUnequip : onEquip} 
          className={`w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-sm border-2 transition-all text-[10px] font-black uppercase tracking-widest ${isEquipped ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-blue-500/50 hover:text-blue-400'} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isEquipped ? <ShieldCheck size={14} /> : <Shield size={14} />}
          {isEquipped ? 'EQUIPADO' : 'MODULAR PEÇA'}
        </button>
      </div>
    </div>
  );
};
