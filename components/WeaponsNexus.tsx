
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sword, Trash2, Save, Loader2, Plus, Edit3, 
  Zap, Dumbbell, Brain, Target, ArrowUpCircle,
  Upload, CheckCircle2, ImagePlus, ChevronDown, 
  X, Search, Database, Flame, Sparkles, ScrollText,
  Activity, Gem, Info
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

const ATRIBUTOS = ['FORÇA', 'AGILIDADE', 'INTELIGÊNCIA', 'VITALIDADE', 'PERCEPÇÃO'];
const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];

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

const WeaponsNexus: React.FC = () => {
  const [weapons, setWeapons] = useState<any[]>([]);
  const [refineMaterials, setRefineMaterials] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialForm = {
    nome: '',
    rank: 'E',
    atributo_vantagem: 'FORÇA',
    qtd_atributo_vantagem: 0,
    dano_inicial: 10,
    level_maximo: 20,
    material_refino: 'NENHUM / MANUAL',
    efeito_nome: '',
    efeito_descricao: '',
    historia: '',
    img: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const client = getSupabaseClient();
    setIsLoading(true);
    try {
      // 1. Buscar Armas
      const { data: weaponsData } = await client.from('armas').select('*').order('created_at', { ascending: false });
      setWeapons(weaponsData || []);

      // 2. Buscar Materiais de Refino do Inventário
      const { data: materialsData } = await client
        .from('inventario_nexus')
        .select('nome')
        .eq('categoria', 'MATERIAL DE REFINO')
        .order('nome', { ascending: true });
      
      if (materialsData) {
        setRefineMaterials(materialsData.map(m => m.nome));
      }

    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!formData.nome.trim()) return;
    
    setIsSaving(true);
    try {
      if (editingId) {
        await client.from('armas').update(formData).eq('id', editingId);
      } else {
        await client.from('armas').insert([formData]);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchData();
    } catch (err) { alert('Falha na sincronização bélica.'); }
    finally { setIsSaving(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const deleteWeapon = async (id: string) => {
    if (!confirm("EXPURGAR REGISTRO DO ARSENAL?")) return;
    const client = getSupabaseClient();
    await client.from('armas').delete().eq('id', id);
    fetchData();
  };

  const filtered = weapons.filter(w => w.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      {/* HEADER TÉCNICO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-600/10 border border-rose-500/40 rounded flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
             <Sword size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Arsenal_Core</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Gestão de Artefatos de Destruição em Massa</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-sm pl-12 pr-4 py-4 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                placeholder="Localizar armamento..."
              />
           </div>
           <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4 shrink-0">
             <Database className="text-rose-500" size={20} />
             <span className="text-xl font-black text-white italic tabular-nums">{weapons.length}</span>
           </div>
        </div>
      </div>

      {/* GRADE DE ARMAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
         <button 
           onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }}
           className="aspect-[3/4] bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-rose-500/50 hover:bg-rose-600/5 transition-all group"
         >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 group-hover:text-rose-500 group-hover:scale-110 transition-all">
               <Plus size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Forjar Novo Artefato</span>
         </button>

         {filtered.map(w => {
           const theme = getRankTheme(w.rank);
           return (
             <div 
               key={w.id}
               onClick={() => { setFormData(w); setEditingId(w.id); setIsModalOpen(true); }}
               className={`group relative aspect-[3/4] bg-[#030712] border-2 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl ${theme.border} hover:${theme.glow}`}
             >
                <div className="absolute inset-0 z-0">
                   {w.img ? (
                     <img src={w.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-950 flex items-center justify-center opacity-10">
                        <Sword size={100} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className={`px-3 py-1 bg-black/80 border rounded-sm text-[10px] font-black italic tracking-widest ${theme.text} ${theme.border}`}>
                        RANK {w.rank}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteWeapon(w.id); }} className="p-1.5 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                   </div>

                   <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-rose-400 transition-colors drop-shadow-lg">
                          {w.nome}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                           <Flame size={10} className="text-rose-500" />
                           <span className="text-[10px] font-black text-white tabular-nums italic">{w.dano_inicial} <span className="text-[7px] text-slate-500 not-italic uppercase">Base Dmg</span></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                         <div className="flex flex-col">
                            <span className="text-[6px] font-black text-slate-600 uppercase">Capacidade</span>
                            <span className="text-[8px] font-bold text-blue-400 uppercase italic">Lvl Max: {w.level_maximo}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[6px] font-black text-slate-600 uppercase">Refino</span>
                            <span className="text-[8px] font-bold text-amber-500 truncate w-full text-right uppercase italic">{w.material_refino || 'Não Refinável'}</span>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-px bg-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.4)] translate-y-[-100%] group-hover:animate-[scan_3s_linear_infinite]" />
             </div>
           );
         })}
      </div>

      {/* MODAL DE FORJA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/40">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                   <Flame size={18} className="text-rose-500" /> {editingId ? 'RECALIBRAR MATRIZ BÉLICA' : 'FORJAR NOVO ARTEFATO'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual & Identity */}
                    <div className="lg:col-span-4 space-y-6">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Assinatura Visual (.PNG)</label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full aspect-square bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-rose-500/50 transition-all relative overflow-hidden group ${formData.img ? 'border-emerald-500/50' : 'border-slate-800'}`}
                       >
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                          {formData.img ? (
                            <img src={formData.img} className="w-full h-full object-contain p-6" />
                          ) : (
                            <ImagePlus size={48} className="text-slate-800 group-hover:text-rose-500 transition-colors" />
                          )}
                       </div>
                       <FormGroup label="NOME DA ARMA" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Adaga de Kasaka" />
                       <FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                    </div>

                    {/* Technical Specs */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Coluna Atributos */}
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Sinergia e Evolução</h4>
                             <FormGroup label="ATRIBUTO DE VANTAGEM" type="select" options={ATRIBUTOS} value={formData.atributo_vantagem} onChange={(v:any) => setFormData({...formData, atributo_vantagem:v})} icon={<Zap size={12}/>} />
                             <FormGroup label="BÔNUS DE ATRIBUTO (QTY)" type="number" value={formData.qtd_atributo_vantagem} onChange={(v:any) => setFormData({...formData, qtd_atributo_vantagem:v})} icon={<Plus size={12} className="text-blue-500"/>} />
                             <FormGroup label="LEVEL MÁXIMO EVOLUÇÃO" type="number" value={formData.level_maximo} onChange={(v:any) => setFormData({...formData, level_maximo:v})} icon={<ArrowUpCircle size={12} className="text-emerald-500"/>} />
                          </div>

                          {/* Coluna Combate */}
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-l-2 border-rose-500 pl-3">Matriz de Dano</h4>
                             <FormGroup label="DANO INICIAL (BASE)" type="number" value={formData.dano_inicial} onChange={(v:any) => setFormData({...formData, dano_inicial:v})} icon={<Activity size={12} className="text-rose-500"/>} />
                             
                             <FormGroup 
                                label="MATERIAL DE REFINO" 
                                type="select"
                                options={['NENHUM / MANUAL', ...refineMaterials]}
                                value={formData.material_refino} 
                                onChange={(v:any) => setFormData({...formData, material_refino:v})} 
                                icon={<Gem size={12} className="text-amber-500"/>} 
                             />
                             
                             <div className="space-y-4 pt-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Sparkles size={12} className="text-purple-500" /> Efeito Ativo</label>
                                <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-sm">
                                   <input 
                                     placeholder="Nome do Efeito (Ex: Paralisia)" 
                                     value={formData.efeito_nome}
                                     onChange={e => setFormData({...formData, efeito_nome: e.target.value})}
                                     className="w-full bg-transparent border-b border-slate-800 text-[11px] font-black text-white uppercase italic outline-none focus:border-purple-500 py-1"
                                   />
                                   <textarea 
                                     placeholder="Descrição do efeito..." 
                                     value={formData.efeito_descricao}
                                     onChange={e => setFormData({...formData, efeito_descricao: e.target.value})}
                                     className="w-full bg-transparent text-[10px] text-slate-400 font-bold outline-none h-16 resize-none custom-scrollbar italic"
                                   />
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><ScrollText size={12} className="text-blue-500" /> Memórias do Artefato (História)</label>
                          <textarea 
                            value={formData.historia}
                            onChange={e => setFormData({...formData, historia: e.target.value})}
                            placeholder="A origem e os portadores anteriores..."
                            className="w-full bg-slate-950 border border-slate-800 p-5 text-[11px] text-slate-300 font-bold outline-none focus:border-blue-500 min-h-[120px] resize-none custom-scrollbar leading-relaxed italic"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="px-16 py-4 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-xl active:scale-95 flex items-center gap-3">
                       {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                       {editingId ? 'ATUALIZAR ARTEFATO' : 'CONCLUIR FORJA'}
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
          100% { transform: translateY(400px); opacity: 0; }
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
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-rose-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-rose-400 transition-colors" />
      </div>
    ) : (
      <input 
        type={type === 'number' ? 'number' : 'text'} 
        value={value} 
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} 
        placeholder={placeholder} 
        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-rose-500 font-black transition-all h-12 italic rounded-sm placeholder:text-slate-900 uppercase shadow-inner" 
      />
    )}
  </div>
);

export default WeaponsNexus;
