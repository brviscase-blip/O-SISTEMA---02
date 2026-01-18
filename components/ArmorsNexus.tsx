
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Trash2, Save, Loader2, Plus, Edit3, 
  Target, Layers, ArrowRight, Upload, 
  CheckCircle2, ChevronDown, ShieldCheck, Box,
  Dumbbell, Zap, Brain, Activity, Eye, X,
  ShieldAlert, ShieldQuestion, TrendingUp, TrendingDown,
  Waves, Flame, Snowflake, Sparkles, Ghost, Heart
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

const getAttributeIcon = (attr: string, size = 14) => {
  const normalized = attr?.toUpperCase();
  switch (normalized) {
    case 'FORÇA': return <Dumbbell size={size} />;
    case 'AGILIDADE': return <Zap size={size} />;
    case 'INTELIGÊNCIA': return <Brain size={size} />;
    case 'VITALIDADE': return <HeartIcon size={size} />;
    case 'PERCEPÇÃO': return <Eye size={size} />;
    case 'HP': return <HeartIcon size={size} className="text-rose-500" />;
    case 'MP': return <Zap size={size} className="text-blue-500" />;
    default: return <Activity size={size} />;
  }
};

const HeartIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

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

  const vantagemOptions = ['NENHUMA', 'SOM (RUÍDOS)', 'CORTE', 'ATRITO', 'PERFURAÇÃO', 'TERRENO IRREGULAR', 'INSTABILIDADE'];
  const fraquezaOptions = ['NENHUMA', 'LUZ (CLARÃO)', 'IMPACTO', 'FOGO', 'GELO', 'LAMA', 'MALDIÇÃO'];
  const attributeOptions = ['FORÇA', 'AGILIDADE', 'INTELIGÊNCIA', 'VITALIDADE', 'PERCEPÇÃO'];
  const bonusTargetOptions = ['FORÇA', 'AGILIDADE', 'INTELIGÊNCIA', 'VITALIDADE', 'PERCEPÇÃO', 'HP', 'MP'];
  const slotOptions = ['CABEÇA', 'PEITORAL', 'MÃOS', 'PERNAS', 'PÉS', 'ANEL'];

  const initialFormState = {
    nome: '', 
    rank: 'E', 
    slot: 'PEITORAL', 
    atributo: 'VITALIDADE',
    bonus_label: '', // Ex: "+10 HP"
    bonus_target: 'HP', 
    bonus_value: 0,
    vantagem_defensiva: 'NENHUMA',
    fraqueza_defensiva: 'NENHUMA',
    descricao_lore: '', 
    boss_trial_id: '', 
    img: ''
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
      alert("Erro no Nexus Storage.");
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
      const { bonus_target, bonus_value, bonus_label, ...data } = formData;
      
      // Mapeamento matemático para o banco de dados
      const statMap: Record<string, string> = {
          'FORÇA': 'strength', 'AGILIDADE': 'agility', 'INTELIGÊNCIA': 'intelligence',
          'VITALIDADE': 'vitality', 'PERCEPÇÃO': 'perception', 'HP': 'hp', 'MP': 'mp'
      };

      const payload = { 
          ...data,
          bonus_status: bonus_label || `+${bonus_value} ${bonus_target}`,
          bonus: { [statMap[bonus_target]]: Number(bonus_value) }
      };
      
      if (editingId) {
        const { error } = await client.from('armaduras').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await client.from('armaduras').insert([payload]);
        if (error) throw error;
      }
      
      setFormData(initialFormState);
      setEditingId(null);
      fetchData();
      alert('Sincronização de Proteção Concluída.');
    } catch (err) { 
        console.error(err);
        alert('Falha na recalibração.'); 
    } finally { 
        setIsSaving(false); 
    }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm("CONFIRMAR EXPURGO?")) return;
    const client = getSupabaseClient();
    if (!client) return;
    try {
        const { error } = await client.from('armaduras').delete().eq('id', id);
        if (error) throw error;
        fetchData();
    } catch (err) {
        alert("Erro ao apagar registro.");
    }
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

      {subTab === 'LISTA' && (
        <div className="space-y-8">
          <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative shadow-2xl overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
            
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              {editingId ? <Edit3 size={16} className="text-amber-500" /> : <Plus size={16} className="text-blue-500" />} 
              {editingId ? 'MODULAR PROTEÇÃO' : 'REGISTRAR NOVA PEÇA'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-4"><FormGroup label="NOME DO ITEM" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} /></div>
                <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="SLOT" type="select" options={slotOptions} value={formData.slot} onChange={(v:any) => setFormData({...formData, slot:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="ATRIBUTO FOCO" type="select" options={attributeOptions} value={formData.atributo} onChange={(v:any) => setFormData({...formData, atributo:v})} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                <div className="md:col-span-3"><FormGroup label="TEXTO DO BÔNUS (UI)" value={formData.bonus_label} onChange={(v:any) => setFormData({...formData, bonus_label:v})} placeholder="Ex: +10 Mana" /></div>
                <div className="md:col-span-2"><FormGroup label="ALVO TÉCNICO" type="select" options={bonusTargetOptions} value={formData.bonus_target} onChange={(v:any) => setFormData({...formData, bonus_target:v})} /></div>
                <div className="md:col-span-1"><FormGroup label="VALOR" type="number" value={formData.bonus_value} onChange={(v:any) => setFormData({...formData, bonus_value:v})} /></div>
                
                <div className="md:col-span-3"><FormGroup label="VANTAGEM DEFENSIVA" type="select" options={vantagemOptions} value={formData.vantagem_defensiva} onChange={(v:any) => setFormData({...formData, vantagem_defensiva:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="FRAQUEZA DEFENSIVA" type="select" options={fraquezaOptions} value={formData.fraqueza_defensiva} onChange={(v:any) => setFormData({...formData, fraqueza_defensiva:v})} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                <div className="md:col-span-3"><FormGroup label="BOSS TRIAL ID" value={formData.boss_trial_id} onChange={(v:any) => setFormData({...formData, boss_trial_id:v})} /></div>
                <div className="md:col-span-6"><FormGroup label="DESCRIÇÃO (LORE E IMAGINAÇÃO)" type="textarea" value={formData.descricao_lore} onChange={(v:any) => setFormData({...formData, descricao_lore:v})} /></div>
                <div className="md:col-span-3 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">VISUAL (.PNG)</label>
                        <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center px-4 cursor-pointer hover:border-blue-500 transition-all ${formData.img ? 'border-emerald-500/50' : ''}`}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold text-slate-600 truncate">{isUploading ? 'SYNC...' : formData.img ? 'OK' : 'SELECT'}</span>
                                {formData.img && <div className="w-8 h-8 rounded-sm border border-slate-800 overflow-hidden"><img src={formData.img} className="w-full h-full object-cover" /></div>}
                            </div>
                        </div>
                    </div>
                    <button disabled={isSaving || isUploading} className={`w-full h-12 ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase transition-all rounded-sm shadow-xl active:scale-95`}>
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                    </button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="w-full py-2 bg-slate-800 text-[9px] font-black uppercase text-slate-500 rounded-sm">CANCELAR</button>}
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
                          <span className="text-[8px] font-bold text-slate-600 uppercase mt-1">PROTOCOLO #{item.id.substring(0,4)}</span>
                       </div>
                    </div>
                    <div className="w-[10%] text-center"><span className={`text-xl font-black ${theme.text} italic drop-shadow-[0_0_8px_currentColor]`}>{item.rank}</span></div>
                    <div className="w-[10%] text-center flex flex-col items-center">
                       <div className="text-blue-400 mb-1">{getAttributeIcon(item.atributo || 'VITALIDADE', 14)}</div>
                       <span className="text-[8px] font-black text-white uppercase tracking-tighter">{item.atributo || 'VITALIDADE'}</span>
                    </div>
                    <div className="w-[12%] text-center">
                       <span className="text-[11px] font-black text-emerald-400 italic tabular-nums">{item.bonus_status || 'N/A'}</span>
                       <span className="text-[7px] font-bold text-slate-600 uppercase block">MODIFICADOR</span>
                    </div>
                    <div className="w-[15%] text-center flex items-center justify-center gap-4">
                       <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <TrendingUp size={12} className="text-emerald-500" />
                          <span className="text-[7px] font-black text-emerald-500 uppercase text-center leading-tight">{item.vantagem_defensiva || '---'}</span>
                       </div>
                       <div className="w-px h-8 bg-slate-800" />
                       <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <TrendingDown size={12} className="text-rose-500" />
                          <span className="text-[7px] font-black text-rose-500 uppercase text-center leading-tight">{item.fraqueza_defensiva || '---'}</span>
                       </div>
                    </div>
                    <div className="w-[13%] px-4 border-l border-slate-800/50">
                       <p className="text-[9px] text-slate-500 italic line-clamp-3 leading-relaxed">{item.descricao_lore || 'Sem registro.'}</p>
                    </div>
                    <div className="w-[10%] flex items-center justify-end gap-2 pr-2">
                       <button onClick={() => { setEditingId(item.id); setFormData({...item, bonus_target: Object.keys(item.bonus || {})[0]?.toUpperCase() === 'HP' ? 'HP' : 'FORÇA', bonus_value: Object.values(item.bonus || {})[0] as number}); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-amber-500 transition-all"><Edit3 size={16}/></button>
                       <button onClick={() => deleteRecord(item.id)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                    </div>
                  </div>
                );
             })}
          </div>
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
          {options.map((o:any) => <option key={o} value={o} className="bg-[#030712] uppercase">{o}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-4 text-[11px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-900 font-bold transition-all min-h-[104px] h-[104px] resize-none hover:border-slate-600 custom-scrollbar shadow-inner leading-relaxed" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value} step={type === 'number' ? '1' : undefined} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-blue-500 placeholder:text-slate-900 font-black transition-all h-12 hover:border-slate-600 shadow-inner italic uppercase" />
    )}
  </div>
);

export default ArmorsNexus;
