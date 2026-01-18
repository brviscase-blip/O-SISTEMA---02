
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sword, X, Skull, Loader2, Search, CheckCircle2, 
  Eye, LockKeyhole, ShieldCheck, Dumbbell, Zap, Brain, Target,
  Activity, Sparkles, ScrollText, Fingerprint, ShieldPlus
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

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
    default: return <Target size={size} />;
  }
};

const rankWeights: Record<string, number> = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6 };

export const WeaponArsenalModal = ({ isOpen, onClose, status, equipped, setEquipped, onShowDetail, onStartTrial }: any) => {
  const [search, setSearch] = useState('');
  const [weapons, setWeapons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetch = async () => {
        const client = getSupabaseClient();
        setIsLoading(true);
        const { data } = await client.from('armas').select('*');
        if (data) setWeapons(data);
        setIsLoading(false);
      };
      fetch();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const playerWeight = rankWeights[status.rank] || 0;
    return weapons.filter(w => 
      String(w.nome).toLowerCase().includes(search.toLowerCase()) && 
      (rankWeights[w.rank] || 0) <= playerWeight
    ).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
  }, [weapons, search, status.rank]);

  const handleEquip = (w: any, slot: 'primary' | 'secondary') => {
    if (status.level < (w.nivel_desbloqueio || 1)) return;
    if (w.boss_id && !status.completedTrials.includes(w.id)) return;
    
    setEquipped((prev: any) => {
      if (prev[slot]?.id === w.id) return { ...prev, [slot]: null };
      const other = slot === 'primary' ? 'secondary' : 'primary';
      if (prev[other]?.id === w.id) return { ...prev, [other]: null, [slot]: w };
      return { ...prev, [slot]: w };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] bg-[#010307] flex flex-col animate-in fade-in duration-300">
      <div className="bg-[#030712] border-b border-slate-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-rose-900/20 border border-rose-500/50 rounded flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <Sword size={24}/>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">ARSENAL DE ATAQUE</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60">Sincronização de Poder Bélico em Tempo Real</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-rose-600 hover:bg-rose-500 text-white px-12 py-4 rounded-sm text-xs font-black uppercase flex items-center gap-3 transition-all shadow-xl active:scale-95">
          <CheckCircle2 size={18} /> CONFIRMAR
        </button>
      </div>
      
      <div className="flex-1 flex min-h-0">
        <div className="w-80 border-r border-slate-800 p-6 flex flex-col gap-6 bg-black/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input className="w-full bg-slate-900 border border-slate-800 rounded-sm pl-10 pr-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-700" placeholder="Identificar arma..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
             <div className="flex items-center gap-2 mb-2"><ShieldPlus size={12} className="text-blue-400" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Autoridade de Patente</span></div>
             <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-tight">Exibindo armamentos compatíveis com <span className={getRankTheme(status.rank).text}>{status.rank}</span>.</p>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-[#010307]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40"><Loader2 size={48} className="text-rose-500 animate-spin mb-4" /><p className="text-xs font-black uppercase tracking-[0.3em]">Sincronizando Arsenal...</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filtered.map(w => (
                <WeaponCard 
                  key={w.id} weapon={w} playerLevel={status.level} completedTrials={status.completedTrials} 
                  isPrimary={equipped.primary?.id === w.id} isSecondary={equipped.secondary?.id === w.id}
                  onEquipPrimary={() => handleEquip(w, 'primary')} onEquipSecondary={() => handleEquip(w, 'secondary')}
                  onShowDetail={() => onShowDetail(w)} onStartTrial={() => onStartTrial(w)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WeaponCard = ({ weapon, playerLevel, completedTrials, isPrimary, isSecondary, onEquipPrimary, onEquipSecondary, onShowDetail, onStartTrial }: any) => {
  const isLevelLocked = playerLevel < (weapon.nivel_desbloqueio || 1);
  const needsTrial = Boolean(weapon.boss_id);
  const isTrialCompleted = (completedTrials || []).includes(weapon.id);
  const canEquip = !isLevelLocked && (isTrialCompleted || !needsTrial);
  const theme = getRankTheme(weapon.rank);

  return (
    <div className={`relative group flex flex-col bg-[#030712] border-2 rounded-sm transition-all duration-300 overflow-hidden w-full aspect-[3/4] max-h-[420px] ${isLevelLocked ? 'grayscale opacity-60 border-slate-900' : `${theme.border} hover:scale-[1.02] hover:${theme.glow}`} shadow-2xl`}>
      <div className={`absolute top-4 left-4 z-30 px-3 py-1 bg-black/80 border rounded-sm text-[11px] font-black tracking-widest ${theme.text} ${theme.border} ${theme.drop}`}>RANK {weapon.rank}</div>
      <div className="absolute top-4 right-4 z-30 w-8 h-8 bg-black/60 border border-slate-800 rounded-full flex items-center justify-center text-white/80">{getAttributeIcon(weapon.atributo_principal, 16)}</div>

      <div className="relative w-full h-[65%] bg-slate-950 overflow-hidden">
        {weapon.img ? <img src={weapon.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><Sword size={80} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-90" />
        
        {needsTrial && !isTrialCompleted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/40 backdrop-blur-[1px]">
            <Skull size={48} className="text-rose-500 animate-pulse mb-2" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-black px-2 py-1">Prova de Mérito</span>
            <button onClick={(e) => { e.stopPropagation(); onStartTrial(); }} className="mt-4 px-6 py-2 bg-rose-600 text-white text-[9px] font-black uppercase rounded-sm hover:bg-rose-500 transition-all">ENTRAR NO TRIAL</button>
          </div>
        )}

        {isLevelLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
            <LockKeyhole size={40} className="text-slate-600 mb-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nível {weapon.nivel_desbloqueio}</span>
          </div>
        )}

        {!isLevelLocked && (
          <button onClick={(e) => { e.stopPropagation(); onShowDetail(); }} className="absolute bottom-4 right-4 z-30 p-2.5 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg hover:bg-blue-500">
            <Eye size={18} />
          </button>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 z-20">
          <h4 className={`text-sm font-black text-white uppercase truncate drop-shadow-lg italic ${theme.drop}`}>{weapon.nome}</h4>
          <span className="text-[8px] font-black text-slate-500 uppercase mt-1">{weapon.material_upgrade}</span>
        </div>
      </div>

      <div className="flex-1 p-4 bg-[#030712] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">PODER BÉLICO</span>
            <span className="text-lg font-black text-white italic tabular-nums leading-none mt-1">{weapon.dano_base} <span className="text-[9px] text-rose-500 font-bold">ATK</span></span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-600 uppercase">TIPO</span>
            <span className="text-[10px] font-black text-blue-400 block mt-1 uppercase italic">Artefato {weapon.rank}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button disabled={!canEquip} onClick={onEquipPrimary} className={`flex items-center justify-center gap-2 py-3 rounded-sm border-2 transition-all text-[10px] font-black uppercase tracking-widest ${isPrimary ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-rose-500/50 hover:text-rose-500'}`}>
            {isPrimary ? <ShieldCheck size={14} /> : '1'} {isPrimary ? 'EQUIPADO' : 'SLOT 1'}
          </button>
          <button disabled={!canEquip} onClick={onEquipSecondary} className={`flex items-center justify-center gap-2 py-3 rounded-sm border-2 transition-all text-[10px] font-black uppercase tracking-widest ${isSecondary ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-amber-500/50 hover:text-amber-500'}`}>
            {isSecondary ? <ShieldCheck size={14} /> : '2'} {isSecondary ? 'EQUIPADO' : 'SLOT 2'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const WeaponDetailModal = ({ weapon, onClose }: any) => {
  const theme = getRankTheme(weapon.rank);
  return (
    <div className="fixed inset-0 z-[7000] bg-[#010307]/95 flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden font-sans">
      <div className="relative z-30 p-8 px-12 flex items-center justify-between border-b border-slate-800 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className={`px-5 py-1.5 border-2 text-[14px] font-black tracking-[0.4em] bg-black/80 rounded-sm ${theme.text} ${theme.border}`}>RANK {weapon.rank}</div>
          <div className="flex flex-col">
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{weapon.nome}</h2>
            <div className="flex items-center gap-4 mt-2 text-[9px] font-black text-slate-500 uppercase tracking-widest"><Fingerprint size={12} className="text-blue-500" /> Assinatura Biométrica Identificada <span className="text-slate-700">|</span> #{String(weapon.id).substring(0,8)}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-4 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-sm"><X size={32} /></button>
      </div>
      <div className="relative z-20 flex-1 flex p-12 gap-12 overflow-hidden">
        <div className="w-[420px] flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-sm flex flex-col">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Activity size={16} /> PERFORMANCE</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 border border-slate-800/50 rounded-sm text-center">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">DANO BASE</p>
                  <span className="text-2xl font-black text-white italic tabular-nums">{weapon.dano_base} ATK</span>
                </div>
                <div className="bg-blue-600/5 p-4 border border-blue-500/20 rounded-sm text-center">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">ATRIBUTO</p>
                  <span className="text-xl font-black text-white italic uppercase">{weapon.atributo_principal}</span>
                </div>
              </div>
              <div className="bg-purple-900/10 border border-purple-500/30 p-5 rounded-sm">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles size={12}/> EFEITO PASSIVO</p>
                <h4 className="text-sm font-black text-white uppercase mb-1">{weapon.efeito_especial || 'NENHUM'}</h4>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">{weapon.desc_efeito || 'Sem propriedades místicas.'}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-sm">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><ScrollText size={16} /> HISTÓRIA</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">{weapon.historia || 'Memória não recuperada.'}</p>
          </div>
        </div>
        <div className="flex-1 bg-black/40 border border-slate-800 rounded-sm relative overflow-hidden flex items-center justify-center p-12">
          {weapon.img ? <img src={weapon.img} className="max-w-full max-h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,1)] relative z-10" alt="" /> : <Sword size={200} className="text-slate-900" />}
        </div>
      </div>
    </div>
  );
};
