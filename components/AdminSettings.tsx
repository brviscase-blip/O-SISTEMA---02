
import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Database, Sword, Trash2, Save, X, 
  Loader2, Plus, AlertTriangle, ShieldCheck, 
  ChevronLeft, Shield, Box, Crown, Edit3, 
  Info, Sparkles, RotateCcw, ChevronDown, Zap, 
  Crosshair, BookOpen, ChevronRight, Dumbbell, 
  Brain, Zap as AgilityIcon, ArrowRight, ArrowLeftRight,
  Image as ImageIcon, Layers, TrendingUp, LockKeyhole,
  Upload, CheckCircle2, ImageOff, ShieldAlert,
  Target, Swords, Repeat, ScrollText
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

interface Props {
  onClose: () => void;
}

type AdminModule = 'ARMAS' | 'ARMADURAS' | 'ITEM' | 'ACESSORIO';
type WeaponSubTab = 'LISTA' | 'MATRIZ';

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

const getAttributeIcon = (attr: string) => {
  switch (attr) {
    case 'FORÇA': return <Dumbbell size={14} className="text-white" />;
    case 'AGILIDADE': return <Zap size={14} className="text-white" />;
    case 'INTELIGÊNCIA': return <Brain size={14} className="text-white" />;
    default: return <Target size={14} className="text-white" />;
  }
};

const rankWeights: Record<string, number> = {
  'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1
};

