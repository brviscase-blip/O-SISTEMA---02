
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, X, Search, Loader2, FlaskConical, Crown, 
  Box, Info, Coins, Zap, ShieldCheck, Filter,
  Fingerprint, Sparkles, Activity, LockKeyhole,
  ChevronRight, Trash2, LayoutGrid, CheckCircle2,
  MapPin, Percent, Play
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import { PlayerStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'Geral' | 'Relíquias' | 'Consumíveis';
  playerStatus: PlayerStatus;
  setPlayerStatus: React.Dispatch<React.SetStateAction<PlayerStatus>>;
  addNotification: (msg: string, type: any) => void;
}

const getTheme = (type: string) => {
  switch (type) {
    case 'Relíquias': return { 
      color: 'text-amber-500', 
      bg: 'bg-amber-600', 
      bgSoft: 'bg-amber-950/10', 
      border: 'border-amber-500/50', 
      glow: 'shadow-amber-500/20', 
      icon: <Crown size={20} />,
      btn: 'bg-amber-600 hover:bg-amber-500'
    };
    case 'Consumíveis': return { 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-600', 
      bgSoft: 'bg-emerald-950/10', 
      border: 'border-emerald-500/50', 
      glow: 'shadow-emerald-500/20', 
      icon: <FlaskConical size={20} />,
      btn: 'bg-emerald-600 hover:bg-emerald-500'
    };
    default: return { 
      color: 'text-blue-500', 
      bg: 'bg-blue-600', 
      bgSoft: 'bg-blue-950/10', 
      border: 'border-blue-500/50', 
      glow: 'shadow-blue-500/20', 
      icon: <Package size={20} />,
      btn: 'bg-blue-600 hover:bg-blue-500'
    };
  }
};

