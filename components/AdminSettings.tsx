
import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Database, Sword, Trash2, Save, X, 
  Loader2, Plus, AlertTriangle, ShieldCheck, 
  ChevronLeft, Shield, Box, Crown, Edit3, 
  Info, Sparkles, RotateCcw, ChevronDown, Zap, 
  Crosshair, BookOpen, ChevronRight, Dumbbell, 
  Brain, Zap as AgilityIcon, ArrowRight, ArrowLeftRight,
  ImageIcon, Layers, TrendingUp, LockKeyhole,
  Upload, CheckCircle2, ImageOff, ShieldAlert,
  Target, Swords, Repeat, ScrollText, Skull,
  Ghost, User
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

interface Props {
  onClose: () => void;
}

type AdminModule = 'ARMAS' | 'ARMADURAS' | 'ITEM' | 'ACESSORIO';
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
  const [subTab, setSubTab] = useState<SubTab>('LISTA');
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

  const initialWeaponForm = {
    nome: '', rank: 'E', dano_base: 0, atributo_principal: 'FORÇA', efeito_especial: '',
    desc_efeito: '', nivel_desbloqueio: 1, lvl_min: 1, lvl_max: 10,
    material_upgrade: 'Pedra de Mana Comum', img: '', historia: '', boss_id: '', desafio_concluido: false
  };

  const initialArmorForm = {
    nome: '', rank: 'E', set_nome: '', slot: 'Peitoral', bonus_status: '',
    nivel_desbloqueio: 1, boss_trial_id: '', concluido: false, historia_set: '',
    descricao_lore: '', material_upgrade: 'Couro de Lycan', img: ''
  };

  const initialAffinityState = {
    atacante: 'FORÇA', defensor: 'FORÇA', vantagem: 'NEUTRO', multiplicador: 1.0, lore: ''
  };

  const [weaponForm, setWeaponForm] = useState(initialWeaponForm);
  const [armorForm, setArmorForm] = useState(initialArmorForm);
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
        const sorted = (weapons || []).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
        setItems(sorted);
      } else if (activeModule === 'ARMADURAS') {
        const { data: armors } = await client.from('armaduras').select('*');
        const sorted = (armors || []).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
        setItems(sorted);
      }
      const { data: affs } = await client.from('afinidades').select('*').order('created_at', { ascending: false });
      setAffinities(affs || []);
    } catch (err) { 
      console.error("Erro ao sincronizar Nexus:", err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
    setEditingId(null);
    setWeaponForm(initialWeaponForm);
    setArmorForm(initialArmorForm);
  }, [isAuthenticated, activeModule]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    if (!client) return;
    setIsUploading(true);
    try {
      const bucket = activeModule === 'ARMAS' ? 'armas-imgs' : 'armas-imgs'; // Usando o mesmo bucket por enquanto ou criar um novo se preferir
      const folder = activeModule === 'ARMAS' ? 'armas' : 'armaduras';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      const { error: uploadError } = await client.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(filePath);
      
      if (activeModule === 'ARMAS') setWeaponForm(prev => ({ ...prev, img: publicUrl }));
      else setArmorForm(prev => ({ ...prev, img: publicUrl }));
    } catch (err) {
      alert("Falha ao subir imagem para o Nexus Storage.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    
    setIsSaving(true);
    try {
      const table = activeModule === 'ARMAS' ? 'armas' : 'armaduras';
      const currentForm = activeModule === 'ARMAS' ? weaponForm : armorForm;

      if (!currentForm.nome.trim()) return;

      const { id, created_at, ...cleanData } = currentForm as any;
      
      // Sanitização de tipos numéricos
      if (activeModule === 'ARMAS') {
        cleanData.dano_base = Number(cleanData.dano_base);
        cleanData.nivel_desbloqueio = Number(cleanData.nivel_desbloqueio);
        cleanData.lvl_min = Number(cleanData.lvl_min);
        cleanData.lvl_max = Number(cleanData.lvl_max);
      } else {
        cleanData.nivel_desbloqueio = Number(cleanData.nivel_desbloqueio);
      }

      if (editingId) {
        const { error } = await client.from(table).update(cleanData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await client.from(table).insert([cleanData]);
        if (error) throw error;
      }

      setWeaponForm(initialWeaponForm);
      setArmorForm(initialArmorForm);
      setEditingId(null);
      await fetchData();
      alert('Sincronização Concluída.');
    } catch (err: any) { 
      alert(`Falha: ${err.message}`); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleSaveAffinity = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    setIsSaving(true);
    try {
      const { id, created_at, ...cleanAff } = affinityData as any;
      const payload = { ...cleanAff, multiplicador: Number(cleanAff.multiplicador) };
      if (editingAffinityId) {
        await client.from('afinidades').update(payload).eq('id', editingAffinityId);
      } else {
        await client.from('afinidades').insert([payload]);
      }
      setAffinityData(initialAffinityState);
      setEditingAffinityId(null);
      await fetchData();
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

  return (
    <div className="fixed inset-0 z-[8000] bg-[#010307] flex flex-col font-sans overflow-hidden">
      {/* HEADER LOGIN / APP */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center">
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
      ) : (
        <>
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
                <AdminNavItem icon={<Shield size={16}/>} label="ARMADURAS" active={activeModule === 'ARMADURAS'} onClick={() => setActiveModule('ARMADURAS')} />
                <AdminNavItem icon={<Box size={16}/>} label="ITENS" active={activeModule === 'ITEM'} onClick={() => setActiveModule('ITEM')} isLocked />
                <AdminNavItem icon={<Crown size={16}/>} label="ACESSÓRIOS" active={activeModule === 'ACESSORIO'} onClick={() => setActiveModule('ACESSORIO')} isLocked />
              </nav>
            </aside>

            <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#010307]">
              <div className="w-full p-6 space-y-8 pb-20">
                <div className="flex items-center gap-1 border-b border-slate-800/60 pb-4">
                  <button onClick={() => setSubTab('LISTA')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${subTab === 'LISTA' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
                    {activeModule} REGISTRADOS
                  </button>
                  <button onClick={() => setSubTab('MATRIZ')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${subTab === 'MATRIZ' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
                    MATRIZ DE AFINIDADE
                  </button>
                </div>

                {subTab === 'LISTA' ? (
                  <div className="space-y-8 w-full">
                    {/* FORMULÁRIO DINÂMICO */}
                    <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500 w-full">
                      <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        {editingId ? <Edit3 size={14} className="text-amber-500" /> : <Plus size={14} className="text-blue-500" />} 
                        {editingId ? 'RECALIBRAR' : 'NOVO'} {activeModule}
                      </h3>
                      
                      <form onSubmit={handleSaveItem} className="space-y-6">
                        {activeModule === 'ARMAS' ? (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-5"><FormGroup label="NOME" value={weaponForm.nome} onChange={(v:any) => setWeaponForm({...weaponForm, nome:v})} /></div>
                            <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={weaponForm.rank} onChange={(v:any) => setWeaponForm({...weaponForm, rank:v})} /></div>
                            <div className="md:col-span-3"><FormGroup label="ATRIBUTO" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={weaponForm.atributo_principal} onChange={(v:any) => setWeaponForm({...weaponForm, atributo_principal:v})} /></div>
                            <div className="md:col-span-2"><FormGroup label="DANO" type="number" value={weaponForm.dano_base} onChange={(v:any) => setWeaponForm({...weaponForm, dano_base:v})} /></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4"><FormGroup label="NOME DA PEÇA" value={armorForm.nome} onChange={(v:any) => setArmorForm({...armorForm, nome:v})} /></div>
                            <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={armorForm.rank} onChange={(v:any) => setArmorForm({...armorForm, rank:v})} /></div>
                            <div className="md:col-span-3"><FormGroup label="SLOT" type="select" options={['Cabeça','Peitoral','Mãos','Pernas','Pés','Anel']} value={armorForm.slot} onChange={(v:any) => setArmorForm({...armorForm, slot:v})} /></div>
                            <div className="md:col-span-3"><FormGroup label="NOME DO SET" value={armorForm.set_nome} onChange={(v:any) => setArmorForm({...armorForm, set_nome:v})} /></div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-800/50 pt-6">
                          {activeModule === 'ARMAS' ? (
                            <>
                              <div className="md:col-span-2"><FormGroup label="LEVEL MÍN" type="number" value={weaponForm.lvl_min} onChange={(v:any) => setWeaponForm({...weaponForm, lvl_min:v})} /></div>
                              <div className="md:col-span-2"><FormGroup label="LEVEL MÁX" type="number" value={weaponForm.lvl_max} onChange={(v:any) => setWeaponForm({...weaponForm, lvl_max:v})} /></div>
                              <div className="md:col-span-2"><FormGroup label="NV. DESBLOQUEIO" type="number" value={weaponForm.nivel_desbloqueio} onChange={(v:any) => setWeaponForm({...weaponForm, nivel_desbloqueio:v})} /></div>
                              <div className="md:col-span-3"><FormGroup label="MATERIAL" value={weaponForm.material_upgrade} onChange={(v:any) => setWeaponForm({...weaponForm, material_upgrade:v})} /></div>
                            </>
                          ) : (
                            <>
                              <div className="md:col-span-3"><FormGroup label="BÔNUS STATUS" value={armorForm.bonus_status} onChange={(v:any) => setArmorForm({...armorForm, bonus_status:v})} placeholder="Ex: +20 Vitalidade" /></div>
                              <div className="md:col-span-2"><FormGroup label="NV. DESBLOQUEIO" type="number" value={armorForm.nivel_desbloqueio} onChange={(v:any) => setArmorForm({...armorForm, nivel_desbloqueio:v})} /></div>
                              <div className="md:col-span-3"><FormGroup label="ID BOSS TRIAL" value={armorForm.boss_trial_id} onChange={(v:any) => setArmorForm({...armorForm, boss_trial_id:v})} /></div>
                              <div className="md:col-span-1 flex items-center gap-2 pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={armorForm.concluido} onChange={e => setArmorForm({...armorForm, concluido: e.target.checked})} className="hidden" />
                                  <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${armorForm.concluido ? 'bg-emerald-600 border-emerald-500' : 'border-slate-800 bg-slate-950'}`}>
                                    {armorForm.concluido && <CheckCircle2 size={10} className="text-white" />}
                                  </div>
                                </label>
                              </div>
                            </>
                          )}
                          
                          <div className="md:col-span-3 flex flex-col gap-1.5">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-0.5">UPLOAD VISUAL (.PNG)</label>
                            <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full h-9 bg-slate-950 border border-slate-800 rounded-sm flex items-center px-4 cursor-pointer hover:border-blue-500 transition-all ${(activeModule === 'ARMAS' ? weaponForm.img : armorForm.img) ? 'border-emerald-500/50' : ''}`}>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 truncate text-[10px] font-bold text-slate-500">
                                  {isUploading ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Upload size={14} />}
                                  {(activeModule === 'ARMAS' ? weaponForm.img : armorForm.img) ? 'UPLOAD OK' : 'SELECIONAR'}
                                </div>
                                {(activeModule === 'ARMAS' ? weaponForm.img : armorForm.img) && <div className="w-6 h-6 border border-slate-800 rounded-sm overflow-hidden"><img src={activeModule === 'ARMAS' ? weaponForm.img : armorForm.img} className="w-full h-full object-cover" /></div>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-800/50 pt-6">
                          <div className="md:col-span-5">
                            <FormGroup label={activeModule === 'ARMAS' ? "REGISTRO DE MEMÓRIA (LORE)" : "DESCRIÇÃO LORE (PEÇA)"} type="textarea" value={activeModule === 'ARMAS' ? weaponForm.historia : armorForm.descricao_lore} onChange={(v:any) => activeModule === 'ARMAS' ? setWeaponForm({...weaponForm, historia:v}) : setArmorForm({...armorForm, descricao_lore:v})} />
                          </div>
                          <div className="md:col-span-5">
                             <FormGroup label={activeModule === 'ARMAS' ? "EFEITO PASSIVO TÉCNICO" : "HISTÓRIA DO SET (6 PEÇAS)"} type="textarea" value={activeModule === 'ARMAS' ? weaponForm.efeito_especial : armorForm.historia_set} onChange={(v:any) => activeModule === 'ARMAS' ? setWeaponForm({...weaponForm, efeito_especial:v}) : setArmorForm({...armorForm, historia_set:v})} />
                          </div>
                          <div className="md:col-span-2 flex items-end">
                             <button disabled={isSaving || isUploading} className={`w-full h-12 ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all rounded-sm shadow-lg`}>
                               {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                             </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* LISTAGEM DE ITENS */}
                    <div className="space-y-4 w-full">
                      <div className="bg-slate-900/40 border border-slate-800/40 h-10 flex items-center px-5 rounded-sm w-full font-black text-[8px] text-slate-600 uppercase tracking-widest">
                        <div className="w-[20%]">IDENTIFICAÇÃO</div>
                        <div className="w-[10%] text-center">RANK</div>
                        <div className="w-[15%] text-center">{activeModule === 'ARMAS' ? 'PODER / ATTR' : 'SLOT / SET'}</div>
                        <div className="w-[15%] text-center">{activeModule === 'ARMAS' ? 'TRIAL BOSS' : 'STATUS BÔNUS'}</div>
                        <div className="w-[25%] px-4">LORE / EFEITOS</div>
                        <div className="w-[15%] text-right">AÇÕES</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {items.map((item) => {
                          const rankTheme = getRankClass(item.rank);
                          return (
                            <div key={item.id} className="bg-[#030712] border border-slate-800 h-24 flex items-center px-5 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full">
                              <div className={`absolute left-0 top-0 h-full w-1 ${rankTheme.border}`} />
                              
                              <div className="w-[20%] flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : activeModule === 'ARMAS' ? <Sword size={20} className="text-slate-800" /> : <Shield size={20} className="text-slate-800" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter truncate">{item.nome}</h4>
                                  <span className="text-[7px] font-bold text-slate-600 truncate">{item.material_upgrade}</span>
                                </div>
                              </div>

                              <div className="w-[10%] text-center">
                                 <span className={`text-[12px] font-black ${rankTheme.text} italic`}>{item.rank}</span>
                              </div>

                              <div className="w-[15%] text-center flex flex-col gap-1">
                                 {activeModule === 'ARMAS' ? (
                                   <>
                                     <span className="text-[11px] font-black text-white">{item.dano_base} ATK</span>
                                     <div className="flex items-center justify-center gap-1 opacity-60">
                                        {getAttributeIcon(item.atributo_principal)}
                                        <span className="text-[7px] font-black text-white uppercase">{item.atributo_principal}</span>
                                     </div>
                                   </>
                                 ) : (
                                   <>
                                     <span className="text-[10px] font-black text-blue-400 uppercase">{item.slot}</span>
                                     <span className="text-[7px] font-bold text-slate-600 uppercase">{item.set_nome}</span>
                                   </>
                                 )}
                              </div>

                              <div className="w-[15%] text-center">
                                 {activeModule === 'ARMAS' ? (
                                   <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-950/20 border border-rose-500/20 rounded-sm">
                                      <Skull size={8} className="text-rose-500" />
                                      <span className="text-[9px] font-black text-rose-400 uppercase">{item.boss_id || 'N/A'}</span>
                                   </div>
                                 ) : (
                                   <span className="text-[10px] font-black text-emerald-400">{item.bonus_status}</span>
                                 )}
                              </div>

                              <div className="w-[25%] px-4 border-l border-r border-slate-800/50">
                                 <p className="text-[8px] text-slate-500 italic line-clamp-3 leading-tight">
                                   {activeModule === 'ARMAS' ? (item.historia || item.efeito_especial) : (item.descricao_lore || item.historia_set)}
                                 </p>
                              </div>

                              <div className="w-[15%] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                 <button onClick={() => { 
                                    setEditingId(item.id); 
                                    if (activeModule === 'ARMAS') setWeaponForm({...item}); 
                                    else setArmorForm({...item});
                                    window.scrollTo({top:0, behavior:'smooth'}); 
                                 }} className="p-2 text-slate-600 hover:text-amber-500 transition-all"><Edit3 size={16}/></button>
                                 <button onClick={() => deleteRecord(activeModule === 'ARMAS' ? 'armas' : 'armaduras', item.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MATRIZ DE AFINIDADE (COMPARTILHADA) */
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 w-full">
                    <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative overflow-hidden w-full">
                      <div className={`absolute top-0 left-0 w-1 h-full ${editingAffinityId ? 'bg-amber-500' : 'bg-purple-600'}`} />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        {editingAffinityId ? <Edit3 size={14} className="text-amber-500" /> : <Zap size={14} className="text-purple-500" />} 
                        {editingAffinityId ? 'MODULAR AFINIDADE' : 'REGISTRAR AFINIDADE TÁTICA'}
                      </h3>
                      
                      <form onSubmit={handleSaveAffinity} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3"><FormGroup label="ATACANTE" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={affinityData.atacante} onChange={(v:any) => setAffinityData({...affinityData, atacante:v})} /></div>
                          <div className="md:col-span-3"><FormGroup label="DEFENSOR" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={affinityData.defensor} onChange={(v:any) => setAffinityData({...affinityData, defensor:v})} /></div>
                          <div className="md:col-span-2"><FormGroup label="VANTAGEM" type="select" options={['VANTAGEM','DESVANTAGEM','NEUTRO']} value={affinityData.vantagem} onChange={(v:any) => setAffinityData({...affinityData, vantagem:v})} /></div>
                          <div className="md:col-span-2"><FormGroup label="MULTIPLICADOR" type="number" value={affinityData.multiplicador} onChange={(v:any) => setAffinityData({...affinityData, multiplicador:v})} /></div>
                          <div className="md:col-span-2 flex items-end">
                             <button disabled={isSaving} className="w-full h-9 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase rounded-sm shadow-lg disabled:opacity-50">SALVAR</button>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                       {affinities.map(aff => (
                          <div key={aff.id} className="bg-[#030712] border border-slate-800 h-16 flex items-center px-5 rounded-sm w-full group">
                             <div className="w-[30%] flex items-center gap-3">
                                <div className="p-2 bg-slate-950 border border-slate-800 rounded-sm">{getAttributeIcon(aff.atacante)}</div>
                                <ArrowRight size={12} className="text-slate-600" />
                                <div className="p-2 bg-slate-950 border border-slate-800 rounded-sm">{getAttributeIcon(aff.defensor)}</div>
                             </div>
                             <div className="w-[20%] text-center"><span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded-sm ${aff.vantagem === 'VANTAGEM' ? 'text-emerald-500 border-emerald-500/30' : aff.vantagem === 'DESVANTAGEM' ? 'text-rose-500 border-rose-500/30' : 'text-slate-500 border-slate-800'}`}>{aff.vantagem}</span></div>
                             <div className="w-[20%] text-center text-white font-black italic">x{aff.multiplicador}</div>
                             <div className="w-[30%] flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => {setEditingAffinityId(aff.id); setAffinityData({...aff});}} className="p-2 text-slate-600 hover:text-amber-500"><Edit3 size={14}/></button>
                                <button onClick={() => deleteRecord('afinidades', aff.id)} className="p-2 text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </>
      )}
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
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[10px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-700 font-bold transition-all min-h-[80px] resize-none hover:border-slate-600 custom-scrollbar" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value} step={type === 'number' ? '0.1' : undefined} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-4 py-2 text-[10px] text-white outline-none focus:border-blue-500 placeholder:text-slate-700 font-bold transition-all h-9 hover:border-slate-600" />
    )}
  </div>
);

export default AdminSettings;
