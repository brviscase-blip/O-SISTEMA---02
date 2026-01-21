import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Trash2, Save, Loader2, Plus, Edit3, 
  CheckCircle2, ChevronDown, X,
  Dumbbell, Zap, Brain, Activity, Eye,
  Package, HardDrive, LayoutGrid, Info,
  Search, ExternalLink, ShieldCheck, Upload, ScrollText,
  Skull, Target, FileSpreadsheet
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import { ItemRank, ArmorSet } from '../types';
import * as XLSX from 'xlsx';

const STANDARD_SLOTS = ['CABEÇA', 'PEITORAL', 'MÃOS', 'PERNAS', 'PÉS', 'ANEL'];

const VANTAGEM_OPTIONS = [
  'NENHUMA', 
  'MOVIMENTO', 
  'IMPACTO', 
  'DEFESA FÍSICA', 
  'QUEDA', 
  'VELOCIDADE', 
  'EXAUSTÃO',
  'SOM (RUÍDOS)', 
  'CORTE', 
  'ATRITO', 
  'PERFURAÇÃO', 
  'TERRENO IRREGULAR', 
  'INSTABILIDADE'
];

const FRAQUEZA_OPTIONS = [
  'NENHUMA', 
  'ATAQUE SURPRESA', 
  'PERFURAÇÃO', 
  'ELETRICIDADE', 
  'CORTES LATERAIS', 
  'ARMADILHAS', 
  'MAGIA BRANCA',
  'LUZ (CLARÃO)', 
  'IMPACTO', 
  'FOGO', 
  'GELO', 
  'LAMA', 
  'MALDIÇÃO'
];

const UI_TO_DB_STAT: Record<string, string> = {
  'FORÇA': 'strength', 'AGILIDADE': 'agility', 'INTELIGÊNCIA': 'intelligence',
  'VITALIDADE': 'vitality', 'PERCEPÇÃO': 'perception', 'HP': 'hp', 'MP': 'mp'
};

const DB_TO_UI_STAT: Record<string, string> = {
  'strength': 'FORÇA', 'agility': 'AGILIDADE', 'intelligence': 'INTELIGÊNCIA',
  'vitality': 'VITALIDADE', 'perception': 'PERCEPÇÃO', 'hp': 'HP', 'mp': 'MP'
};

