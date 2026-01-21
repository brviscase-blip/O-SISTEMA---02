
import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, Plus, Edit3, Trash2, X, Save, 
  Search, Database, ShieldAlert, Skull, Eye, 
  MapPin, ImagePlus, Loader2, ChevronDown, 
  Sparkles, Gem, Info, Box, Zap, Lock,
  Sword, Flame, Target, Wand2
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import { ItemRank, ArenaType } from '../types';

const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
const TYPES: ArenaType[] = ['DUNGEON AZUL', 'DUNGEON VERMELHO', 'MASMORRA DE TRIAL'];
const ATRIBUTOS = ['FORÇA', 'AGILIDADE', 'INTELIGÊNCIA', 'VITALIDADE', 'PERCEPÇÃO'];

const getRankTheme = (rank: string) => {
  switch (rank) {
    case 'S': return { text: 'text-rose-500', border: 'border-rose-500/40', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/30' };
    case 'A': return { text: 'text-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/30' };
    case 'B': return { text: 'text-purple-500', border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/30' };
    case 'C': return { text: 'text-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/30' };
    case 'D': return { text: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/30' };
    default: return { text: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-900/40', glow: '' };
  }
};

const getTypeTheme = (type: ArenaType) => {
  switch (type) {
    case 'DUNGEON AZUL': return { icon: <Radar className="text-blue-400" />, color: 'text-blue-400', border: 'border-blue-500/30' };
    case 'DUNGEON VERMELHO': return { icon: <Flame className="text-rose-500" />, color: 'text-rose-500', border: 'border-rose-500/30' };
    case 'MASMORRA DE TRIAL': return { icon: <Target className="text-amber-500" />, color: 'text-amber-500', border: 'border-amber-500/30' };
  }
};

const ArenasNexus: React.FC = () => {
  const [arenas, setArenas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryOptions, setInventoryOptions] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialForm = {
    nome: '',
    rank: 'E' as ItemRank,
    tipo: 'DUNGEON AZUL' as ArenaType,
    atributo_req: 'FORÇA',
    valor_atributo_req: 10,
    level_req: 1,
    drops: [] as string[],
    descricao: '',
    img: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_arenas_v1');
    if (saved) setArenas(JSON.parse(saved));

    const fetchItems = async () => {
      const client = getSupabaseClient();
      const { data } = await client.from('inventario_nexus').select('nome');
      if (data) setInventoryOptions(data.map(i => i.nome));
    };
    fetchItems();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_arenas_v1', JSON.stringify(arenas));
  }, [arenas]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingId) {
      setArenas(prev => prev.map(a => a.id === editingId ? { ...formData, id: a.id } : a));
    } else {
      setArenas(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const deleteArena = (id: string) => {
    if (confirm("COLAPSAR FENDA DIMENSIONAL?")) {
      setArenas(prev => prev.filter(a => a.id !== id));
    }
  };

  const filteredArenas = arenas.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      {/* HEADER TÁTICO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/40 rounded flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
             <Radar size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Nexus de Arenas</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Mapeamento de Instâncias e Fendas Dimensionais</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-sm pl-12 pr-4 py-4 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                placeholder="Rastrear arena..."
              />
           </div>
           <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4 shrink-0">
             <Database className="text-blue-500" size={20} />
             <span className="text-xl font-black text-white italic tabular-nums">{arenas.length}</span>
           </div>
        </div>
      </div>

      {/* GRADE DE ARENAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         <button 
           onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }}
           className="aspect-video bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group"
         >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 group-hover:text-blue-500 group-hover:scale-110 transition-all">
               <Plus size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Abrir Nova Fenda</span>
         </button>

         {filteredArenas.map(arena => {
           const theme = getRankTheme(arena.rank);
           const typeTheme = getTypeTheme(arena.tipo);
           return (
             <div 
               key={arena.id}
               onClick={() => { setFormData(arena); setEditingId(arena.id); setIsModalOpen(true); }}
               className={`group relative aspect-video bg-[#030712] border-2 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl ${theme.border} hover:${theme.glow}`}
             >
                <div className="absolute inset-0 z-0">
                   {arena.img ? (
                     <img src={arena.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-950 flex items-center justify-center opacity-10">
                        <Radar size={100} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className={`px-3 py-1 bg-black/80 border rounded-sm text-[10px] font-black italic tracking-widest ${theme.text} ${theme.border}`}>
                        RANK {arena.rank}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className={`flex items-center gap-1.5 px-2 py-0.5 bg-black/60 rounded-sm border ${typeTheme.border} ${typeTheme.color} text-[7px] font-black uppercase tracking-widest`}>
                            {typeTheme.icon} {arena.tipo}
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); deleteArena(arena.id); }} className="p-1.5 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-400 transition-colors drop-shadow-lg">
                          {arena.nome}
                        </h4>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                              <Lock size={10} className="text-rose-500" /> LVL {arena.level_req}+
                           </div>
                           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                              <Zap size={10} className="text-blue-500" /> {arena.valor_atributo_req} {arena.atributo_req}
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)] translate-y-[-100%] group-hover:animate-[scan_3s_linear_infinite]" />
             </div>
           );
         })}
      </div>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/40">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                   <Radar size={18} className="text-blue-500" /> {editingId ? 'RECALIBRAR FENDA DIMENSIONAL' : 'ABRIR NOVA FENDA'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual & Core Data */}
                    <div className="lg:col-span-4 space-y-6">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual da Instância (.PNG)</label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full aspect-square bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden group ${formData.img ? 'border-emerald-500/50' : 'border-slate-800'}`}
                       >
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                          {formData.img ? (
                            <img src={formData.img} className="w-full h-full object-cover" />
                          ) : (
                            <ImagePlus size={48} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
                          )}
                       </div>
                       <FormGroup label="NOME DA ARENA" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} />
                       <div className="grid grid-cols-2 gap-4">
                          <FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                          <FormGroup label="TIPO" type="select" options={TYPES} value={formData.tipo} onChange={(v:any) => setFormData({...formData, tipo:v})} />
                       </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Requisitos de Entrada */}
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-l-2 border-rose-500 pl-3">Barreiras de Acesso</h4>
                             <FormGroup label="LEVEL REQUERIDO" type="number" value={formData.level_req} onChange={(v:any) => setFormData({...formData, level_req:v})} icon={<Lock size={12}/>} />
                             <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="ATRIBUTO REQ." type="select" options={ATRIBUTOS} value={formData.atributo_req} onChange={(v:any) => setFormData({...formData, atributo_req:v})} icon={<Zap size={12}/>} />
                                <FormGroup label="VALOR REQ." type="number" value={formData.valor_atributo_req} onChange={(v:any) => setFormData({...formData, valor_atributo_req:v})} />
                             </div>
                          </div>

                          {/* Drops e Descrição */}
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Espólios Detectados</h4>
                             <MultiSelect label="POSSÍVEIS DROPS" options={inventoryOptions} selected={formData.drops} onChange={(val) => setFormData({...formData, drops: val})} icon={<Box size={12}/>} />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Sparkles size={12} className="text-blue-500" /> Relatório de Reconhecimento</label>
                          <textarea 
                            value={formData.descricao}
                            onChange={e => setFormData({...formData, descricao: e.target.value})}
                            placeholder="Descreva as anomalias desta fenda..."
                            className="w-full bg-slate-950 border border-slate-800 p-5 text-[11px] text-slate-300 font-bold outline-none focus:border-blue-500 min-h-[120px] resize-none custom-scrollbar leading-relaxed italic uppercase"
                          />
                       </div>

                       <div className="bg-blue-950/10 border border-blue-900/30 p-6 rounded-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase italic leading-relaxed">
                            <Info size={12} className="inline mr-2 text-blue-500" />
                            Arenas de <span className="text-amber-500">Masmorra de Trial</span> requerem uma arma específica vinculada para serem acessadas.
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>
                    <button type="submit" className="px-16 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-xl active:scale-95 flex items-center gap-3">
                       <Save size={18} /> {editingId ? 'RECALIBRAR FENDA' : 'ESTABILIZAR ARENA'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(300px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, icon, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">{icon} {label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : (
      <input 
        type={type === 'number' ? 'number' : 'text'} 
        value={value} 
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} 
        placeholder={placeholder} 
        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 font-black transition-all h-12 italic rounded-sm placeholder:text-slate-900 uppercase shadow-inner" 
      />
    )}
  </div>
);

const MultiSelect = ({ label, icon, options, selected, onChange }: any) => {
  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((i: string) => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">{icon} {label}</label>
      <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start group hover:border-slate-700 transition-all">
         {options.length === 0 ? (
           <p className="text-[8px] font-bold text-slate-800 uppercase italic w-full text-center py-8">Nenhum espólio detectado no Nexus</p>
         ) : options.map((opt: string) => (
           <button
             key={opt}
             type="button"
             onClick={() => toggleItem(opt)}
             className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase transition-all border ${
               selected.includes(opt) 
                 ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' 
                 : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
             }`}
           >
             {opt}
           </button>
         ))}
      </div>
    </div>
  );
};

export default ArenasNexus;
