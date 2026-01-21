import React, { useState, useEffect, useRef } from 'react';
import { 
  Sword, Trash2, Save, Loader2, Plus, Edit3, 
  Zap, Dumbbell, Brain, Target, ArrowRight,
  Upload, CheckCircle2, ImageOff, Repeat,
  ChevronDown, X, FileSpreadsheet, ScrollText,
  Activity, Star
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import * as XLSX from 'xlsx';

const getRankClass = (rank: string) => {
  switch (String(rank || 'E').toUpperCase()) {
    case 'S': return { border: 'bg-rose-500', text: 'text-rose-500' };
    case 'A': return { border: 'bg-amber-500', text: 'text-amber-500' };
    case 'B': return { border: 'bg-purple-500', text: 'text-purple-500' };
    case 'C': return { border: 'bg-blue-500', text: 'text-blue-500' };
    case 'D': return { border: 'bg-emerald-500', text: 'text-emerald-500' };
    default: return { border: 'bg-slate-500', text: 'text-slate-500' };
  }
};

const getAttributeIcon = (attr: string, size = 14) => {
  switch (String(attr || '').toUpperCase()) {
    case 'FORÇA': return <Dumbbell size={size} className="text-white" />;
    case 'AGILIDADE': return <Zap size={size} className="text-white" />;
    case 'INTELIGÊNCIA': return <Brain size={size} className="text-white" />;
    default: return <Target size={size} className="text-white" />;
  }
};

const WeaponsNexus: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    nome: '', 
    rank: 'E', 
    atributo_base: 'FORÇA',
    dano_inicial: 0, 
    lvl_range: '1-10',
    material_refino: '',
    efeito_passivo: '',
    descricao_efeito: '',
    historia: '',
    img: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    const client = getSupabaseClient();
    setIsLoading(true);
    try {
      const { data } = await client.from('armas').select('*').order('created_at', { ascending: false });
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
      const fileName = `${Date.now()}_weapon.${file.name.split('.').pop()}`;
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(`arsenal/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(`arsenal/${fileName}`);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) { alert("Falha no upload visual."); }
    finally { setIsUploading(false); }
  };

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
      setFormData(initialFormState);
      setEditingId(null);
      fetchData();
      alert('Arsenal Sincronizado.');
    } catch (err) { alert('Erro ao salvar.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-rose-600/10 border border-rose-500/40 rounded-sm flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              <Sword size={24} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Nexus de Arsenal</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Configuração de Matrizes Bélicas</p>
           </div>
        </div>
        <div className="flex items-center gap-3 bg-[#030712] border border-slate-800 p-4 rounded-sm">
           <Activity size={20} className="text-blue-500" />
           <span className="text-xl font-black text-white italic tabular-nums">{items.length} ARTEFATOS</span>
        </div>
      </div>

      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-rose-600'}`} />
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* UPLOAD VISUAL (.PNG) */}
            <div className="lg:col-span-3">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Upload Visual (.PNG)</label>
               <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full aspect-[3/4] bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all relative overflow-hidden group ${formData.img ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : formData.img ? <img src={formData.img} className="w-full h-full object-cover" /> : <Upload size={32} className="text-slate-800 group-hover:text-blue-500" />}
                  {formData.img && <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase text-white">Trocar Imagem</div>}
               </div>
            </div>

            <div className="lg:col-span-9 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6"><FormGroup label="ARSENAL (NOME)" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Ira de Kamish" /></div>
                <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
                <div className="md:col-span-4"><FormGroup label="ATRIBUTO BASE" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={formData.atributo_base} onChange={(v:any) => setFormData({...formData, atributo_base:v})} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-800/40">
                <div className="md:col-span-3"><FormGroup label="DANO INICIAL" type="number" value={formData.dano_inicial} onChange={(v:any) => setFormData({...formData, dano_inicial:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="LEVEL RANGE" value={formData.lvl_range} onChange={(v:any) => setFormData({...formData, lvl_range:v})} placeholder="Ex: 1-100" /></div>
                <div className="md:col-span-3"><FormGroup label="MATERIAL REFINO" value={formData.material_refino} onChange={(v:any) => setFormData({...formData, material_refino:v})} placeholder="Ex: Pedra de Mana" /></div>
                <div className="md:col-span-3"><FormGroup label="EFEITO PASSIVO" value={formData.efeito_passivo} onChange={(v:any) => setFormData({...formData, efeito_passivo:v})} placeholder="Ex: Sangramento" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/40">
                 <FormGroup label="DESCRIÇÃO EFEITO" type="textarea" value={formData.descricao_efeito} onChange={(v:any) => setFormData({...formData, descricao_efeito:v})} placeholder="Explique os bônus técnicos..." />
                 <FormGroup label="HISTÓRIA" type="textarea" value={formData.historia} onChange={(v:any) => setFormData({...formData, historia:v})} placeholder="Memórias do artefato..." />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-800/40">
                 {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>}
                 <button type="submit" disabled={isSaving || isUploading} className={`px-12 py-4 ${editingId ? 'bg-amber-600' : 'bg-rose-600'} text-white text-[11px] font-black uppercase tracking-widest rounded-sm flex items-center gap-3 shadow-xl active:scale-95`}>
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {editingId ? 'ATUALIZAR ARTEFATO' : 'REGISTRAR NO NEXUS'}
                 </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(item => {
           const theme = getRankClass(item.rank);
           return (
             <div key={item.id} className="bg-[#030712] border border-slate-800 flex flex-col group hover:border-rose-500/50 transition-all rounded-sm shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-4 text-2xl font-black italic opacity-20 ${theme.text}`}>{item.rank}</div>
                <div className="p-6 flex items-center gap-5 border-b border-slate-800/50 bg-black/20">
                   <div className="w-16 h-20 bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex-shrink-0">
                      {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <Sword size={24} className="text-slate-800" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-black text-white uppercase italic tracking-tighter truncate">{item.nome}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-700 ${theme.text}`}>RANK {item.rank}</span>
                         <span className="text-[8px] font-bold text-slate-500 uppercase">LVL: {item.lvl_range}</span>
                      </div>
                   </div>
                </div>
                <div className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-3 rounded-sm border border-slate-800">
                         <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Dano Inicial</p>
                         <p className="text-lg font-black text-white italic tabular-nums">{item.dano_inicial} ATK</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-sm border border-slate-800">
                         <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Atributo Base</p>
                         <div className="flex items-center gap-2">
                            {getAttributeIcon(item.atributo_base, 14)}
                            <p className="text-xs font-black text-white uppercase">{item.atributo_base}</p>
                         </div>
                      </div>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Star size={10} /> {item.efeito_passivo || 'Sem Efeito'}</p>
                      <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed">{item.descricao_efeito || 'Sem descrição.'}</p>
                   </div>
                </div>
                <div className="mt-auto p-4 bg-black/40 border-t border-slate-800/50 flex justify-end gap-2">
                   <button onClick={() => {setEditingId(item.id); setFormData({...item}); window.scrollTo({top:0, behavior:'smooth'});}} className="p-2 bg-slate-900 text-slate-500 hover:text-amber-500 transition-all rounded-sm border border-slate-800"><Edit3 size={16}/></button>
                   <button onClick={async () => { if(confirm('Expurgar?')) { await getSupabaseClient().from('armas').delete().eq('id', item.id); fetchData(); } }} className="p-2 bg-slate-900 text-slate-500 hover:text-rose-500 transition-all rounded-sm border border-slate-800"><Trash2 size={16}/></button>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-rose-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none group-hover:border-slate-700 shadow-inner">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-rose-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-4 text-[11px] text-slate-300 outline-none focus:border-rose-500 placeholder:text-slate-900 font-bold transition-all min-h-[80px] h-[80px] resize-none hover:border-slate-700 custom-scrollbar shadow-inner leading-relaxed" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value ?? (type === 'number' ? 0 : '')} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-rose-500 placeholder:text-slate-900 font-black transition-all h-12 hover:border-slate-700 shadow-inner italic" />
    )}
  </div>
);

export default WeaponsNexus;