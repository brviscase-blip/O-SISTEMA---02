
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPinned, Plus, Edit3, Trash2, X, Save, 
  Search, Database, Mountain, Skull, Eye, 
  FlaskConical, Crown, Box, Shield, Sword, 
  Ghost, ImagePlus, Loader2, ChevronDown, 
  Sparkles, Gem, Info, ExternalLink
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];

const getRankTheme = (rank: string) => {
  switch (rank) {
    case 'S': return { text: 'text-rose-500', border: 'border-rose-500/40', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20' };
    case 'A': return { text: 'text-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' };
    case 'B': return { text: 'text-purple-500', border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' };
    case 'C': return { text: 'text-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' };
    case 'D': return { text: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' };
    default: return { text: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-900/40', glow: '' };
  }
};

const TerritoriesNexus: React.FC = () => {
  const [territories, setTerritories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Opções vinculadas de outros Nexos
  const [options, setOptions] = useState({
    consumables: [] as string[],
    relics: [] as string[],
    materials: [] as string[],
    armors: [] as string[],
    weapons: [] as string[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialForm = {
    nome: '', rank: 'E', consumiveis: [] as string[], reliquias: [] as string[],
    materiais: [] as string[], armaduras: [] as string[], arsenal: [] as string[],
    inimigo_comum: '', boss: '', img: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. Carregar dados locais e buscar opções vinculadas do Supabase
  useEffect(() => {
    // Carregar territórios do LocalStorage
    const saved = localStorage.getItem('nexus_territories_v2');
    if (saved) setTerritories(JSON.parse(saved));

    // Buscar dados para os selects vinculados
    const fetchLinkedOptions = async () => {
      const client = getSupabaseClient();
      
      // Busca Inventário
      const { data: inv } = await client.from('inventario_nexus').select('nome, categoria');
      if (inv) {
        setOptions(prev => ({
          ...prev,
          consumables: inv.filter(i => i.categoria === 'CONSUMÍVEL').map(i => i.nome),
          relics: inv.filter(i => i.categoria === 'RELÍQUIA').map(i => i.nome),
          materials: inv.filter(i => i.categoria === 'MATERIAL DE REFINO').map(i => i.nome)
        }));
      }

      // Busca Armaduras
      const { data: armors } = await client.from('armaduras').select('nome');
      if (armors) setOptions(prev => ({ ...prev, armors: armors.map(a => a.nome) }));

      // Busca Arsenal
      const { data: weapons } = await client.from('armas').select('nome');
      if (weapons) setOptions(prev => ({ ...prev, weapons: weapons.map(w => w.nome) }));
    };

    fetchLinkedOptions();
  }, []);

  // 2. Salvar localmente
  useEffect(() => {
    localStorage.setItem('nexus_territories_v2', JSON.stringify(territories));
  }, [territories]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingId) {
      setTerritories(prev => prev.map(t => t.id === editingId ? { ...formData, id: t.id } : t));
    } else {
      setTerritories(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const startEdit = (t: any) => {
    setFormData(t);
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const deleteTerritory = (id: string) => {
    if (confirm("EXPURGAR REGISTRO DE TERRITÓRIO?")) {
      setTerritories(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const filteredTerritories = territories.filter(t => 
    t.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/40 rounded flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
             <MapPinned size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Explorador de Territórios</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Mapeamento de Drops e Ameaças Regionais</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-sm pl-12 pr-4 py-4 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                placeholder="Localizar setor..."
              />
           </div>
           <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4 shrink-0">
             <Database className="text-blue-500" size={20} />
             <span className="text-xl font-black text-white italic tabular-nums">{territories.length}</span>
           </div>
        </div>
      </div>

      {/* GRADE DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         <button 
           onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }}
           className="aspect-video bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group"
         >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 group-hover:text-blue-500 group-hover:scale-110 transition-all">
               <Plus size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Registrar Nova Fenda</span>
         </button>

         {filteredTerritories.map(t => {
           const theme = getRankTheme(t.rank);
           return (
             <div 
               key={t.id}
               onClick={() => startEdit(t)}
               className={`group relative aspect-video bg-[#030712] border-2 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl ${theme.border} hover:${theme.glow}`}
             >
                <div className="absolute inset-0 z-0">
                   {t.img ? (
                     <img src={t.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-950 flex items-center justify-center opacity-10">
                        <Mountain size={80} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className={`px-4 py-1.5 bg-black/80 border-2 rounded-sm text-sm font-black italic tracking-widest ${theme.text} ${theme.border}`}>
                        RANK {t.rank}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteTerritory(t.id); }} className="p-2 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                   </div>

                   <div>
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-400 transition-colors drop-shadow-lg">
                        {t.nome}
                      </h4>
                      <div className="flex items-center gap-3 mt-3">
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest">
                            <Skull size={10} /> {t.boss || 'Sem Boss'}
                         </div>
                      </div>
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)] translate-y-[-100%] group-hover:animate-[scan_3s_linear_infinite]" />
             </div>
           );
         })}
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/40">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                   <MapPinned size={18} className="text-blue-500" /> {editingId ? 'RECALIBRAR MATRIZ TERRITORIAL' : 'REGISTRAR NOVA COORDENADA'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual & Core */}
                    <div className="lg:col-span-4 space-y-6">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">MAPA VISUAL (.PNG)</label>
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
                       <FormGroup label="TERRITÓRIO" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} />
                       <FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                    </div>

                    {/* Espólios & Ameaças */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <LinkedMultiSelect label="CONSUMÍVEIS" icon={<FlaskConical size={12}/>} options={options.consumables} selected={formData.consumiveis} onChange={(val) => setFormData({...formData, consumiveis: val})} />
                          <LinkedMultiSelect label="RELÍQUIAS" icon={<Crown size={12}/>} options={options.relics} selected={formData.reliquias} onChange={(val) => setFormData({...formData, reliquias: val})} />
                          <LinkedMultiSelect label="MATERIAL DE REFINO" icon={<Gem size={12}/>} options={options.materials} selected={formData.materiais} onChange={(val) => setFormData({...formData, materiais: val})} />
                          <LinkedMultiSelect label="ARMADURAS" icon={<Shield size={12}/>} options={options.armors} selected={formData.armaduras} onChange={(val) => setFormData({...formData, armaduras: val})} />
                          <LinkedMultiSelect label="ARSENAL" icon={<Sword size={12}/>} options={options.weapons} selected={formData.arsenal} onChange={(val) => setFormData({...formData, arsenal: val})} />
                          <FormGroup label="INIMIGO COMUM" value={formData.inimigo_comum} onChange={(v:any) => setFormData({...formData, inimigo_comum: v})} icon={<Ghost size={12}/>} />
                          <FormGroup label="BOSS DA REGIAO" value={formData.boss} onChange={(v:any) => setFormData({...formData, boss: v})} icon={<Skull size={12}/>} />
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>
                    <button type="submit" className="px-16 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-xl active:scale-95 flex items-center gap-3">
                       <Save size={18} /> {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
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
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 font-black transition-all h-12 italic rounded-sm placeholder:text-slate-900 uppercase shadow-inner" />
    )}
  </div>
);

const LinkedMultiSelect = ({ label, icon, options, selected, onChange }: any) => {
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
           <p className="text-[8px] font-bold text-slate-800 uppercase italic w-full text-center py-8">Nenhum item detectado no Nexus</p>
         ) : options.map((opt: string) => (
           <button
             key={opt}
             type="button"
             onClick={() => toggleItem(opt)}
             className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase transition-all border ${
               selected.includes(opt) 
                 ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                 : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
             }`}
           >
             {opt}
           </button>
         ))}
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[8px] font-bold text-slate-600 uppercase">Vínculos Ativos: {selected.length}</span>
        <button type="button" onClick={() => onChange([])} className="text-[8px] font-black text-rose-500 hover:text-rose-400 uppercase">Limpar Tudo</button>
      </div>
    </div>
  );
};

export default TerritoriesNexus;
