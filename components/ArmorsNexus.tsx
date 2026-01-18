
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Trash2, Save, Loader2, Plus, Edit3, 
  Target, Layers, ArrowRight, Upload, 
  CheckCircle2, ChevronDown, ShieldCheck, Box
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

type SubTab = 'LISTA' | 'MATRIZ';

const getRankClass = (rank: string) => {
  switch (rank) {
    case 'S': return { border: 'bg-rose-500', text: 'text-rose-500' };
    case 'A': return { border: 'bg-amber-500', text: 'text-amber-500' };
    case 'B': return { border: 'bg-purple-500', text: 'text-purple-500' };
    case 'C': return { border: 'bg-blue-500', text: 'text-blue-500' };
    case 'D': return { border: 'bg-emerald-500', text: 'text-emerald-500' };
    case 'E': return { border: 'bg-slate-500', text: 'text-slate-500' };
    default: return { border: 'bg-slate-800', text: 'text-slate-400' };
  }
};

const rankWeights: Record<string, number> = {
  'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1
};

const ArmorsNexus: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('LISTA');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    nome: '', rank: 'E', set_nome: '', slot: 'Peitoral', bonus_status: '',
    nivel_desbloqueio: 1, boss_trial_id: '', concluido: false,
    historia_set: '', descricao_lore: '', material_upgrade: 'Couro de Lycan', img: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      const { data: armors } = await client.from('armaduras').select('*');
      const sorted = (armors || []).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
      setItems(sorted);
    } catch (err) {
      console.error("Erro Nexus Armaduras:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    if (!client) return;
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_armor.${file.name.split('.').pop()}`;
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(`armaduras/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(`armaduras/${fileName}`);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) {
      alert("Erro Storage.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client || !formData.nome.trim()) return;
    setIsSaving(true);
    try {
      const { id, created_at, ...payload } = formData as any;
      payload.nivel_desbloqueio = Number(payload.nivel_desbloqueio);
      
      if (editingId) {
        await client.from('armaduras').update(payload).eq('id', editingId);
      } else {
        await client.from('armaduras').insert([payload]);
      }
      setFormData(initialFormState);
      setEditingId(null);
      fetchData();
      alert('Armadura Sincronizada.');
    } catch (err) { alert('Falha técnica.'); }
    finally { setIsSaving(false); }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm("Confirmar expurgo?")) return;
    const client = getSupabaseClient();
    if (!client) return;
    await client.from('armaduras').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-1 border-b border-slate-800/60 pb-4">
        <button onClick={() => setSubTab('LISTA')} className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${subTab === 'LISTA' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}>
          CONJUNTOS DE PROTEÇÃO
        </button>
        <button onClick={() => setSubTab('MATRIZ')} className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${subTab === 'MATRIZ' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}>
          MATRIZ DE SINCRONIA DE SET
        </button>
      </div>

      {subTab === 'LISTA' ? (
        <div className="space-y-8">
          <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative shadow-2xl">
            <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              {editingId ? <Edit3 size={16} className="text-amber-500" /> : <Plus size={16} className="text-blue-500" />} 
              {editingId ? 'MODULAR PROTEÇÃO' : 'REGISTRAR NOVA PEÇA'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-4"><FormGroup label="NOME DA PEÇA" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} /></div>
                <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="SLOT" type="select" options={['Cabeça','Peitoral','Mãos','Pernas','Pés','Anel']} value={formData.slot} onChange={(v:any) => setFormData({...formData, slot:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="NOME DO SET" value={formData.set_nome} onChange={(v:any) => setFormData({...formData, set_nome:v})} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                <div className="md:col-span-3"><FormGroup label="BÔNUS STATUS" value={formData.bonus_status} onChange={(v:any) => setFormData({...formData, bonus_status:v})} placeholder="Ex: +10 Vitalidade" /></div>
                <div className="md:col-span-2"><FormGroup label="NV. DESBLOQUEIO" type="number" value={formData.nivel_desbloqueio} onChange={(v:any) => setFormData({...formData, nivel_desbloqueio:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="ID DO BOSS (TRIAL)" value={formData.boss_trial_id} onChange={(v:any) => setFormData({...formData, boss_trial_id:v})} /></div>
                <div className="md:col-span-4 flex flex-col gap-2">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">VISUAL (.PNG)</label>
                   <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full h-10 bg-slate-950 border border-slate-800 rounded-sm flex items-center px-4 cursor-pointer hover:border-blue-500 transition-all`}>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <div className="flex items-center justify-between w-full">
                         <span className="text-[10px] font-bold text-slate-600 truncate">{isUploading ? 'SINCRONIZANDO...' : formData.img ? 'UPLOAD CONCLUÍDO' : 'SELECIONAR'}</span>
                         {formData.img && <div className="w-7 h-7 rounded-sm border border-slate-800 overflow-hidden"><img src={formData.img} className="w-full h-full object-cover" /></div>}
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                <div className="md:col-span-5"><FormGroup label="DESCRIÇÃO LORE (INDIVIDUAL)" type="textarea" value={formData.descricao_lore} onChange={(v:any) => setFormData({...formData, descricao_lore:v})} /></div>
                <div className="md:col-span-5"><FormGroup label="HISTÓRIA DO CONJUNTO (SET)" type="textarea" value={formData.historia_set} onChange={(v:any) => setFormData({...formData, historia_set:v})} /></div>
                <div className="md:col-span-2 flex items-end">
                   <button disabled={isSaving || isUploading} className={`w-full h-[104px] ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white text-[11px] font-black uppercase flex flex-col items-center justify-center gap-3 transition-all rounded-sm shadow-xl active:scale-95`}>
                     {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Shield size={24}/>} {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                   </button>
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-3">
             {items.map(item => {
                const theme = getRankClass(item.rank);
                return (
                  <div key={item.id} className="bg-[#030712] border border-slate-800 h-28 flex items-center px-6 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full shadow-lg">
                    <div className={`absolute left-0 top-0 h-full w-1 ${theme.border}`} />
                    <div className="w-[20%] flex items-center gap-4">
                       <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group-hover:border-blue-500/40">
                          {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <Shield size={24} className="text-slate-800" />}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <h4 className="text-[12px] font-black text-white uppercase italic tracking-tighter truncate leading-tight">{item.nome}</h4>
                          <span className="text-[8px] font-bold text-slate-600 uppercase mt-1">LV. DESBLOQUEIO: {item.nivel_desbloqueio}</span>
                       </div>
                    </div>
                    <div className="w-[10%] text-center"><span className={`text-lg font-black ${theme.text} italic`}>{item.rank}</span></div>
                    <div className="w-[15%] text-center flex flex-col">
                       <span className="text-[11px] font-black text-blue-400 uppercase italic">{item.slot}</span>
                       <span className="text-[8px] font-bold text-slate-600 uppercase truncate">{item.set_nome}</span>
                    </div>
                    <div className="w-[15%] text-center">
                       <span className="text-[11px] font-black text-emerald-400 italic">{item.bonus_status || 'N/A'}</span>
                       <span className="text-[7px] font-bold text-slate-600 uppercase block">BÔNUS</span>
                    </div>
                    <div className="w-[25%] px-6 border-l border-r border-slate-800/50">
                       <p className="text-[9px] text-slate-500 italic line-clamp-3 leading-relaxed">{item.descricao_lore || item.historia_set || 'Sem lore.'}</p>
                    </div>
                    <div className="w-[15%] flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button onClick={() => { setEditingId(item.id); setFormData({...item}); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-3 bg-slate-900 border border-slate-800 rounded-sm text-slate-500 hover:text-amber-500 hover:border-amber-500/40 transition-all"><Edit3 size={18}/></button>
                       <button onClick={() => deleteRecord(item.id)} className="p-3 bg-slate-900 border border-slate-800 rounded-sm text-slate-500 hover:text-rose-500 hover:border-rose-500/40 transition-all"><Trash2 size={18}/></button>
                    </div>
                  </div>
                );
             })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#030712] border border-slate-800 rounded-sm">
           <Box size={48} className="text-emerald-900 mb-6 animate-pulse" />
           <h4 className="text-sm font-black text-emerald-500 uppercase tracking-[0.4em]">Módulo de Sincronia de Set</h4>
           <p className="text-[10px] text-slate-600 font-bold uppercase mt-2 tracking-widest italic opacity-60">Matriz de afinidade entre peças de armadura em desenvolvimento.</p>
        </div>
      )}
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none group-hover:border-slate-600 shadow-inner">
          {options.map((o:any) => <option key={o} value={o} className="bg-[#030712]">{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-4 text-[11px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-900 font-bold transition-all min-h-[104px] h-[104px] resize-none hover:border-slate-600 custom-scrollbar shadow-inner leading-relaxed" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value} step={type === 'number' ? '0.1' : undefined} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-blue-500 placeholder:text-slate-900 font-black transition-all h-12 hover:border-slate-600 shadow-inner italic" />
    )}
  </div>
);

export default ArmorsNexus;
