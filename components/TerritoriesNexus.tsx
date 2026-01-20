
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Trash2, Save, Loader2, Plus, Edit3, 
  Mountain, Skull, Target, Upload, CheckCircle2, 
  ChevronDown, Database, Map as MapIcon, Compass,
  Sword, FlaskConical, Crown, Box, Shield, Ghost, MapPinned,
  FileSpreadsheet
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import * as XLSX from 'xlsx';

const TIPOS = ['DUNGEON', 'ARENA', 'ZONA DE CAÇA', 'ZONA SEGURA'];
const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];

const getRankTheme = (rank: string) => {
  switch (rank) {
    case 'S': return { text: 'text-rose-500', border: 'border-rose-500/40', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20' };
    case 'A': return { text: 'text-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' };
    case 'B': return { text: 'text-purple-500', border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' };
    case 'C': return { text: 'text-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' };
    case 'D': return { text: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' };
    case 'E': return { text: 'text-slate-400', border: 'border-slate-500/30', bg: 'bg-slate-500/5', glow: 'shadow-slate-500/10' };
    default: return { text: 'text-slate-500', border: 'border-slate-800', bg: 'bg-slate-900/40', glow: '' };
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
    nome: '', rank: 'E', consumivel: '-', arsenal: '-',
    reliquia: '-', material_refino: '-', 
    armadura: '-', boss: '-', criatura: '-',
    img: '', descricao_lore: '', nivel_minimo: 1, tipo: 'ARENA', clima: 'Estável'
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      const { data } = await client.from('territorios').select('*').order('rank', { ascending: false });
      setItems(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const exportToExcel = () => {
    const dataToExport = items.map(item => ({
      'TERRITÓRIO': item.nome,
      'RANK': item.rank,
      'CONSUMÍVEL': item.consumivel,
      'ARSENAL': item.arsenal,
      'RELÍQUIA': item.reliquia,
      'MATERIAL DE REFINO': item.material_refino,
      'ARMADURA': item.armadura,
      'BOSS': item.boss,
      'CRIATURA': item.criatura
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ecossistema_Loot");
    XLSX.writeFile(wb, "Nexus_Territorios_Loot.xlsx");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    if (!client) return;
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
    if (!client) return;
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
      alert("Cartografia Dimensional Sincronizada.");
    } catch (err) { alert("Erro de calibração."); }
    finally { setIsSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("EXPURGAR SETOR?")) return;
    const client = getSupabaseClient();
    if (!client) return;
    await client.from('territorios').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/40 rounded flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
             <MapPinned size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Nexus de Ecossistema</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Mapeamento de Loot e Entidades Territoriais</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-sm"
          >
            <FileSpreadsheet size={16} /> Exportar Banco (XLSX)
          </button>
          <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Setores Sincronizados</span>
                <span className="text-xl font-black text-white italic tabular-nums">{items.length}</span>
            </div>
            <Database className="text-blue-500" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
        
        <form onSubmit={handleSave} className="space-y-10">
          {/* BLOCO 1: IDENTIFICAÇÃO GEOGRÁFICA */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Compass size={14} /> Localização e Geografia</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5"><FormGroup label="NOME DO TERRITÓRIO" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Templo de Carthenon" /></div>
              <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
              <div className="md:col-span-2"><FormGroup label="TIPO" type="select" options={TIPOS} value={formData.tipo} onChange={(v:any) => setFormData({...formData, tipo:v})} /></div>
              <div className="md:col-span-3"><FormGroup label="NÍVEL MÍNIMO" type="number" value={formData.nivel_minimo} onChange={(v:any) => setFormData({...formData, nivel_minimo:v})} /></div>
            </div>
          </div>

          {/* BLOCO 2: TABELA DE ECOSSISTEMA (LOOT) */}
          <div className="space-y-6 pt-6 border-t border-slate-800/40">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Box size={14} /> Ecossistema de Ativos (Loot)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
              <FormGroup label="CONSUMÍVEL" value={formData.consumivel} onChange={(v:any) => setFormData({...formData, consumivel:v})} placeholder="-" />
              <FormGroup label="ARSENAL" value={formData.arsenal} onChange={(v:any) => setFormData({...formData, arsenal:v})} placeholder="-" />
              <FormGroup label="RELÍQUIA" value={formData.reliquia} onChange={(v:any) => setFormData({...formData, reliquia:v})} placeholder="-" />
              <FormGroup label="MAT. DE REFINO" value={formData.material_refino} onChange={(v:any) => setFormData({...formData, material_refino:v})} placeholder="-" />
              <FormGroup label="ARMADURA" value={formData.armadura} onChange={(v:any) => setFormData({...formData, armadura:v})} placeholder="-" />
            </div>
          </div>

          {/* BLOCO 3: ENTIDADES E MÍDIA */}
          <div className="space-y-6 pt-6 border-t border-slate-800/40">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-6">
                   <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2"><Skull size={14} /> Perigos Locais</h4>
                   <FormGroup label="BOSS PRINCIPAL" value={formData.boss} onChange={(v:any) => setFormData({...formData, boss:v})} placeholder="O Arquiteto" />
                   <FormGroup label="CRIATURA COMUM" value={formData.criatura} onChange={(v:any) => setFormData({...formData, criatura:v})} placeholder="Estátua de Pedra" />
                </div>
                <div className="md:col-span-8 space-y-6">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> Mídia e Lore</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div onClick={() => !isUploading && fileInputRef.current?.click()} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all group/img overflow-hidden shadow-inner">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        {formData.img ? <img src={formData.img} className="w-full h-full object-cover" /> : (
                          <>
                            <Upload size={24} className="text-slate-800 mb-2 group-hover/img:text-blue-500 transition-colors" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">{isUploading ? 'Sincronizando...' : 'Mapa Visual .PNG'}</span>
                          </>
                        )}
                      </div>
                      <FormGroup label="REGISTRO DE MEMÓRIA (LORE)" type="textarea" value={formData.descricao_lore} onChange={(v:any) => setFormData({...formData, descricao_lore:v})} placeholder="Descrição narrativa do local..." />
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-800/40 flex justify-end gap-4">
             {editingId && (
               <button type="button" onClick={() => {setEditingId(null); setFormData(initialForm);}} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">
                  Cancelar
               </button>
             )}
             <button type="submit" disabled={isSaving || isUploading} className={`px-12 py-4 ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-sm shadow-xl active:scale-95 flex items-center gap-3`}>
               {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
               {editingId ? 'ATUALIZAR' : 'REGISTRAR NO NEXUS'}
             </button>
          </div>
        </form>
      </div>

      {/* LISTAGEM ESTILO PLANILHA DINÂMICA */}
      <div className="bg-[#030712] border border-slate-800 rounded-sm overflow-x-auto shadow-2xl custom-scrollbar">
         <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
               <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Território</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Rank</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Consumível</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Arsenal</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Relíquia</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-blue-400">Mat. de Refino</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Armadura</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Boss</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Criatura</th>
                  <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
               {items.map(item => {
                  const theme = getRankTheme(item.rank);
                  return (
                     <tr key={item.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                                {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <Mountain size={18} className="text-slate-800" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-white uppercase italic tracking-tighter">{item.nome}</span>
                                <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{item.tipo}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                           <span className={`text-base font-black ${theme.text} italic drop-shadow-[0_0_8px_currentColor]`}>{item.rank}</span>
                        </td>
                        <td className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase italic tabular-nums">{item.consumivel}</td>
                        <td className="px-4 py-5 text-[10px] font-black text-rose-500 uppercase italic tracking-tight">{item.arsenal}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-amber-500/80 uppercase italic">{item.reliquia}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-blue-400/80 uppercase italic">{item.material_refino}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase italic">{item.armadura}</td>
                        <td className="px-4 py-5 text-[11px] font-black text-rose-600 uppercase italic">{item.boss}</td>
                        <td className="px-4 py-5 text-[10px] font-bold text-slate-500 uppercase italic">{item.criatura}</td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {setEditingId(item.id); setFormData({...item}); window.scrollTo({top:0, behavior:'smooth'});}} className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-amber-500 hover:border-amber-500/30 transition-all shadow-lg"><Edit3 size={16}/></button>
                              <button onClick={() => deleteItem(item.id)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-lg"><Trash2 size={16}/></button>
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
         {items.length === 0 && !isLoading && (
            <div className="py-20 flex flex-col items-center justify-center opacity-20">
               <Ghost size={64} className="mb-4" />
               <p className="text-xs font-black uppercase tracking-[0.5em]">Nenhum ecossistema mapeado</p>
            </div>
         )}
      </div>
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none shadow-inner rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-4 text-[11px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-900 font-bold transition-all h-[104px] resize-none hover:border-slate-600 custom-scrollbar shadow-inner leading-relaxed rounded-sm" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value ?? (type === 'number' ? 0 : '')} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-blue-500 placeholder:text-slate-900 font-black transition-all h-12 shadow-inner italic rounded-sm" />
    )}
  </div>
);

export default TerritoriesNexus;
