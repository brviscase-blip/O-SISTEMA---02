
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sword, Trash2, Save, Loader2, Plus, Edit3, 
  Zap, Dumbbell, Brain, Target, ArrowRight,
  Upload, CheckCircle2, ImageOff, Repeat,
  ChevronDown, ArrowLeftRight, Skull, ShieldAlert, X
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
  switch (attr) {
    case 'FORÇA': return <Dumbbell size={size} className="text-white" />;
    case 'AGILIDADE': return <Zap size={size} className="text-white" />;
    case 'INTELIGÊNCIA': return <Brain size={size} className="text-white" />;
    default: return <Target size={size} className="text-white" />;
  }
};

const rankWeights: Record<string, number> = {
  'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1
};

const WeaponsNexus: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('LISTA');
  const [items, setItems] = useState<any[]>([]);
  const [affinities, setAffinities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAffinityId, setEditingAffinityId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    nome: '', rank: 'E', dano_base: 0, atributo_principal: 'FORÇA',
    efeito_especial: '', desc_efeito: '', nivel_desbloqueio: 1,
    lvl_min: 1, lvl_max: 10, material_upgrade: 'Pedra de Mana Comum',
    img: '', historia: '', boss_id: '', desafio_concluido: false
  };

  const initialAffinityState = {
    atacante: 'FORÇA', defensor: 'FORÇA', vantagem: 'NEUTRO', multiplicador: 1.0, lore: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [affinityData, setAffinityData] = useState(initialAffinityState);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      const { data: weapons } = await client.from('armas').select('*');
      const { data: affs } = await client.from('armas_afinidades').select('*').order('created_at', { ascending: false });
      
      const sorted = (weapons || []).sort((a, b) => (rankWeights[b.rank] || 0) - (rankWeights[a.rank] || 0));
      setItems(sorted);
      setAffinities(affs || []);
    } catch (err) {
      console.error("Erro Nexus Armas:", err);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `armas/${fileName}`;
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) {
      alert("Falha no Nexus Storage.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveWeapon = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client || !formData.nome.trim()) return;
    setIsSaving(true);
    try {
      const { id, created_at, ...cleanData } = formData as any;
      const payload = { ...cleanData, 
        dano_base: Number(cleanData.dano_base),
        nivel_desbloqueio: Number(cleanData.nivel_desbloqueio),
        lvl_min: Number(cleanData.lvl_min),
        lvl_max: Number(cleanData.lvl_max),
        desafio_concluido: Boolean(cleanData.desafio_concluido)
      };
      if (editingId) {
        await client.from('armas').update(payload).eq('id', editingId);
      } else {
        await client.from('armas').insert([payload]);
      }
      setFormData(initialFormState);
      setEditingId(null);
      fetchData();
      alert('Sincronização Concluída.');
    } catch (err) { alert('Erro na recalibração.'); }
    finally { setIsSaving(false); }
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
        await client.from('armas_afinidades').update(payload).eq('id', editingAffinityId);
      } else {
        await client.from('armas_afinidades').insert([payload]);
      }
      setAffinityData(initialAffinityState);
      setEditingAffinityId(null);
      fetchData();
      alert('Matriz Atualizada.');
    } catch (err) { alert('Erro na matriz.'); }
    finally { setIsSaving(false); }
  };

  const deleteRecord = async (table: string, id: string) => {
    if (!window.confirm("CONFIRMAR EXPURGO DEFINITIVO? ESTA AÇÃO NÃO PODE SER DESFEITA.")) return;
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
      alert("Registro Expurmado.");
    } catch (err) {
      alert("Erro ao apagar registro.");
    }
  };

  const cancelEdit = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const cancelAffinityEdit = () => {
    setAffinityData(initialAffinityState);
    setEditingAffinityId(null);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-1 border-b border-slate-800/60 pb-4">
        <button onClick={() => setSubTab('LISTA')} className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${subTab === 'LISTA' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}>
          ARTEFATOS BÉLICOS
        </button>
        <button onClick={() => setSubTab('MATRIZ')} className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${subTab === 'MATRIZ' ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}>
          MATRIZ DE AFINIDADE BÉLICA
        </button>
      </div>

      {subTab === 'LISTA' ? (
        <div className="space-y-8">
          <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative overflow-hidden shadow-2xl">
            <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              {editingId ? <Edit3 size={16} className="text-amber-500" /> : <Plus size={16} className="text-blue-500" />} 
              {editingId ? 'RECALIBRAR ARTEFATO' : 'REGISTRAR NOVA ARMA'}
            </h3>
            
            <form onSubmit={handleSaveWeapon} className="space-y-8">
              {/* LINHA 1: BÁSICOS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-5"><FormGroup label="NOME DA ARMA" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} /></div>
                <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="ATRIBUTO BASE" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={formData.atributo_principal} onChange={(v:any) => setFormData({...formData, atributo_principal:v})} /></div>
                <div className="md:col-span-2"><FormGroup label="DANO INICIAL" type="number" value={formData.dano_base} onChange={(v:any) => setFormData({...formData, dano_base:v})} /></div>
              </div>

              {/* LINHA 2: PROGRESSÃO E UPGRADE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                <div className="md:col-span-2"><FormGroup label="LEVEL MÍNIMO" type="number" value={formData.lvl_min} onChange={(v:any) => setFormData({...formData, lvl_min:v})} /></div>
                <div className="md:col-span-2"><FormGroup label="LEVEL MÁXIMO" type="number" value={formData.lvl_max} onChange={(v:any) => setFormData({...formData, lvl_max:v})} /></div>
                <div className="md:col-span-2"><FormGroup label="NV. DESBLOQUEIO" type="number" value={formData.nivel_desbloqueio} onChange={(v:any) => setFormData({...formData, nivel_desbloqueio:v})} /></div>
                <div className="md:col-span-3"><FormGroup label="MATERIAL DE REFINO" value={formData.material_upgrade} onChange={(v:any) => setFormData({...formData, material_upgrade:v})} /></div>
                <div className="md:col-span-3 flex flex-col gap-2">
                   <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">UPLOAD VISUAL (.PNG)</label>
                   <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`w-full h-10 bg-slate-950 border border-slate-800 rounded-sm flex items-center px-4 cursor-pointer hover:border-blue-500 transition-all ${formData.img ? 'border-emerald-500/50' : ''}`}>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <div className="flex items-center justify-between w-full">
                         <span className="text-[10px] font-bold text-slate-600">{isUploading ? 'SINCRONIZANDO...' : formData.img ? 'UPLOAD OK' : 'SELECIONAR'}</span>
                         {formData.img && <div className="w-7 h-7 rounded-sm border border-slate-800 overflow-hidden"><img src={formData.img} className="w-full h-full object-cover" /></div>}
                      </div>
                   </div>
                </div>
              </div>

              {/* LINHA 3: DESAFIOS E BOSS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                 <div className="md:col-span-4"><FormGroup label="ID DO BOSS (TRIAL)" value={formData.boss_id} onChange={(v:any) => setFormData({...formData, boss_id:v})} placeholder="Ex: boss-lycan-01" /></div>
                 <div className="md:col-span-2 flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <input type="checkbox" checked={formData.desafio_concluido} onChange={e => setFormData({...formData, desafio_concluido: e.target.checked})} className="hidden" />
                       <div className={`w-10 h-10 border rounded-sm flex items-center justify-center transition-all ${formData.desafio_concluido ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-900 border-slate-800'}`}>
                          {formData.desafio_concluido && <CheckCircle2 size={20} className="text-white" />}
                       </div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">Concluído</span>
                    </label>
                 </div>
                 <div className="md:col-span-3"><FormGroup label="EFEITO PASSIVO" value={formData.efeito_especial} onChange={(v:any) => setFormData({...formData, efeito_especial:v})} placeholder="Nome da Habilidade" /></div>
                 <div className="md:col-span-3"><FormGroup label="DESCRIÇÃO DO EFEITO" value={formData.desc_efeito} onChange={(v:any) => setFormData({...formData, desc_efeito:v})} placeholder="Detalhes técnicos..." /></div>
              </div>

              {/* LINHA 4: LORE / HISTÓRIA */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-800/50 pt-8">
                <div className="md:col-span-10"><FormGroup label="REGISTRO DE MEMÓRIA (LORE)" type="textarea" value={formData.historia} onChange={(v:any) => setFormData({...formData, historia:v})} /></div>
                <div className="md:col-span-2 flex flex-col gap-2 items-end">
                   <button disabled={isSaving || isUploading} className={`w-full h-[104px] ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white text-[11px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-3 transition-all rounded-sm shadow-xl active:scale-95`}>
                     {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                   </button>
                   {editingId && (
                     <button type="button" onClick={cancelEdit} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all rounded-sm">
                        CANCELAR
                     </button>
                   )}
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-4">
             {/* HEADER DA TABELA */}
             <div className="bg-slate-900/30 border border-slate-800/50 h-10 flex items-center px-6 rounded-sm w-full font-black text-[9px] text-slate-500 uppercase tracking-widest">
                <div className="w-[20%]">ARTEFATO</div>
                <div className="w-[15%] text-center">RANK/ATTR</div>
                <div className="w-[10%] text-center">DANO (INI)</div>
                <div className="w-[10%] text-center">TRIAL BOSS</div>
                <div className="w-[15%] text-center">LEVEL (MÍN X MÁX)</div>
                <div className="w-[20%]">EFEITO PASSIVO</div>
                <div className="w-[10%] text-right pr-4">AÇÕES</div>
             </div>

             <div className="flex flex-col gap-3">
                {items.map(item => {
                    const theme = getRankClass(item.rank);
                    return (
                      <div key={item.id} className="bg-[#030712] border border-slate-800 h-24 flex items-center px-6 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full shadow-lg">
                        <div className={`absolute left-0 top-0 h-full w-1 ${theme.border}`} />
                        
                        <div className="w-[20%] flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <Sword size={24} className="text-slate-800" />}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <h4 className="text-[12px] font-black text-white uppercase italic tracking-tighter truncate">{item.nome}</h4>
                              <span className="text-[8px] font-bold text-slate-600 uppercase mt-1">{item.material_upgrade}</span>
                           </div>
                        </div>

                        <div className="w-[15%] text-center flex flex-col items-center">
                            <span className={`text-lg font-black ${theme.text} italic drop-shadow-[0_0_8px_currentColor]`}>{item.rank}</span>
                            <div className="flex items-center gap-1.5 opacity-60">
                                {getAttributeIcon(item.atributo_principal, 10)}
                                <span className="text-[8px] font-black text-white uppercase">{item.atributo_principal}</span>
                            </div>
                        </div>

                        <div className="w-[10%] text-center">
                           <span className="text-[12px] font-black text-white italic">{item.dano_base} ATK</span>
                           <p className="text-[7px] text-slate-600 font-black uppercase">Poder Bélico</p>
                        </div>

                        <div className="w-[10%] text-center flex flex-col items-center">
                           <div className={`flex items-center gap-1 px-2 py-0.5 rounded-sm border ${item.boss_id ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 'border-slate-800 text-slate-700'}`}>
                              {item.boss_id ? <Skull size={10} /> : <Target size={10} />}
                              <span className="text-[8px] font-black uppercase truncate max-w-[60px]">{item.boss_id || 'N/A'}</span>
                           </div>
                           {item.desafio_concluido && <span className="text-[7px] text-emerald-500 font-bold uppercase mt-1">Sincronizada</span>}
                        </div>

                        <div className="w-[15%] text-center">
                           <span className="text-[11px] font-black text-slate-400 tabular-nums">{item.lvl_min} / {item.lvl_max}</span>
                           <p className="text-[7px] text-slate-600 font-black uppercase">Escala LVL</p>
                        </div>

                        <div className="w-[20%] px-4 border-l border-r border-slate-800/50">
                           <span className="text-[10px] font-black text-purple-400 uppercase tracking-tight block mb-1">{item.efeito_especial || 'Nenhum'}</span>
                           <p className="text-[9px] text-slate-500 italic line-clamp-2 leading-relaxed">{item.desc_efeito || 'Sem descrição.'}</p>
                        </div>

                        <div className="w-[10%] flex items-center justify-end gap-2 pr-2">
                           <button 
                             onClick={() => { 
                               setEditingId(item.id); 
                               setFormData({...item}); 
                               window.scrollTo({top: 0, behavior: 'smooth'}); 
                             }} 
                             className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-amber-500 hover:border-amber-500/40 transition-all"
                             title="Editar Arma"
                           >
                             <Edit3 size={16}/>
                           </button>
                           <button 
                             onClick={() => deleteRecord('armas', item.id)} 
                             className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-rose-500 hover:border-rose-500/40 transition-all"
                             title="Apagar Arma"
                           >
                             <Trash2 size={16}/>
                           </button>
                        </div>
                      </div>
                    );
                })}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-[#030712] border border-slate-800 p-6 rounded-sm relative overflow-hidden shadow-2xl">
            <div className={`absolute top-0 left-0 w-1 h-full ${editingAffinityId ? 'bg-amber-500' : 'bg-purple-600'}`} />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              {editingAffinityId ? <Edit3 size={16} className="text-amber-500" /> : <Zap size={16} className="text-purple-500" />} 
              {editingAffinityId ? 'MODULAR AFINIDADE' : 'REGISTRAR AFINIDADE TÁTICA'}
            </h3>
            <form onSubmit={handleSaveAffinity} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-3"><FormGroup label="ATACANTE" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={affinityData.atacante} onChange={(v:any) => setAffinityData({...affinityData, atacante:v})} /></div>
                  <div className="md:col-span-3"><FormGroup label="DEFENSOR" type="select" options={['FORÇA','AGILIDADE','INTELIGÊNCIA']} value={affinityData.defensor} onChange={(v:any) => setAffinityData({...affinityData, defensor:v})} /></div>
                  <div className="md:col-span-2"><FormGroup label="VANTAGEM" type="select" options={['FORTE','FRACO','NEUTRO']} value={affinityData.vantagem} onChange={(v:any) => setAffinityData({...affinityData, vantagem:v})} /></div>
                  <div className="md:col-span-2"><FormGroup label="MULTIPLICADOR" type="number" value={affinityData.multiplicador} onChange={(v:any) => setAffinityData({...affinityData, multiplicador:v})} /></div>
                  <div className="md:col-span-2 flex flex-col gap-2 items-end">
                     <button disabled={isSaving} className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase rounded-sm shadow-xl active:scale-95 disabled:opacity-50">SALVAR</button>
                     {editingAffinityId && (
                       <button type="button" onClick={cancelAffinityEdit} className="w-full py-1.5 bg-slate-800 text-[8px] font-black uppercase text-slate-500 rounded-sm">CANCELAR</button>
                     )}
                  </div>
               </div>
               <FormGroup label="LORE TÁTICO" type="textarea" value={affinityData.lore} onChange={(v:any) => setAffinityData({...affinityData, lore:v})} placeholder="Ex: A força bruta esmaga a fragilidade mágica..." />
            </form>
          </div>

          <div className="flex flex-col gap-3">
             {affinities.map(aff => (
                <div key={aff.id} className="bg-[#030712] border border-slate-800 min-h-[70px] flex items-center px-8 rounded-sm group hover:border-slate-600 transition-all shadow-lg py-3">
                   <div className="w-[30%] flex items-center gap-4">
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-sm">{getAttributeIcon(aff.atacante, 18)}</div>
                      <ArrowRight size={14} className="text-slate-700" />
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-sm">{getAttributeIcon(aff.defensor, 18)}</div>
                      <span className="text-[10px] font-black text-white uppercase italic ml-2">{aff.atacante} VS {aff.defensor}</span>
                   </div>
                   <div className="w-[20%] text-center">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 border rounded-sm ${aff.vantagem === 'FORTE' ? 'text-emerald-500 border-emerald-500/30' : aff.vantagem === 'FRACO' ? 'text-rose-500 border-rose-500/30' : 'text-slate-500 border-slate-800'}`}>{aff.vantagem}</span>
                   </div>
                   <div className="w-[10%] text-center text-white text-lg font-black italic">x{aff.multiplicador}</div>
                   <div className="w-[25%] px-8 border-l border-r border-slate-800/30">
                      <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-tight">{aff.lore || 'Sem lore técnico.'}</p>
                   </div>
                   <div className="w-[15%] flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingAffinityId(aff.id); 
                          setAffinityData({...aff}); 
                          window.scrollTo({top:0, behavior:'smooth'});
                        }} 
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-amber-500 transition-all"
                        title="Editar Afinidade"
                      >
                        <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={() => deleteRecord('armas_afinidades', aff.id)} 
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-rose-500 transition-all"
                        title="Apagar Afinidade"
                      >
                        <Trash2 size={16}/>
                      </button>
                   </div>
                </div>
             ))}
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

export default WeaponsNexus;
