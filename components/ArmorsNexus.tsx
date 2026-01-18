import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Trash2, Save, Loader2, Plus, Edit3, 
  CheckCircle2, ChevronDown, X,
  Dumbbell, Zap, Brain, Activity, Eye,
  Package, HardDrive, LayoutGrid, Info,
  Search, ExternalLink, ShieldCheck, Upload
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import { ItemRank, ArmorSet } from '../types';

const STANDARD_SLOTS = ['CABEÇA', 'PEITORAL', 'MÃOS', 'PERNAS', 'PÉS', 'ANEL'];

const getRankClass = (rank: string) => {
  switch (String(rank).toUpperCase()) {
    case 'S': return { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/5', glow: 'shadow-rose-500/20' };
    case 'A': return { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/5', glow: 'shadow-amber-500/20' };
    case 'B': return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/5', glow: 'shadow-purple-500/20' };
    case 'C': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/5', glow: 'shadow-blue-500/20' };
    case 'D': return { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/5', glow: 'shadow-emerald-500/20' };
    case 'E': return { border: 'border-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/5', glow: 'shadow-slate-500/20' };
    default: return { border: 'border-slate-800', text: 'text-slate-400', bg: 'bg-transparent', glow: '' };
  }
};

const ArmorsNexus: React.FC = () => {
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [pieces, setPieces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<ArmorSet | null>(null);

  // Form de Conjunto (Master)
  const initialSetState = { nome: '', rank: 'E' as ItemRank, descricao_lore: '', nivel_desbloqueio: 1, img: '' };
  const [setFormData, setSetFormData] = useState(initialSetState);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      const { data: setsData } = await client.from('conjuntos_armadura').select('*').order('created_at', { ascending: false });
      const { data: piecesData } = await client.from('armaduras').select('*');
      setSets(setsData || []);
      setPieces(piecesData || []);
      
      // Se houver um set selecionado no modal, atualiza ele também para refletir mudanças nas peças
      if (selectedSet) {
        const updated = (setsData || []).find(s => s.id === selectedSet.id);
        if (updated) setSelectedSet(updated);
      }
    } catch (err) {
      console.error("Erro Nexus Armaduras:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSet = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client || !setFormData.nome.trim()) return;
    setIsSaving(true);
    try {
      if (editingSetId) {
        await client.from('conjuntos_armadura').update(setFormData).eq('id', editingSetId);
      } else {
        await client.from('conjuntos_armadura').insert([setFormData]);
      }
      setSetFormData(initialSetState);
      setEditingSetId(null);
      fetchData();
    } catch (err) { alert('Falha ao sincronizar conjunto.'); }
    finally { setIsSaving(false); }
  };

  const deleteSet = async (id: string) => {
    if (!window.confirm("EXPURGAR CONJUNTO MESTRE?")) return;
    const client = getSupabaseClient();
    if (!client) return;
    await client.from('conjuntos_armadura').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-40">
      {/* HEADER TÉCNICO */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Nexus de Armaduras</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Hierarquia Master-Detail Ativa</p>
        </div>
        <div className="flex items-center gap-3 bg-[#030712] border border-slate-800 p-3 rounded-sm">
           <LayoutGrid size={14} className="text-blue-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sets.length} Conjuntos Detectados</span>
        </div>
      </div>

      {/* REGISTRO DE MESTRE */}
      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingSetId ? 'bg-amber-500' : 'bg-blue-600'}`} />
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
          <Package size={18} className="text-blue-500" /> {editingSetId ? 'RECALIBRAR CONJUNTO' : 'REGISTRAR CONJUNTO MESTRE'}
        </h3>
        
        <form onSubmit={handleSaveSet} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5"><FormGroup label="NOME DO CONJUNTO" value={setFormData.nome} onChange={(v:any) => setSetFormData({...setFormData, nome:v})} placeholder="Ex: Set do Monarca das Sombras" /></div>
            <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={setFormData.rank} onChange={(v:any) => setSetFormData({...setFormData, rank:v})} /></div>
            <div className="md:col-span-2"><FormGroup label="LVL DESBLOQUEIO" type="number" value={setFormData.nivel_desbloqueio} onChange={(v:any) => setSetFormData({...setFormData, nivel_desbloqueio:v})} /></div>
            <div className="md:col-span-3 pt-6">
              <button type="submit" disabled={isSaving} className={`w-full h-12 ${editingSetId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase transition-all rounded-sm shadow-xl active:scale-95 flex items-center justify-center gap-2`}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : editingSetId ? <Save size={18} /> : <Plus size={18} />}
                {editingSetId ? 'ATUALIZAR' : 'CRIAR CONJUNTO'}
              </button>
            </div>
          </div>
          <FormGroup label="HISTÓRIA E LORE DO SET (HERDADO PELAS PEÇAS)" type="textarea" value={setFormData.descricao_lore} onChange={(v:any) => setSetFormData({...setFormData, descricao_lore:v})} placeholder="Descreva a origem mística deste conjunto..." />
        </form>
      </div>

      {/* LISTA DE CONJUNTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets.map(set => {
          const theme = getRankClass(set.rank);
          const setPieces = pieces.filter(p => p.conjunto_id === set.id);
          return (
            <div key={set.id} className={`bg-[#030712] border-2 rounded-sm p-6 transition-all hover:scale-[1.02] cursor-pointer group flex flex-col ${theme.border} ${theme.bg}`} onClick={() => setSelectedSet(set)}>
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{set.nome}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>RANK {set.rank}</span>
                 </div>
                 <div className="p-2 bg-black/40 rounded-sm border border-slate-800">
                    <Package size={18} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                 </div>
              </div>
              
              <div className="flex-1">
                 <p className="text-[10px] text-slate-500 italic line-clamp-3 leading-relaxed mb-6">{set.descricao_lore || 'Sem registros históricos.'}</p>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-600 uppercase">Peças</span>
                    <span className="text-xs font-black text-white tabular-nums">{setPieces.length} / 6</span>
                 </div>
                 <div className="flex items-center gap-2">
                    {/* Fixed line 153: Map ArmorSet properties to setFormData state shape to avoid TypeScript errors with optional fields and extra properties */}
                    <button onClick={(e) => { e.stopPropagation(); setEditingSetId(set.id); setSetFormData({ nome: set.nome, rank: set.rank, descricao_lore: set.descricao_lore, nivel_desbloqueio: set.nivel_desbloqueio, img: set.img || '' }); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 text-slate-500 hover:text-amber-500"><Edit3 size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteSet(set.id); }} className="p-2 text-slate-500 hover:text-rose-500"><Trash2 size={14}/></button>
                    <div className="p-2 bg-blue-600/10 rounded-sm text-blue-500"><ChevronDown size={14} className="-rotate-90" /></div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALHES (DETAIL VIEW) */}
      {selectedSet && (
        <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
           {/* Header do Modal */}
           <div className="bg-[#030712] border-b border-slate-800 p-8 flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className={`w-20 h-20 border-2 rounded-sm flex items-center justify-center bg-black/40 ${getRankClass(selectedSet.rank).border}`}>
                    {selectedSet.img ? <img src={selectedSet.img} className="w-full h-full object-cover" /> : <Shield size={40} className="text-slate-800" />}
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedSet.nome}</h2>
                    <div className="flex items-center gap-6 mt-3">
                       <span className={`text-sm font-black tracking-[0.3em] ${getRankClass(selectedSet.rank).text}`}>RANK {selectedSet.rank}</span>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-l border-slate-800 pl-6">LVL REQUERIDO: {selectedSet.nivel_desbloqueio}</span>
                       <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest border-l border-slate-800 pl-6">MASTER CORE ATIVO</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedSet(null)} className="p-4 bg-slate-900 border border-slate-800 rounded-sm text-slate-500 hover:text-white transition-all">
                <X size={32} />
              </button>
           </div>

           {/* Corpo do Modal - Grid de Peças */}
           <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-12">
                 <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-sm">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 flex items-center gap-2"><Info size={14} /> Memória do Conjunto</h4>
                    <p className="text-sm text-slate-400 italic leading-relaxed">{selectedSet.descricao_lore}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {STANDARD_SLOTS.map(slotName => (
                      <PieceSlotForm 
                        key={`${selectedSet.id}-${slotName}`} 
                        set={selectedSet} 
                        slotName={slotName} 
                        existingPiece={pieces.find(p => p.conjunto_id === selectedSet.id && p.slot === slotName)}
                        onSaved={fetchData}
                      />
                    ))}
                 </div>
              </div>
           </div>

           {/* Footer do Modal */}
           <div className="bg-[#030712] border-t border-slate-800 p-6 flex justify-center">
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Sistema de Sincronia Dimensional v2.5</p>
           </div>
        </div>
      )}
    </div>
  );
};

// Componente de Slot Interno (O "Quadrado")
const PieceSlotForm = ({ set, slotName, existingPiece, onSaved }: { set: any, slotName: string, existingPiece: any, onSaved: () => void }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: existingPiece?.nome || `${set.nome} (${slotName})`,
    rank: set.rank, 
    slot: slotName,
    atributo: existingPiece?.atributo || 'VITALIDADE',
    bonus_label: existingPiece?.bonus_status || '',
    bonus_target: existingPiece?.bonus ? Object.keys(existingPiece.bonus)[0]?.toUpperCase() : 'HP',
    bonus_value: existingPiece?.bonus ? Object.values(existingPiece.bonus)[0] : 0,
    vantagem_defensiva: existingPiece?.vantagem_defensiva || 'NENHUMA',
    fraqueza_defensiva: existingPiece?.fraqueza_defensiva || 'NENHUMA',
    descricao_lore: existingPiece?.descricao_lore || set.descricao_lore,
    img: existingPiece?.img || ''
  });

  const handleSave = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsSaving(true);
    try {
      const statMap: Record<string, string> = {
          'FORÇA': 'strength', 'AGILIDADE': 'agility', 'INTELIGÊNCIA': 'intelligence',
          'VITALIDADE': 'vitality', 'PERCEPÇÃO': 'perception', 'HP': 'hp', 'MP': 'mp'
      };
      const finalValue = Number(formData.bonus_value) || 0;
      const targetStat = statMap[formData.bonus_target] || 'hp';

      const payload = {
        nome: formData.nome,
        rank: set.rank, 
        slot: slotName,
        atributo: formData.atributo,
        bonus_status: formData.bonus_label || `+${finalValue} ${formData.bonus_target}`,
        bonus: { [targetStat]: finalValue },
        vantagem_defensiva: formData.vantagem_defensiva,
        fraqueza_defensiva: formData.fraqueza_defensiva,
        descricao_lore: formData.descricao_lore,
        img: formData.img,
        conjunto_id: set.id
      };

      if (existingPiece) {
        await client.from('armaduras').update(payload).eq('id', existingPiece.id);
      } else {
        await client.from('armaduras').insert([payload]);
      }
      onSaved();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    if (!client) return;
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_piece.${file.name.split('.').pop()}`;
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(`armaduras/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(`armaduras/${fileName}`);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) { alert("Erro de Upload."); }
    finally { setIsUploading(false); }
  };

  const theme = getRankClass(set.rank);

  return (
    <div className={`p-6 bg-black/40 border rounded-sm transition-all flex flex-col gap-6 relative group ${existingPiece ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-slate-800'}`}>
      {/* Header Slot */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
           <div className={`w-3 h-3 rounded-full ${existingPiece ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
           <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{slotName}</span>
        </div>
        {existingPiece && <ShieldCheck size={16} className="text-emerald-500" />}
      </div>

      <div className="flex gap-5">
         <div onClick={() => !isUploading && fileInputRef.current?.click()} className="w-20 h-20 bg-slate-950 border border-slate-800 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden shrink-0 shadow-inner">
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
           {formData.img ? <img src={formData.img} className="w-full h-full object-cover" /> : <Upload size={24} className="text-slate-800" />}
         </div>
         <div className="flex-1 space-y-2">
            <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-transparent border-b border-slate-800 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-colors py-2" placeholder="Nome da Peça" />
            <div className="flex items-center gap-2">
               <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${theme.border} text-white`}>{set.rank}</span>
               <span className="text-[8px] font-bold text-slate-600 uppercase">Herança Master</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5">
           <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Bônus UI</label>
           <input value={formData.bonus_label} onChange={e => setFormData({...formData, bonus_label: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 font-bold px-3 py-2 rounded-sm outline-none focus:border-emerald-500" placeholder="+15 Mana" />
         </div>
         <div className="space-y-1.5">
           <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Real</label>
           <div className="flex bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
              <input type="number" value={formData.bonus_value as any} onChange={e => setFormData({...formData, bonus_value: Number(e.target.value)})} className="w-1/2 bg-transparent text-[10px] text-white px-3 py-2 outline-none font-bold tabular-nums" />
              <select value={formData.bonus_target} onChange={e => setFormData({...formData, bonus_target: e.target.value})} className="w-1/2 bg-slate-900 text-[9px] text-slate-400 font-black px-2 outline-none uppercase border-l border-slate-800">
                {['HP','MP','FORÇA','AGILIDADE','INTELIGÊNCIA','VITALIDADE','PERCEPÇÃO'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Vantagem</label>
            <select value={formData.vantagem_defensiva} onChange={e => setFormData({...formData, vantagem_defensiva: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-[9px] text-slate-300 px-3 py-2 rounded-sm outline-none uppercase font-bold">
              {['NENHUMA','CORTE','ATRITO','PERFURAÇÃO','INSTABILIDADE'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
         </div>
         <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Fraqueza</label>
            <select value={formData.fraqueza_defensiva} onChange={e => setFormData({...formData, fraqueza_defensiva: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-[9px] text-slate-300 px-3 py-2 rounded-sm outline-none uppercase font-bold">
              {['NENHUMA','IMPACTO','FOGO','GELO','MALDIÇÃO'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
         </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving || isUploading}
        className={`w-full py-3 ${existingPiece ? 'bg-slate-900 border-emerald-500/30 text-emerald-500' : 'bg-blue-600 text-white'} border rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-125 flex items-center justify-center gap-2 active:scale-95 shadow-lg`}
      >
        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <HardDrive size={14} />}
        {existingPiece ? 'ATUALIZAR DADOS' : 'FORJAR PEÇA'}
      </button>
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-4 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer uppercase font-black appearance-none group-hover:border-slate-600 shadow-inner">
          {options.map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-5 text-[12px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-900 font-bold transition-all min-h-[120px] resize-none hover:border-slate-600 custom-scrollbar shadow-inner leading-relaxed" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value as any} step={type === 'number' ? '1' : undefined} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-4 text-[11px] text-white outline-none focus:border-blue-500 placeholder:text-slate-900 font-black transition-all hover:border-slate-600 shadow-inner italic uppercase" />
    )}
  </div>
);

export default ArmorsNexus;