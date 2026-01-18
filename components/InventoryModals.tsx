
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, X, Search, Loader2, FlaskConical, Crown, 
  Box, Info, Coins, Zap, ShieldCheck, Filter,
  Fingerprint, Sparkles, Activity, LockKeyhole,
  ChevronRight, Trash2, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'Geral' | 'Relíquias' | 'Consumíveis';
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

const InventoryBrowserModal: React.FC<Props> = ({ isOpen, onClose, type }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CONSUMÍVEL' | 'RELÍQUIA' | 'MATERIAL'>('ALL');
  
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[7000] bg-[#010307] flex flex-col animate-in fade-in duration-300">
      {/* HEADER DINÂMICO */}
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
          {/* Fixed "Cannot find name 'CheckCircle2'" by adding CheckCircle2 to imports */}
          <CheckCircle2 size={18} /> CONFIRMAR
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* SIDEBAR DE FILTROS (ESTILO ARSENAL) */}
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
            {type === 'Geral' && <FilterButton label="MATERIAIS" active={activeCategory === 'MATERIAL'} icon={<Box size={14} />} onClick={() => setActiveCategory('MATERIAL')} />}
          </div>

          <div className="mt-auto p-4 bg-slate-900/50 border border-slate-800 rounded-sm">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={12} className="text-blue-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Uso</span>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-tight">
                Itens consumíveis são destruídos após o uso. Relíquias concedem bônus passivos permanentes.
             </p>
          </div>
        </aside>

        {/* GRID DE ITENS (ESTILO ARSENAL) */}
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar bg-[#010307]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <Loader2 size={48} className={`${theme.color} animate-spin mb-4`} />
              <p className="text-xs font-black uppercase tracking-[0.3em]">Sincronizando Inventário...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filtered.map(item => (
                <ItemPlayerCard key={item.id} item={item} theme={theme} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-30">
                  <Box size={64} className="text-slate-700 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">Nenhum ativo detectado nesta frequência</p>
                </div>
              )}
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

const ItemPlayerCard = ({ item, theme }: any) => {
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
    <div className={`relative group flex flex-col bg-[#030712] border-2 rounded-sm transition-all duration-300 overflow-hidden w-full aspect-[3/4] max-h-[420px] ${rank.border} hover:scale-[1.02] hover:${rank.glow} shadow-2xl`}>
      {/* TAGS DE TOPO */}
      <div className={`absolute top-4 left-4 z-30 px-3 py-1 bg-black/80 border rounded-sm text-[11px] font-black tracking-widest ${rank.text} ${rank.border}`}>
        RANK {item.rank}
      </div>
      <div className="absolute top-4 right-4 z-30 w-8 h-8 bg-black/60 border border-slate-800 rounded-full flex items-center justify-center text-white/80">
        {item.categoria === 'CONSUMÍVEL' ? <FlaskConical size={16} /> : item.categoria === 'RELÍQUIA' ? <Crown size={16} /> : <Box size={16} />}
      </div>

      {/* ÁREA DE IMAGEM (65%) */}
      <div className="relative w-full h-[65%] bg-slate-950 overflow-hidden">
        {item.img ? (
          <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10">
            {item.categoria === 'CONSUMÍVEL' ? <FlaskConical size={80} /> : item.categoria === 'RELÍQUIA' ? <Crown size={80} /> : <Package size={80} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-90" />
        
        {/* INFO SOBREPOSTA NO FUNDO DA IMAGEM */}
        <div className="absolute bottom-0 left-0 w-full p-4 z-20">
          <h4 className={`text-sm font-black text-white uppercase truncate drop-shadow-lg italic`}>{item.nome}</h4>
          <span className="text-[8px] font-black text-slate-500 uppercase mt-1 tracking-widest italic">{item.uso_principal}</span>
        </div>
      </div>

      {/* ÁREA DE STATUS (BASE) */}
      <div className="flex-1 p-4 bg-[#030712] flex flex-col justify-between">
        <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-sm mb-4">
           <div className="flex items-center gap-2 mb-1.5 opacity-60">
              <Zap size={10} className="text-blue-500" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Propriedade de Sistema</span>
           </div>
           <p className="text-[10px] font-black text-blue-400 uppercase italic tracking-tighter leading-tight line-clamp-2">
              {item.efeito || 'Ativo sem propriedades dinâmicas'}
           </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-amber-500" />
            <span className="text-sm font-black text-slate-300 tabular-nums italic">{item.valor_venda}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-600 uppercase">TIPO</span>
            <span className="text-[9px] font-black text-slate-400 block mt-0.5 uppercase italic">{item.categoria}</span>
          </div>
        </div>

        {/* BOTÃO DE AÇÃO PADRONIZADO */}
        <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-sm border-2 transition-all text-[10px] font-black uppercase tracking-widest bg-slate-900 border-slate-800 text-slate-500 hover:border-white/20 hover:text-white hover:bg-slate-800`}>
           {item.categoria === 'CONSUMÍVEL' ? 'USAR ATIVO' : 'SINCRONIZAR'}
        </button>
      </div>
    </div>
  );
};

export default InventoryBrowserModal;