const InventoryBrowserModal: React.FC<Props> = ({ isOpen, onClose, type, playerStatus, setPlayerStatus, addNotification }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CONSUMÍVEL' | 'RELÍQUIA' | 'MATERIAL DE REFINO'>('ALL');
  
  const theme = getTheme(type);

  useEffect(() => {
    if (isOpen) {
      const fetch = async () => {
        const client = getSupabaseClient();
        setIsLoading(true);
        const { data } = await client
          .from('inventario_nexus')
          .select('*')
          .eq('inventario_destino', type);
        if (data) setItems(data);
        setIsLoading(false);
      };
      fetch();
    }
  }, [isOpen, type]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = String(i.nome).toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'ALL' || i.categoria === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [items, search, activeCategory]);

  const handleUseItem = (item: any) => {
    const desc = (item.efeito || '').toLowerCase();
    
    // --- MOTOR DE CONSUMÍVEIS (LÓGICA REAL) ---
    if (desc.includes("+30% poder vital")) {
        const heal = Math.floor(playerStatus.maxHp * 0.3);
        setPlayerStatus(ps => ({ ...ps, hp: Math.min(ps.maxHp, ps.hp + heal) }));
        addNotification(`[SISTEMA] VITALIDADE RESTAURADA: +${heal} HP`, 'success');
    } 
    else if (desc.includes("+50% energia dimensional")) {
        const mana = Math.floor(playerStatus.maxMp * 0.5);
        setPlayerStatus(ps => ({ ...ps, mp: Math.min(ps.maxMp, ps.mp + mana) }));
        addNotification(`[SISTEMA] ENERGIA DIMENSIONAL CARREGADA: +${mana} MP`, 'success');
    }
    else if (desc.includes("remove penalidades de fadiga")) {
        addNotification(`[SISTEMA] DESINTOXICAÇÃO COMPLETA: Penalidades de Fadiga Removidas.`, 'success');
    }
    else if (desc.includes("+5 vitalidade real")) {
        setPlayerStatus(ps => ({ ...ps, maxHp: ps.maxHp + 50, stats: { ...ps.stats, vitality: ps.stats.vitality + 5 } }));
        addNotification("[SISTEMA: DNA RECALIBRADO] +5 Vitalidade Real Permanente.", "success");
    } else if (desc.includes("encerra sincronia")) {
        addNotification("[SISTEMA: PORTAL DE RETORNO ATIVADO] Sincronia pode ser encerrada sem perdas.", "info");
    } else {
        addNotification(`[SISTEMA] Ativo sincronizado: ${item.nome}`, 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[7000] bg-[#010307] flex flex-col animate-in fade-in duration-300">
      <div className="bg-[#030712] border-b border-slate-800 p-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className={`w-12 h-12 ${theme.bgSoft} border ${theme.border} rounded flex items-center justify-center ${theme.color} shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
            {theme.icon}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
              SISTEMA DE INVENTÁRIO: {type.toUpperCase()}
            </h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 opacity-60 italic">
              Gerenciamento de Ativos e Suporte Dimensional Ativo
            </p>
          </div>
        </div>
        <button onClick={onClose} className={`${theme.btn} text-white px-12 py-4 rounded-sm text-xs font-black uppercase flex items-center gap-3 transition-all shadow-xl active:scale-95`}>
          <CheckCircle2 size={18} /> CONFIRMAR
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-80 border-r border-slate-800 p-6 flex flex-col gap-6 bg-black/20 overflow-y-auto no-scrollbar">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              className={`w-full bg-slate-900 border border-slate-800 rounded-sm pl-10 pr-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700`} 
              placeholder="Identificar ativo..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Filtro de Categoria</h4>
            <FilterButton label="TODOS OS ATIVOS" active={activeCategory === 'ALL'} icon={<LayoutGrid size={14} />} onClick={() => setActiveCategory('ALL')} />
            {type === 'Consumíveis' && <FilterButton label="CONSUMÍVEIS" active={activeCategory === 'CONSUMÍVEL'} icon={<FlaskConical size={14} />} onClick={() => setActiveCategory('CONSUMÍVEL')} />}
            {type === 'Relíquias' && <FilterButton label="RELÍQUIAS" active={activeCategory === 'RELÍQUIA'} icon={<Crown size={14} />} onClick={() => setActiveCategory('RELÍQUIA')} />}
            {type === 'Geral' && <FilterButton label="MATERIAIS" active={activeCategory === 'MATERIAL DE REFINO'} icon={<Box size={14} />} onClick={() => setActiveCategory('MATERIAL DE REFINO')} />}
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto no-scrollbar bg-[#010307]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <Loader2 size={48} className={`${theme.color} animate-spin mb-4`} />
              <p className="text-xs font-black uppercase tracking-[0.3em]">Sincronizando Inventário...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filtered.map(item => (
                <ItemPlayerCard key={item.id} item={item} theme={theme} onUse={() => handleUseItem(item)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const FilterButton = ({ label, active, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm border transition-all text-[10px] font-black uppercase tracking-widest ${
      active ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
    }`}
  >
    {icon} {label}
  </button>
);

const ItemPlayerCard = ({ item, theme, onUse }: any) => {
  const getRankTheme = (rank: string) => {
    switch (rank) {
      case 'S': return { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/30' };
      case 'A': return { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/30' };
      case 'B': return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/30' };
      case 'C': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/30' };
      case 'D': return { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/30' };
      default: return { border: 'border-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/10', glow: '' };
    }
  };

  const rank = getRankTheme(item.rank);

  return (
    <div className={`relative group flex flex-col bg-[#030712] border-2 rounded-sm transition-all duration-300 overflow-hidden w-full aspect-[3/4] max-h-[460px] ${rank.border} hover:scale-[1.02] hover:${rank.glow} shadow-2xl`}>
      <div className={`absolute top-4 left-4 z-30 px-3 py-1 bg-black/80 border rounded-sm text-[11px] font-black tracking-widest ${rank.text} ${rank.border}`}>
        RANK {item.rank}
      </div>
      
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1">
         <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 border border-emerald-500/30 rounded-sm text-emerald-400 font-black italic text-[10px]">
            <Percent size={10} /> {item.probabilidade}%
         </div>
      </div>

      <div className="relative w-full h-[55%] bg-slate-950 overflow-hidden">
        {item.img ? (
          <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            {item.categoria === 'CONSUMÍVEL' ? <FlaskConical size={80} /> : item.categoria === 'RELÍQUIA' ? <Crown size={80} /> : <Package size={80} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-90" />
        
        <div className="absolute bottom-0 left-0 w-full p-4 z-20">
          <div className="flex items-center gap-2 mb-2">
             <MapPin size={10} className="text-blue-500" />
             <span className="text-[8px] font-black text-slate-500 uppercase italic truncate">{item.territorio || 'GLOBAL'}</span>
          </div>
          <h4 className={`text-sm font-black text-white uppercase truncate drop-shadow-lg italic`}>{item.nome}</h4>
        </div>
      </div>

      <div className="flex-1 p-4 bg-[#030712] flex flex-col justify-between">
        <div className="space-y-4">
           <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-sm">
              <p className="text-[10px] font-black text-blue-400 uppercase italic tracking-tighter leading-tight line-clamp-2">
                 {item.efeito}
              </p>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={14} className="text-amber-500" />
                <span className="text-sm font-black text-slate-300 tabular-nums italic">{item.valor_venda}</span>
              </div>
           </div>
        </div>

        <button 
           onClick={onUse}
           className={`w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-sm border-2 transition-all text-[10px] font-black uppercase tracking-widest bg-slate-900 border-slate-800 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-600/5 active:scale-95`}
        >
           <Play size={12} fill="currentColor" /> {item.categoria === 'CONSUMÍVEL' ? 'USAR ATIVO' : 'SINCRONIZAR'}
        </button>
      </div>
    </div>
  );
};

export default InventoryBrowserModal;
