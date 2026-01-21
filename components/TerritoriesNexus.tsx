
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Trash2, Save, Loader2, Plus, Edit3, 
  Mountain, Skull, Target, Upload, CheckCircle2, 
  ChevronDown, Database, Map as MapIcon, Compass,
  Sword, FlaskConical, Crown, Box, Shield, Ghost, MapPinned,
  Sparkles, Gem, X, Info, ImagePlus, Eye, Search, ExternalLink,
  ShieldAlert, ChevronRight, Flame
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
    case 'E': return { text: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/5', glow: '' };
    default: return { text: 'text-slate-500', border: 'border-slate-800', bg: 'bg-slate-900/40', glow: '' };
  }
};

const TerritoriesNexus: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    nome: '', rank: 'E', consumivel: '-', reliquia: '-', material_refino: '-', 
    armadura: '-', arsenal: '-', inimigo_comum: '-', boss_dungeon: '-', img: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const client = getSupabaseClient();
    setIsLoading(true);
    try {
      const { data } = await client.from('territorios').select('*').order('nome', { ascending: true });
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredItems = useMemo(() => {
    return items.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_map.${file.name.split('.').pop()}`;
      const { error } = await client.storage.from('armas-imgs').upload(`territorios/${fileName}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(`territorios/${fileName}`);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) { alert("Falha no upload do mapa."); }
    finally { setIsUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    const client = getSupabaseClient();
    setIsSaving(true);
    try {
      if (editingId) {
        await client.from('territorios').update(formData).eq('id', editingId);
      } else {
        await client.from('territorios').insert([formData]);
      }
      setFormData(initialForm);
      setEditingId(null);
      fetchData();
      alert("Cartografia de Loot Sincronizada.");
    } catch (err) { alert("Erro ao gravar dados."); }
    finally { setIsSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("EXPURGAR REGISTRO DE SETOR?")) return;
    const client = getSupabaseClient();
    await client.from('territorios').delete().eq('id', id);
    fetchData();
  };

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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Navegação em Fendas Dimensionais Registradas</p>
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
             <span className="text-xl font-black text-white italic tabular-nums">{items.length}</span>
           </div>
        </div>
      </div>

      {/* GRADE DE CARDS (VIEW PRINCIPAL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {/* Botão de Adicionar como Card */}
         <button 
           onClick={() => { setEditingId(null); setFormData(initialForm); window.scrollTo({top:0, behavior:'smooth'}); }}
           className="aspect-[16/10] bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group"
         >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 group-hover:text-blue-500 group-hover:scale-110 transition-all">
               <Plus size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Registrar Nova Fenda</span>
         </button>

         {filteredItems.map(item => {
           const theme = getRankTheme(item.rank);
           return (
             <div 
               key={item.id}
               onClick={() => setSelectedTerritory(item)}
               className={`group relative aspect-[16/10] bg-[#030712] border-2 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl ${theme.border} hover:${theme.glow}`}
             >
                {/* Background Image / Placeholder */}
                <div className="absolute inset-0 z-0">
                   {item.img ? (
                     <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-950 flex items-center justify-center opacity-10">
                        <Mountain size={80} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className={`px-4 py-1.5 bg-black/80 border-2 rounded-sm text-sm font-black italic tracking-widest ${theme.text} ${theme.border}`}>
                        RANK {item.rank}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setFormData({...item}); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-amber-500"><Edit3 size={14}/></button>
                         <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-2 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-rose-500"><Trash2 size={14}/></button>
                      </div>
                   </div>

                   <div>
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-400 transition-colors drop-shadow-lg">
                        {item.nome}
                      </h4>
                      <div className="flex items-center gap-3 mt-3">
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Skull size={10} className="text-rose-500" /> {item.boss_dungeon}
                         </div>
                         <div className="h-3 w-px bg-white/10" />
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                            <Eye size={10} /> Inspecionar Setor
                         </div>
                      </div>
                   </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)] translate-y-[-100%] group-hover:animate-[scan_3s_linear_infinite]" />
             </div>
           );
         })}
      </div>

      {/* FORMULÁRIO DE GESTÃO (OCULTO POR PADRÃO, ABRE NO EDIT/NEW) */}
      {(editingId || formData.nome !== '' || formData.rank !== 'E') && (
        <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden mt-12 animate-in slide-in-from-bottom-10 duration-500">
          <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              <Database size={18} className="text-blue-500" /> {editingId ? 'RECALIBRAR MATRIZ TERRITORIAL' : 'REGISTRAR NOVA COORDENADA'}
            </h3>
            <button onClick={() => {setEditingId(null); setFormData(initialForm);}} className="text-slate-600 hover:text-white"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3 space-y-4">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">MAPA VISUAL (.PNG)</label>
                 <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full aspect-video bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden group ${formData.img ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : formData.img ? <img src={formData.img} className="w-full h-full object-cover" /> : <ImagePlus size={32} className="text-slate-800 group-hover:text-blue-500 transition-colors" />}
                 </div>
              </div>
              <div className="lg:col-span-9 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-10"><FormGroup label="TERRITÓRIO (NOME)" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} /></div>
                  <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 border-t border-slate-800/40 pt-6">
                    <FormGroup label="CONSUMÍVEL" value={formData.consumivel} onChange={(v:any) => setFormData({...formData, consumivel:v})} icon={<FlaskConical size={10}/>} />
                    <FormGroup label="RELÍQUIA" value={formData.reliquia} onChange={(v:any) => setFormData({...formData, reliquia:v})} icon={<Crown size={10}/>} />
                    <FormGroup label="REFINO" value={formData.material_refino} onChange={(v:any) => setFormData({...formData, material_refino:v})} icon={<Gem size={10}/>} />
                    <FormGroup label="ARMADURA" value={formData.armadura} onChange={(v:any) => setFormData({...formData, armadura:v})} icon={<Shield size={10}/>} />
                    <FormGroup label="ARSENAL" value={formData.arsenal} onChange={(v:any) => setFormData({...formData, arsenal:v})} icon={<Sword size={10}/>} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800/40 pt-6">
                    <FormGroup label="MINIONS" value={formData.inimigo_comum} onChange={(v:any) => setFormData({...formData, inimigo_comum:v})} icon={<Ghost size={12}/>} />
                    <FormGroup label="BOSS DA DUNGEON" value={formData.boss_dungeon} onChange={(v:any) => setFormData({...formData, boss_dungeon:v})} icon={<Skull size={12}/>} />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/40">
                   <button type="submit" disabled={isSaving || isUploading} className={`px-12 py-4 ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase tracking-widest rounded-sm flex items-center gap-3 shadow-xl active:scale-95`}>
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                   </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO DETALHADA */}
      {selectedTerritory && (
        <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#030712] border-2 border-slate-800 rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Header do Modal */}
              <div className="p-8 border-b border-slate-800 bg-black/40 flex items-center justify-between relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 text-[120px] font-black italic text-white/[0.02] pointer-events-none">{selectedTerritory.rank}</div>
                 <div className="flex items-center gap-8 relative z-10">
                    <div className={`w-24 h-24 border-4 rounded-sm flex items-center justify-center bg-black/40 ${getRankTheme(selectedTerritory.rank).border} ${getRankTheme(selectedTerritory.rank).glow}`}>
                       {selectedTerritory.img ? <img src={selectedTerritory.img} className="w-full h-full object-cover" /> : <MapIcon size={48} className="text-slate-800" />}
                    </div>
                    <div>
                       <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedTerritory.nome}</h2>
                       <div className="flex items-center gap-6 mt-4">
                          <span className={`text-sm font-black tracking-[0.4em] ${getRankTheme(selectedTerritory.rank).text}`}>RANK {selectedTerritory.rank}</span>
                          <div className="h-4 w-px bg-white/10" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} className="text-blue-500" /> Coordenadas Sincronizadas</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTerritory(null)} className="p-4 bg-slate-900 border border-slate-800 rounded-sm text-slate-500 hover:text-white transition-all hover:border-blue-500 relative z-10">
                    <X size={32} />
                 </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Coluna de Loot */}
                    <div className="lg:col-span-7 space-y-8">
                       <section>
                          <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><Sparkles size={16}/> Matriz de Espólios (Drops)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <LootDetail icon={<FlaskConical size={14} />} label="CONSUMÍVEL" value={selectedTerritory.consumivel} color="text-emerald-500" />
                             <LootDetail icon={<Crown size={14} />} label="RELÍQUIA" value={selectedTerritory.reliquia} color="text-amber-500" />
                             <LootDetail icon={<Gem size={14} />} label="REFINO" value={selectedTerritory.material_refino} color="text-blue-400" />
                          </div>
                       </section>

                       <section className="pt-8 border-t border-slate-800/50">
                          <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><Sword size={16}/> Arsenal & Defesa</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <LootDetail icon={<Shield size={14} />} label="ARMADURA" value={selectedTerritory.armadura} color="text-slate-400" />
                             <LootDetail icon={<Sword size={14} />} label="ARSENAL" value={selectedTerritory.arsenal} color="text-rose-500" />
                          </div>
                       </section>
                    </div>

                    {/* Coluna de Ameaças */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                       <div className="bg-rose-950/10 border border-rose-900/40 p-8 rounded-sm relative overflow-hidden flex-1">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><Flame size={120} className="text-rose-600" /></div>
                          <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><Skull size={18}/> Perigos do Setor</h5>
                          
                          <div className="space-y-6 relative z-10">
                             <div>
                                <span className="text-[8px] font-black text-rose-900 uppercase tracking-widest block mb-2">Inimigo Comum (Minion)</span>
                                <div className="p-4 bg-black/60 border border-rose-900/30 rounded-sm flex items-center gap-4">
                                   <Ghost size={20} className="text-rose-700" />
                                   <span className="text-sm font-black text-white uppercase italic">{selectedTerritory.inimigo_comum}</span>
                                </div>
                             </div>

                             <div>
                                <span className="text-[8px] font-black text-rose-900 uppercase tracking-widest block mb-2">Boss da Dungeon</span>
                                <div className="p-5 bg-rose-600/10 border-2 border-rose-600/50 rounded-sm flex items-center gap-5 shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                                   <div className="w-12 h-12 bg-rose-600 border border-rose-400 rounded-sm flex items-center justify-center text-white shadow-lg">
                                      <Skull size={24} />
                                   </div>
                                   <div>
                                      <span className="text-lg font-black text-white uppercase italic leading-none">{selectedTerritory.boss_dungeon}</span>
                                      <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest mt-1">Guardião da Fenda</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Footer do Modal */}
              <div className="p-6 bg-black/40 border-t border-slate-800 flex justify-center">
                 <button 
                   onClick={() => setSelectedTerritory(null)}
                   className="px-20 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-sm transition-all shadow-xl active:scale-95"
                 >
                   RETORNAR AO MAPA
                 </button>
              </div>
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

const LootDetail = ({ icon, label, value, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-sm flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
     <div className="flex items-center gap-2 opacity-60">
        <span className={color}>{icon}</span>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     </div>
     <span className={`text-[12px] font-black uppercase italic tracking-tight truncate ${value !== '-' ? 'text-white' : 'text-slate-700'}`}>
        {value}
     </span>
  </div>
);

const FormGroup = ({ label, type="text", value, onChange, options, icon, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">{icon} {label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm group-hover:border-slate-700">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value ?? (type === 'number' ? 0 : '')} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-blue-500 font-black transition-all h-12 shadow-inner italic rounded-sm placeholder:text-slate-900 hover:border-slate-700 uppercase" />
    )}
  </div>
);

export default TerritoriesNexus;