const getRankClass = (rank: string) => {
  switch (String(rank || 'E').toUpperCase()) {
    case 'S': return { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/5', glow: 'shadow-rose-500/20' };
    case 'A': return { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/5', glow: 'shadow-amber-500/20' };
    case 'B': return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/5', glow: 'shadow-purple-500/20' };
    case 'C': return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' };
    case 'D': return { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/5', glow: 'shadow-emerald-500/20' };
    case 'E': return { border: 'border-slate-500', text: 'text-slate-500', bg: 'bg-slate-500/5', glow: 'shadow-emerald-500/20' };
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

  const initialSetState = { 
    nome: '', 
    rank: 'E' as ItemRank, 
    descricao_lore: '', 
    nivel_desbloqueio: 1, 
    img: '',
    boss_id: '',
    desafio_concluido: false
  };
  const [setFormData, setSetFormData] = useState(initialSetState);

  const fetchData = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setIsLoading(true);
    try {
      const { data: setsData, error: setsError } = await client.from('conjuntos_armadura').select('*').order('created_at', { ascending: false });
      if (setsError) throw setsError;
      
      const { data: piecesData, error: piecesError } = await client.from('armaduras').select('*');
      if (piecesError) throw piecesError;

      setSets(setsData || []);
      setPieces(piecesData || []);
      
      if (selectedSet) {
        const updated = (setsData || []).find(s => s.id === selectedSet.id);
        if (updated) setSelectedSet(updated);
      }
    } catch (err: any) {
      console.error("Erro Nexus Armaduras:", err);
      // CORREÇÃO: Extração robusta de mensagem de erro
      const errorMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      
      if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
        alert("ERRO CRÍTICO: Tabelas de armaduras não encontradas no banco. Por favor, execute o script SQL de criação.");
      } else {
        alert("FALHA DE SINCRONIA: " + errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const setsExport = sets.map(s => ({
      'ID': s.id,
      'NOME CONJUNTO': s.nome,
      'RANK': s.rank,
      'LVL DESBLOQUEIO': s.nivel_desbloqueio,
      'TRIAL BOSS ID': s.boss_id || 'N/A',
      'TRIAL CONCLUÍDO': s.desafio_concluido ? 'SIM' : 'NÃO',
      'LORE': s.descricao_lore
    }));
    const wsSets = XLSX.utils.json_to_sheet(setsExport);
    XLSX.utils.book_append_sheet(wb, wsSets, "Conjuntos_Armadura");

    const piecesExport = pieces.map(p => {
      const parent = sets.find(s => s.id === p.conjunto_id);
      return {
        'CONJUNTO': parent?.nome || 'Órfão',
        'NOME PEÇA': p.nome,
        'SLOT': p.slot,
        'RANK': p.rank,
        'STATUS BÔNUS': p.bonus_status,
        'VANTAGEM': p.vantagem_defensiva,
        'FRAQUEZA': p.fraqueza_defensiva,
        'DESCRIÇÃO': p.descricao_lore
      };
    });
    const wsPieces = XLSX.utils.json_to_sheet(piecesExport);
    XLSX.utils.book_append_sheet(wb, wsPieces, "Peças_Individuais");

    XLSX.writeFile(wb, "Nexus_Armaduras_Master.xlsx");
  };

  const handleSaveSet = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client || !setFormData.nome.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        nome: setFormData.nome.trim(),
        rank: setFormData.rank,
        descricao_lore: String(setFormData.descricao_lore || ''),
        nivel_desbloqueio: Number(setFormData.nivel_desbloqueio),
        img: setFormData.img || null,
        boss_id: setFormData.boss_id?.trim() || null,
        desafio_concluido: Boolean(setFormData.desafio_concluido)
      };

      if (editingSetId) {
        const { error } = await client.from('conjuntos_armadura').update(payload).eq('id', editingSetId);
        if (error) throw error;
      } else {
        const { error } = await client.from('conjuntos_armadura').insert([payload]);
        if (error) throw error;
      }
      setSetFormData(initialSetState);
      setEditingSetId(null);
      fetchData();
      alert('Conjunto Mestre Sincronizado.');
    } catch (err: any) { 
      alert('Falha ao salvar: ' + (err.message || 'Erro desconhecido')); 
    } finally { setIsSaving(false); }
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Nexus de Armaduras</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Protocolo de Defesa e Sincronia de Trajes</p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-600/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-sm">
            <FileSpreadsheet size={16} /> Exportar Banco (XLSX)
          </button>
          <div className="flex items-center gap-3 bg-[#030712] border border-slate-800 p-3 rounded-sm shadow-inner">
            <LayoutGrid size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sets.length} Conjuntos Ativos</span>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE CONJUNTO */}
      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingSetId ? 'bg-amber-500' : 'bg-blue-600'}`} />
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
          <Package size={18} className="text-blue-500" /> {editingSetId ? 'RECALIBRAR CONJUNTO MESTRE' : 'REGISTRAR NOVA MATRIZ DE ARMADURA'}
        </h3>
        
        <form onSubmit={handleSaveSet} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5"><FormGroup label="NOME DO CONJUNTO" value={setFormData.nome} onChange={(v:any) => setSetFormData({...setFormData, nome:v})} placeholder="Ex: Traje do Monarca" /></div>
            <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={['S','A','B','C','D','E']} value={setFormData.rank} onChange={(v:any) => setSetFormData({...setFormData, rank:v})} /></div>
            <div className="md:col-span-2"><FormGroup label="LVL DESBLOQUEIO" type="number" value={setFormData.nivel_desbloqueio} onChange={(v:any) => setSetFormData({...setFormData, nivel_desbloqueio:v})} /></div>
            
            <div className="md:col-span-3 pt-6">
              <button type="submit" disabled={isSaving} className={`w-full h-12 ${editingSetId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white text-[11px] font-black uppercase transition-all rounded-sm shadow-xl active:scale-95 flex items-center justify-center gap-2`}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : editingSetId ? <Save size={18} /> : <Plus size={18} />}
                {editingSetId ? 'SINCRONIZAR' : 'CRIAR MATRIZ'}
              </button>
            </div>
          </div>
          <FormGroup label="MEMÓRIAS E PROPRIEDADES DO SET" type="textarea" value={setFormData.descricao_lore} onChange={(v:any) => setSetFormData({...setFormData, descricao_lore:v})} placeholder="A origem histórica deste artefato defensivo..." />
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
              
              <div className="flex-1 min-h-[60px]">
                 <p className="text-[10px] text-slate-500 italic line-clamp-3 leading-relaxed mb-6">{String(set.descricao_lore || 'Registro de lore pendente.')}</p>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-600 uppercase">Modularidade</span>
                    <span className="text-xs font-black text-white tabular-nums">{setPieces.length} / 6 PEÇAS</span>
                 </div>
                 <div className="flex items-center gap-2">
                    {/* Fixed: Explicitly map ArmorSet fields to form state to handle optional properties and avoid type errors */}
                    <button onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingSetId(set.id); 
                      setSetFormData({
                        nome: set.nome,
                        rank: set.rank,
                        descricao_lore: set.descricao_lore || '',
                        nivel_desbloqueio: set.nivel_desbloqueio,
                        img: set.img || '',
                        boss_id: set.boss_id || '',
                        desafio_concluido: !!set.desafio_concluido
                      }); 
                      window.scrollTo({top:0, behavior:'smooth'}); 
                    }} className="p-2 text-slate-500 hover:text-amber-500 transition-colors"><Edit3 size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteSet(set.id); }} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                    <div className="p-2 bg-blue-600/10 rounded-sm text-blue-500"><ChevronDown size={14} className="-rotate-90" /></div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL (PEÇAS) */}
      {selectedSet && (
        <div className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
           <div className="bg-[#030712] border-b border-slate-800 p-8 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-8">
                 <div className={`w-20 h-20 border-2 rounded-sm flex items-center justify-center bg-black/40 ${getRankClass(selectedSet.rank).border} shadow-2xl`}>
                    <Shield size={40} className={`${getRankClass(selectedSet.rank).text} opacity-40`} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedSet.nome}</h2>
                    <div className="flex items-center gap-6 mt-3">
                       <span className={`text-sm font-black tracking-[0.3em] ${getRankClass(selectedSet.rank).text}`}>RANK {selectedSet.rank}</span>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border-l border-slate-800 pl-6 italic">ID: {selectedSet.id.substring(0,8)}</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setSelectedSet(null)} className="p-4 bg-slate-900 border border-slate-800 rounded-sm text-slate-500 hover:text-white transition-all shadow-xl">
                <X size={32} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-[1440px] mx-auto space-y-12 pb-20">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STANDARD_SLOTS.map(slotName => (
                      <PieceSlotForm 
                        key={slotName} 
                        set={selectedSet} 
                        slotName={slotName} 
                        existingPiece={pieces.find(p => p.conjunto_id === selectedSet.id && p.slot === slotName)}
                        onSaved={fetchData}
                      />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PieceSlotForm = ({ set, slotName, existingPiece, onSaved }: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: existingPiece?.nome || `${set.nome} (${slotName})`,
    rank: set.rank, 
    slot: slotName,
    bonus_label: existingPiece?.bonus_status || '',
    bonus_target: existingPiece?.bonus ? (DB_TO_UI_STAT[Object.keys(existingPiece.bonus)[0]] || 'HP') : 'HP',
    bonus_value: existingPiece?.bonus ? (Object.values(existingPiece.bonus)[0] as number) : 0,
    vantagem_defensiva: existingPiece?.vantagem_defensiva || 'NENHUMA',
    fraqueza_defensiva: existingPiece?.fraqueza_defensiva || 'NENHUMA',
    img: existingPiece?.img || ''
  });

  const handleSave = async () => {
    const client = getSupabaseClient();
    setIsSaving(true);
    try {
      const targetStat = UI_TO_DB_STAT[formData.bonus_target] || 'hp';
      const payload = {
        nome: formData.nome,
        rank: set.rank,
        slot: slotName,
        bonus_status: formData.bonus_label || `+${formData.bonus_value} ${formData.bonus_target}`,
        bonus: { [targetStat]: formData.bonus_value },
        vantagem_defensiva: formData.vantagem_defensiva,
        fraqueza_defensiva: formData.fraqueza_defensiva,
        conjunto_id: set.id
      };

      if (existingPiece) {
        await client.from('armaduras').update(payload).eq('id', existingPiece.id);
      } else {
        await client.from('armaduras').insert([payload]);
      }
      onSaved();
    } catch (err) { alert("Erro ao forjar peça."); }
    finally { setIsSaving(false); }
  };

  return (
    <div className={`p-6 bg-black/40 border rounded-sm transition-all flex flex-col gap-4 relative group ${existingPiece ? 'border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">{slotName}</span>
        {existingPiece && <ShieldCheck size={14} className="text-emerald-500 shadow-sm" />}
      </div>

      <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="bg-transparent border-b border-slate-800 text-[11px] font-black text-white uppercase outline-none focus:border-blue-500 py-1" />

      <div className="grid grid-cols-2 gap-3">
         <FormGroup label="LABEL BÔNUS" value={formData.bonus_label} onChange={(v:any) => setFormData({...formData, bonus_label:v})} />
         <div className="space-y-1">
           <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">VALOR BASE</label>
           <div className="flex bg-slate-950 border border-slate-800 rounded-sm">
              <input type="number" value={formData.bonus_value} onChange={e => setFormData({...formData, bonus_value: Number(e.target.value)})} className="w-1/2 bg-transparent text-[10px] text-white px-2 py-2 outline-none font-bold" />
              <select value={formData.bonus_target} onChange={e => setFormData({...formData, bonus_target: e.target.value})} className="w-1/2 bg-slate-900 text-[8px] text-slate-500 font-black px-1 outline-none uppercase border-l border-slate-800 italic">
                {Object.keys(UI_TO_DB_STAT).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
         <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">VANTAGEM</label>
            <select value={formData.vantagem_defensiva} onChange={e => setFormData({...formData, vantagem_defensiva: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-[8px] text-emerald-500 px-2 py-2 rounded-sm outline-none uppercase font-black italic">
              {VANTAGEM_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
         </div>
         <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">FRAQUEZA</label>
            <select value={formData.fraqueza_defensiva} onChange={e => setFormData({...formData, fraqueza_defensiva: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-[8px] text-rose-500 px-2 py-2 rounded-sm outline-none uppercase font-black italic">
              {FRAQUEZA_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
         </div>
      </div>

      <button onClick={handleSave} disabled={isSaving} className={`w-full py-3 ${existingPiece ? 'bg-slate-900 border-emerald-500/30 text-emerald-500' : 'bg-blue-600 text-white'} border rounded-sm text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-125 flex items-center justify-center gap-2 active:scale-95 shadow-xl`}>
        {isSaving ? <Loader2 className="animate-spin" size={12} /> : <HardDrive size={12} />}
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
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-4 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-5 text-[12px] text-slate-300 outline-none focus:border-blue-500 placeholder:text-slate-900 font-bold transition-all min-h-[120px] resize-none hover:border-slate-600 custom-scrollbar shadow-inner leading-relaxed italic" />
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 font-black transition-all rounded-sm placeholder:text-slate-900 uppercase italic shadow-inner" />
    )}
  </div>
);

export default ArmorsNexus;