const AdminSettings: React.FC<Props> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<AdminModule>('ARMAS');
  const [weaponSubTab, setWeaponSubTab] = useState<WeaponSubTab>('LISTA');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [items, setItems] = useState<any[]>([]);
  const [affinities, setAffinities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAffinityId, setEditingAffinityId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    nome: '',
    rank: 'E',
    dano_base: 0,
    atributo_principal: 'FORÇA',
    efeito_especial: '',
    desc_efeito: '',
    nivel_desbloqueio: 1,
    lvl_min: 1,
    lvl_max: 10,
    material_upgrade: 'Pedra de Mana Comum',
    img: '',
    historia: ''
  };

  const initialAffinityState = {
    atacante: 'FORÇA',
    defensor: 'FORÇA',
    vantagem: 'NEUTRO',
    multiplicador: 1.0,
    lore: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [affinityData, setAffinityData] = useState(initialAffinityState);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'Rafael' && password === '1234') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ACESSO NEGADO: DNA NÃO RECONHECIDO.');
    }
  };

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      if (activeModule === 'ARMAS') {
        const { data: weapons } = await client.from('armas').select('*');
        const { data: affs } = await client.from('afinidades').select('*').order('created_at', { ascending: false });
        
        const sortedWeapons = (weapons || []).sort((a, b) => {
          const weightA = rankWeights[a.rank] || 0;
          const weightB = rankWeights[b.rank] || 0;
          if (weightA !== weightB) return weightB - weightA;
          return (b.lvl_max || 0) - (a.lvl_max || 0);
        });

        setItems(sortedWeapons);
        setAffinities(affs || []);
      }
    } catch (err) { 
      console.error("Erro ao sincronizar Nexus:", err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, activeModule]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    if (!client) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `armas/${fileName}`;
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) {
      alert("Falha ao subir imagem para o Nexus Storage.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, img: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveWeapon = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client || !formData.nome.trim()) return;
    setIsSaving(true);
    try {
      const payload = { 
        ...formData, 
        dano_base: Number(formData.dano_base),
        nivel_desbloqueio: Number(formData.nivel_desbloqueio),
        lvl_min: Number(formData.lvl_min),
        lvl_max: Number(formData.lvl_max)
      };
      if (editingId) {
        await client.from('armas').update(payload).eq('id', editingId);
      } else {
        await client.from('armas').insert([payload]);
      }
      setFormData(initialFormState);
      setEditingId(null);
      fetchData();
    } catch (err) { alert('Falha tática na operação.'); }
    finally { setIsSaving(false); }
  };

  const handleSaveAffinity = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    setIsSaving(true);
    try {
      const payload = { ...affinityData, multiplicador: Number(affinityData.multiplicador) };
      if (editingAffinityId) {
        await client.from('afinidades').update(payload).eq('id', editingAffinityId);
      } else {
        await client.from('afinidades').insert([payload]);
      }
      setAffinityData(initialAffinityState);
      setEditingAffinityId(null);
      fetchData();
    } catch (err) { alert('Erro ao salvar afinidade.'); }
    finally { setIsSaving(false); }
  };

  const deleteRecord = async (table: string, id: string) => {
    if (!window.confirm("Confirmar expurgo definitivo?")) return;
    const client = getSupabaseClient();
    if (!client) return;
    await client.from(table).delete().eq('id', id);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[8000] bg-[#010307] flex items-center justify-center font-sans">
        <div className="w-full max-w-sm bg-[#030712] border border-slate-800 p-8 rounded-sm shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-900/20 border border-blue-500 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">SISTEMA CENTRAL</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">NEXUS MASTER CORE</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="LOGIN" value={login} onChange={e => setLogin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-sm px-4 py-3 text-xs font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
            <input type="password" placeholder="SENHA" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-sm px-4 py-3 text-xs font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
            {error && <p className="text-[9px] font-black text-rose-500 text-center uppercase tracking-widest">{error}</p>}
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-sm shadow-lg shadow-blue-600/20">AUTENTICAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[8000] bg-[#010307] flex flex-col font-sans overflow-hidden">
      <div className="bg-[#030712] border-b border-slate-800 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Database className="text-blue-400" size={18} />
          <h2 className="text-xs font-black text-white italic uppercase tracking-[0.4em]">NEXUS MASTER CORE</h2>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-all"><X size={20} /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 bg-[#020617] border-r border-slate-800 flex flex-col flex-shrink-0">
          <nav className="flex-1 p-2 space-y-1">
            <AdminNavItem icon={<Sword size={16}/>} label="ARMAS" active={activeModule === 'ARMAS'} onClick={() => setActiveModule('ARMAS')} />
            <AdminNavItem icon={<Shield size={16}/>} label="ARMADURAS" active={activeModule === 'ARMADURAS'} onClick={() => setActiveModule('ARMADURAS')} isLocked />
            <AdminNavItem icon={<Box size={16}/>} label="ITENS" active={activeModule === 'ITEM'} onClick={() => setActiveModule('ITEM')} isLocked />
            <AdminNavItem icon={<Crown size={16}/>} label="ACESSÓRIOS" active={activeModule === 'ACESSORIO'} onClick={() => setActiveModule('ACESSORIO')} isLocked />
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#010307]">
          <div className="w-full p-6 space-y-8 pb-20">
            <div className="flex items-center gap-1 border-b border-slate-800/60 pb-4">
              <button onClick={() => setWeaponSubTab('LISTA')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${weaponSubTab === 'LISTA' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
                ARTEFATOS BÉLICOS
              </button>
              <button onClick={() => setWeaponSubTab('MATRIZ')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${weaponSubTab === 'MATRIZ' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
                MATRIZ DE AFINIDADE
              </button>
            </div>

            {weaponSubTab === 'LISTA' ? (
              <div className="space-y-8 w-full">
                <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500 w-full">
                  <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    {editingId ? <Edit3 size={14} className="text-amber-500" /> : <Plus size={14} className="text-blue-500" />} 
                    {editingId ? 'RECALIBRAR ARTEFATO' : 'NOVO ARTEFATO BÉLICO'}
                  </h3>
                  
                  <form onSubmit={handleSaveWeapon} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <FormGroup label="NOME DA ARMA" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Adaga de Presa de Lobo" />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="ATRIBUTO BASE" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={formData.atributo_principal} onChange={(v:any) => setFormData({...formData, atributo_principal:v})} />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="DANO INICIAL" type="number" value={formData.dano_base} onChange={(v:any) => setFormData({...formData, dano_base:v})} />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="NV. DESBLOQUEIO" type="number" value={formData.nivel_desbloqueio} onChange={(v:any) => setFormData({...formData, nivel_desbloqueio:v})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-800/50 pt-6">
                      <div className="md:col-span-2">
                        <FormGroup label="LEVEL MÍNIMO" type="number" value={formData.lvl_min} onChange={(v:any) => setFormData({...formData, lvl_min:v})} />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="LEVEL MÁXIMO (TETO)" type="number" value={formData.lvl_max} onChange={(v:any) => setFormData({...formData, lvl_max:v})} />
                      </div>
                      <div className="md:col-span-4">
                        <FormGroup label="MATERIAL DE UPGRADE" value={formData.material_upgrade} onChange={(v:any) => setFormData({...formData, material_upgrade:v})} placeholder="Ex: Pedra de Mana Comum" />
                      </div>
                      
                      <div className="md:col-span-4 flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-0.5">MANUAL UPLOAD (.PNG)</label>
                        <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full h-9 bg-slate-950 border border-slate-800 rounded-sm flex items-center px-4 cursor-pointer hover:border-blue-500 transition-all group overflow-hidden ${formData.img ? 'border-emerald-500/50' : ''} ${isUploading ? 'cursor-wait opacity-70' : ''}`}>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 truncate mr-2">
                              {isUploading ? <Loader2 size={14} className="text-blue-400 animate-spin" /> : formData.img ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Upload size={14} className="text-slate-600 group-hover:text-blue-400" />}
                              <span className={`text-[10px] font-bold truncate ${formData.img ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-300'}`}>{isUploading ? 'SINCRONIZANDO...' : formData.img ? 'UPLOAD CONCLUÍDO' : 'SELECIONAR ARQUIVO'}</span>
                            </div>
                            {formData.img && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={handleRemoveImage} className="p-1 hover:text-rose-500 text-slate-600 transition-colors" title="Remover Imagem"><ImageOff size={14} /></button>
                                <div className="w-6 h-6 rounded-sm border border-slate-800 overflow-hidden"><img src={formData.img} className="w-full h-full object-cover" /></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-800/50 pt-6">
                      <div className="md:col-span-4">
                        <FormGroup label="EFEITO PASSIVO" value={formData.efeito_especial} onChange={(v:any) => setFormData({...formData, efeito_especial:v})} placeholder="Ex: Sangramento" />
                      </div>
                      <div className="md:col-span-8">
                        <FormGroup label="DESCRIÇÃO DO EFEITO" value={formData.desc_efeito} onChange={(v:any) => setFormData({...formData, desc_efeito:v})} placeholder="Detalhes técnicos sobre os modificadores de realidade..." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-800/50 pt-6">
                      <div className="md:col-span-10">
                        <FormGroup label="HISTÓRIA DO ARTEFATO (LORE)" type="textarea" value={formData.historia} onChange={(v:any) => setFormData({...formData, historia:v})} placeholder="Narre as origens e feitos épicos deste armamento nas fendas dimensionais..." />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                         <button disabled={isSaving || isUploading} className={`w-full h-12 ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all rounded-sm disabled:opacity-50 shadow-lg`}>
                          {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="space-y-4 w-full">
                  <div className="bg-slate-900/40 border border-slate-800/40 h-10 flex items-center px-5 rounded-sm w-full">
                    <div className="w-[30%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-left">ARTEFATO</div>
                    <div className="w-[10%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">RANK</div>
                    <div className="w-[15%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">DESBLOQUEIO</div>
                    <div className="w-[15%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">DANO BASE</div>
                    <div className="w-[15%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">LEVEL TETO</div>
                    <div className="w-[15%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-right">AÇÕES</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.map((item) => {
                      const rankTheme = getRankClass(item.rank);
                      return (
                        <div key={item.id} className="bg-[#030712] border border-slate-800 h-20 flex items-center px-5 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full">
                          <div className={`absolute left-0 top-0 h-full w-1 ${rankTheme.border}`} />
                          <div className="w-[30%] flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.img ? <img src={item.img} className="w-full h-full object-cover" alt={item.nome} /> : <Sword size={20} className="text-slate-800" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[12px] font-black text-white uppercase italic tracking-tighter truncate pr-2">{item.nome}</h4>
                              <span className="text-[8px] font-black text-slate-600 uppercase">{item.atributo_principal}</span>
                            </div>
                          </div>
                          <div className={`w-[10%] text-[14px] font-black ${rankTheme.text} italic text-center`}>{item.rank}</div>
                          <div className="w-[15%] flex justify-center">
                             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-900/10 border border-blue-500/20 rounded-sm">
                                <LockKeyhole size={8} className="text-blue-500" />
                                <span className="text-[10px] font-black text-blue-400">NV.{item.nivel_desbloqueio}</span>
                             </div>
                          </div>
                          <div className="w-[15%] text-[11px] font-black text-emerald-400 tabular-nums text-center">{item.dano_base} ATK</div>
                          <div className="w-[15%] text-[11px] font-black text-slate-400 text-center">{item.lvl_min} <span className="text-[8px] text-slate-700 mx-1">→</span> {item.lvl_max}</div>
                          <div className="w-[15%] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => { setEditingId(item.id); setFormData({...item}); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 text-slate-600 hover:text-amber-500 transition-all" title="Editar"><Edit3 size={16}/></button>
                             <button onClick={() => deleteRecord('armas', item.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-all" title="Excluir"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ABA MATRIZ */
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 w-full">
                <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative overflow-hidden w-full">
                  <div className={`absolute top-0 left-0 w-1 h-full ${editingAffinityId ? 'bg-amber-500' : 'bg-purple-600'}`} />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    {editingAffinityId ? <Edit3 size={14} className="text-amber-500" /> : <Zap size={14} className="text-purple-500" />} 
                    {editingAffinityId ? 'MODULAR AFINIDADE' : 'REGISTRAR AFINIDADE TÁTICA'}
                  </h3>
                  
                  <form onSubmit={handleSaveAffinity} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
                        <FormGroup label="ATACANTE" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={affinityData.atacante} onChange={(v:any) => setAffinityData({...affinityData, atacante:v})} />
                      </div>
                      <div className="md:col-span-3">
                        <FormGroup label="DEFENSOR" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={affinityData.defensor} onChange={(v:any) => setAffinityData({...affinityData, defensor:v})} />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="VANTAGEM" type="select" options={['VANTAGEM','DESVANTAGEM','NEUTRO']} value={affinityData.vantagem} onChange={(v:any) => setAffinityData({...affinityData, vantagem:v})} />
                      </div>
                      <div className="md:col-span-2">
                        <FormGroup label="MULTIPLICADOR" type="number" value={affinityData.multiplicador} onChange={(v:any) => setAffinityData({...affinityData, multiplicador:v})} />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                         <button disabled={isSaving} className={`w-full h-9 ${editingAffinityId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-purple-600 hover:bg-purple-500'} text-white text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all rounded-sm shadow-lg disabled:opacity-50`}>
                          {isSaving ? <Loader2 className="animate-spin" size={12}/> : <Save size={12}/>} {editingAffinityId ? 'ATUALIZAR' : 'REGISTRAR'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <FormGroup label="LORE TÁTICO / DESCRIÇÃO" value={affinityData.lore} onChange={(v:any) => setAffinityData({...affinityData, lore:v})} placeholder="Ex: O peso da Força esmaga a Magia..." />
                    </div>
                  </form>
                </div>

                {/* MANTRA TÁTICO VISÍVEL */}
                <div className="bg-slate-900/40 border border-purple-500/20 p-4 rounded-sm flex items-center justify-center gap-12 overflow-hidden shadow-inner w-full">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2">ORDEM DE CONTRA-ATAQUE</span>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-sm group hover:border-blue-500 transition-all">
                        <Brain size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-white italic">INTELIGÊNCIA</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-600" />
                      <div className="flex items-center gap-3 px-4 py-2 bg-rose-900/20 border border-rose-500/30 rounded-sm group hover:border-rose-500 transition-all">
                        <Dumbbell size={18} className="text-rose-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-white italic">FORÇA</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-600" />
                      <div className="flex items-center gap-3 px-4 py-2 bg-emerald-900/20 border border-emerald-500/30 rounded-sm group hover:border-emerald-500 transition-all">
                        <Zap size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-white italic">AGILIDADE</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-600" />
                      <div className="flex items-center gap-3 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-sm group hover:border-blue-500 transition-all">
                        <Brain size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-white italic">INTELIGÊNCIA</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-3 border-l border-slate-800 pl-12">
                    <Repeat size={14} className="text-purple-500 animate-spin-slow" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-tight">O TRIÂNGULO HIERÁRQUICO<br/>É ABSOLUTO NO NEXUS.</p>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <div className="bg-slate-900/40 border border-slate-800/40 h-10 flex items-center px-5 rounded-sm w-full">
                    <div className="w-[30%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-left">MODULADOR TÁTICO (ATACANTE → DEFENSOR)</div>
                    <div className="w-[20%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">NATUREZA</div>
                    <div className="w-[15%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">MULTIPLICADOR</div>
                    <div className="w-[20%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">LORE / DESCRIÇÃO</div>
                    <div className="w-[15%] text-[8px] font-black text-slate-600 uppercase tracking-widest text-right">AÇÕES</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {affinities.map((aff) => {
                      const isVantage = aff.vantagem === 'VANTAGEM';
                      const isDisvantage = aff.vantagem === 'DESVANTAGEM';
                      const natureColor = isVantage ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : isDisvantage ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-slate-500 border-slate-800 bg-slate-900/20';

                      return (
                        <div key={aff.id} className="bg-[#030712] border border-slate-800 h-20 flex items-center px-5 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full">
                          <div className={`absolute left-0 top-0 h-full w-1 ${isVantage ? 'bg-emerald-500' : isDisvantage ? 'bg-rose-500' : 'bg-slate-800'}`} />
                          
                          <div className="w-[30%] flex items-center gap-4 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center flex-shrink-0">
                                {getAttributeIcon(aff.atacante)}
                              </div>
                              <ArrowRight size={14} className="text-slate-700" />
                              <div className="w-9 h-9 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center flex-shrink-0">
                                {getAttributeIcon(aff.defensor)}
                              </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter truncate">{aff.atacante} VS {aff.defensor}</h4>
                              <span className="text-[7px] font-black text-slate-600 uppercase">SINCRONIA OPERACIONAL</span>
                            </div>
                          </div>

                          <div className="w-[20%] flex justify-center">
                            <div className={`px-3 py-1 rounded-sm border text-[9px] font-black tracking-[0.1em] ${natureColor}`}>
                              {aff.vantagem}
                            </div>
                          </div>

                          <div className="w-[15%] flex justify-center">
                             <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 border rounded-sm ${isVantage ? 'border-emerald-500/30' : isDisvantage ? 'border-rose-500/30' : 'border-slate-800'}`}>
                                {isVantage ? <TrendingUp size={10} className="text-emerald-500" /> : isDisvantage ? <ShieldAlert size={10} className="text-rose-500" /> : <Target size={10} className="text-slate-600" />}
                                <span className={`text-[11px] font-black tabular-nums ${isVantage ? 'text-emerald-400' : isDisvantage ? 'text-rose-400' : 'text-slate-400'}`}>x{aff.multiplicador}</span>
                             </div>
                          </div>

                          <div className="w-[20%] px-4">
                            <p className="text-[10px] text-slate-500 font-medium italic line-clamp-2 leading-tight">
                              {aff.lore || 'Sem registro de lore tático.'}
                            </p>
                          </div>

                          <div className="w-[15%] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => { setEditingAffinityId(aff.id); setAffinityData({...aff}); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 text-slate-600 hover:text-amber-500 transition-all" title="Editar"><Edit3 size={16}/></button>
                             <button onClick={() => deleteRecord('afinidades', aff.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-all" title="Excluir"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminNavItem = ({ icon, label, active, onClick, isLocked }: any) => (
  <button 
    onClick={onClick}
    disabled={isLocked}
    className={`w-full flex items-center gap-3 px-4 py-4 rounded-sm transition-all border-l-2 ${
      active 
        ? 'bg-blue-600/10 border-blue-500 text-white shadow-[inset_10px_0_15px_-10px_rgba(59,130,246,0.2)]' 
        : 'border-transparent text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
    } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <span className={active ? 'text-blue-400' : ''}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-[0.15em] flex-1 text-left">{label}</span>
    {isLocked && <Lock size={12} className="opacity-60" />}
  </button>
);

const FormGroup = ({ label, type="text", value, onChange, options, placeholder }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-0.5">{label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-[10px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-9 uppercase font-black appearance-none group-hover:border-slate-600">
          {options.map((o:any) => <option key={o} value={o} className="bg-[#030712]">{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[10px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-700 font-bold transition-all min-h-[100px] resize-none hover:border-slate-600 custom-scrollbar" 
      />
    ) : (
      <input 
        type={type === 'number' ? 'number' : 'text'} 
        value={value} 
        step={type === 'number' ? '0.1' : undefined}
        onChange={(e) => {
          const val = e.target.value;
          if (type === 'number') {
            onChange(val === '' ? 0 : Number(val));
          } else {
            onChange(val);
          }
        }} 
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 px-4 py-2 text-[10px] text-white outline-none focus:border-blue-500 placeholder:text-slate-700 font-bold transition-all h-9 hover:border-slate-600" 
      />
    )}
  </div>
);

export default AdminSettings;
