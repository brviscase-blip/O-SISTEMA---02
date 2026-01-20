
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Trash2, Save, Loader2, Plus, Edit3, 
  Mountain, Skull, Target, Upload, CheckCircle2, 
  ChevronDown, Database, Map as MapIcon, Compass,
  Sword, FlaskConical, Crown, Box, Shield, Ghost, MapPinned,
  FileSpreadsheet, Sparkles, Gem, X, Info, ImagePlus
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import * as XLSX from 'xlsx';

const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];

const getRankTheme = (rank: string) => {
  switch (rank) {
    case 'S': return { text: 'text-rose-500', border: 'border-rose-500/40', bg: 'bg-rose-500/10' };
    case 'A': return { text: 'text-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
    case 'B': return { text: 'text-purple-500', border: 'border-purple-500/40', bg: 'bg-purple-500/10' };
    case 'C': return { text: 'text-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/10' };
    case 'D': return { text: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' };
    case 'E': return { text: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/5' };
    default: return { text: 'text-slate-500', border: 'border-slate-800', bg: 'bg-slate-900/40' };
  }
};

const TerritoriesNexus: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    nome: '', rank: 'E', consumivel: '-', arsenal: '-', reliquia: '-', 
    material_refino: '-', armadura: '-', boss: '-', criatura: '-',
    img: '', descricao_lore: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      const { data } = await client.from('territorios').select('*').order('rank', { ascending: true });
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
    if (!window.confirm("EXPURGAR SETOR?")) return;
    const client = getSupabaseClient();
    await client.from('territorios').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/40 rounded flex items-center justify-center text-blue-500">
             <MapPinned size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase">Nexus de Territórios</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Gestão de Ativos por Região</p>
          </div>
        </div>
        <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4">
          <Database className="text-blue-500" size={20} />
          <span className="text-xl font-black text-white italic tabular-nums">{items.length} SETORES</span>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
        <form onSubmit={handleSave} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-4">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mapa Visual (.PNG)</label>
               <div onClick={() => !isUploading && fileInputRef.current?.click()} className="w-full aspect-video bg-slate-950 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden group">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  {isUploading ? (
                    <Loader2 className="animate-spin text-blue-500" />
                  ) : formData.img ? (
                    <img src={formData.img} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus size={32} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
                  )}
               </div>
            </div>

            <div className="lg:col-span-9 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-10"><FormGroup label="NOME DO TERRITÓRIO" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Templo de Carthenon" /></div>
                <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
              </div>

              <div className="pt-6 border-t border-slate-800/40 grid grid-cols-1 md:grid-cols-5 gap-5">
                  <FormGroup label="CONSUMÍVEL" value={formData.consumivel} onChange={(v:any) => setFormData({...formData, consumivel:v})} icon={<FlaskConical size={10}/>} placeholder="Ex: Poção de HP" />
                  <FormGroup label="RELÍQUIA" value={formData.reliquia} onChange={(v:any) => setFormData({...formData, reliquia:v})} icon={<Crown size={10}/>} placeholder="Ex: Elixir de Vida" />
                  <FormGroup label="MAT. REFINO" value={formData.material_refino} onChange={(v:any) => setFormData({...formData, material_refino:v})} icon={<Gem size={10}/>} placeholder="Ex: Couro de Lobo" />
                  <FormGroup label="ARMADURA" value={formData.armadura} onChange={(v:any) => setFormData({...formData, armadura:v})} icon={<Shield size={10}/>} placeholder="Ex: Trajes do Sobrevivente" />
                  <FormGroup label="ARSENAL" value={formData.arsenal} onChange={(v:any) => setFormData({...formData, arsenal:v})} icon={<Sword size={10}/>} placeholder="Ex: Ira de Kamish" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/40">
                  <FormGroup label="BOSS PRINCIPAL" value={formData.boss} onChange={(v:any) => setFormData({...formData, boss:v})} placeholder="Deixe '-' se não houver" />
                  <FormGroup label="CRIATURA COMUM" value={formData.criatura} onChange={(v:any) => setFormData({...formData, criatura:v})} placeholder="Deixe '-' se não houver" />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                 {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData(initialForm); }} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>}
                 <button type="submit" disabled={isSaving || isUploading} className={`px-12 py-4 ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase tracking-widest rounded-sm flex items-center gap-3`}>
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {editingId ? 'ATUALIZAR SETOR' : 'REGISTRAR NO NEXUS'}
                 </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* TABELA */}
      <div className="bg-[#030712] border border-slate-800 rounded-sm overflow-x-auto shadow-2xl">
         <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
               <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase">Setor</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase text-center">Rank</th>
                  <th className="px-4 py-5 text-[9px] font-black text-emerald-500 uppercase">Consumível</th>
                  <th className="px-4 py-5 text-[9px] font-black text-amber-500 uppercase">Relíquia</th>
                  <th className="px-4 py-5 text-[9px] font-black text-blue-400 uppercase">Refino</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase">Armadura</th>
                  <th className="px-4 py-5 text-[9px] font-black text-rose-500 uppercase">Arsenal</th>
                  <th className="px-4 py-5 text-[9px] font-black text-rose-600 uppercase">Boss</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-600 uppercase">Criatura</th>
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase text-right pr-10">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
               {items.map(item => {
                  const theme = getRankTheme(item.rank);
                  return (
                     <tr key={item.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <Mountain size={20} className="text-slate-800" />}
                              </div>
                              <span className="text-sm font-black text-white uppercase italic tracking-tighter">{item.nome}</span>
                           </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                           <span className={`text-xl font-black ${theme.text} italic drop-shadow-[0_0_8px_currentColor]`}>{item.rank}</span>
                        </td>
                        <td className="px-4 py-5 text-[10px] font-bold text-slate-300 uppercase italic truncate max-w-[150px]">{item.consumivel}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-amber-500/80 uppercase italic truncate max-w-[150px]">{item.reliquia}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-blue-400/80 uppercase italic truncate max-w-[150px]">{item.material_refino}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase italic truncate max-w-[150px]">{item.armadura}</td>
                        <td className="px-4 py-5 text-[10px] font-black text-rose-500 uppercase italic truncate max-w-[150px]">{item.arsenal}</td>
                        <td className="px-4 py-5 text-[10px] font-black text-rose-600 uppercase italic truncate max-w-[120px]">{item.boss}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-slate-600 uppercase italic truncate max-w-[120px]">{item.criatura}</td>
                        <td className="px-6 py-5 text-right pr-10">
                           <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {setEditingId(item.id); setFormData({...item}); window.scrollTo({top:0, behavior:'smooth'});}} className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-amber-500 transition-all"><Edit3 size={16}/></button>
                              <button onClick={() => deleteItem(item.id)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, icon, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">{icon} {label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value ?? (type === 'number' ? 0 : '')} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-blue-500 font-black transition-all h-12 shadow-inner italic rounded-sm" />
    )}
  </div>
);

export default TerritoriesNexus;
