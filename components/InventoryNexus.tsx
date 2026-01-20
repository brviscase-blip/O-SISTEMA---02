
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Trash2, Save, Loader2, Plus, Edit3, 
  FlaskConical, Crown, Box, Search, Upload, 
  CheckCircle2, ChevronDown, Database, Info, 
  TrendingUp, Zap, Coins, FileSpreadsheet, MapPin, Percent
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';
import * as XLSX from 'xlsx';

const CATEGORIAS = ['CONSUMÍVEL', 'RELÍQUIA', 'MATERIAL DE REFINO'];
const DESTINOS = ['Consumíveis', 'Relíquias', 'Geral'];
const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];

const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case 'CONSUMÍVEL': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <FlaskConical size={14} /> };
    case 'RELÍQUIA': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <Crown size={14} /> };
    case 'MATERIAL DE REFINO': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Box size={14} /> };
    default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-800', icon: <Package size={14} /> };
  }
};

const InventoryNexus: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    nome: '', categoria: 'CONSUMÍVEL', inventario_destino: 'Consumíveis',
    efeito: '', uso_principal: '', rank: 'E', valor_venda: 0, img: '',
    territorio: '', probabilidade: 0
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const client = getSupabaseClient();
    setIsLoading(true);
    try {
      const { data } = await client.from('inventario_nexus').select('*').order('probabilidade', { ascending: true });
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const exportToExcel = () => {
    const dataToExport = items.map(i => ({
      'NOME': i.nome,
      'CATEGORIA': i.categoria,
      'RANK': i.rank,
      'INVENTÁRIO DESTINO': i.inventario_destino,
      'EFEITO / STATUS': i.efeito,
      'USO PRINCIPAL': i.uso_principal,
      'TERRITÓRIO': i.territorio,
      'PROBABILIDADE': `${i.probabilidade}%`,
      'VALOR (OURO)': i.valor_venda
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario_Ativos");
    XLSX.writeFile(wb, "Nexus_Inventario_Master.xlsx");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const client = getSupabaseClient();
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_item.${file.name.split('.').pop()}`;
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(`inventario/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(`inventario/${fileName}`);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err) {
      alert("Erro no upload do visual.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    const client = getSupabaseClient();
    setIsSaving(true);
    try {
      if (editingId) {
        await client.from('inventario_nexus').update(formData).eq('id', editingId);
      } else {
        await client.from('inventario_nexus').insert([formData]);
      }
      setFormData(initialForm);
      setEditingId(null);
      fetchData();
      alert("Registro de Ativo Sincronizado.");
    } catch (err) {
      alert("Falha na gravação de dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("EXPURGAR ATIVO?")) return;
    const client = getSupabaseClient();
    await client.from('inventario_nexus').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-40">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Nexus de Inventário</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Gestão de Probabilidade e Efeitos de Ativos</p>
        </div>
        <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-600/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-sm">
          <FileSpreadsheet size={16} /> Exportar Banco (XLSX)
        </button>
      </div>

      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
          {editingId ? <Edit3 size={18} className="text-amber-500" /> : <Plus size={18} className="text-blue-500" />}
          {editingId ? 'RECALIBRAR ATIVO' : 'REGISTRAR NOVO ATIVO'}
        </h3>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5"><FormGroup label="NOME DO ITEM" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Poção de HP" /></div>
            <div className="md:col-span-3"><FormGroup label="CATEGORIA" type="select" options={CATEGORIAS} value={formData.categoria} onChange={(v:any) => setFormData({...formData, categoria:v})} /></div>
            <div className="md:col-span-4"><FormGroup label="INVENTÁRIO DESTINO" type="select" options={DESTINOS} value={formData.inventario_destino} onChange={(v:any) => setFormData({...formData, inventario_destino:v})} /></div>
            
            <div className="md:col-span-6"><FormGroup label="EFEITO DE SISTEMA / ATRIBUTO" value={formData.efeito} onChange={(v:any) => setFormData({...formData, efeito:v})} placeholder="Ex: +5 Vitalidade Real (Permanente)" /></div>
            <div className="md:col-span-6"><FormGroup label="USO PRINCIPAL" value={formData.uso_principal} onChange={(v:any) => setFormData({...formData, uso_principal:v})} placeholder="Ex: Upgrade de Personagem" /></div>

            <div className="md:col-span-4"><FormGroup label="TERRITÓRIO DE ORIGEM" value={formData.territorio} onChange={(v:any) => setFormData({...formData, territorio:v})} placeholder="Ex: Templo de Carthenon" /></div>
            <div className="md:col-span-2"><FormGroup label="PROBABILIDADE (%)" type="number" value={formData.probabilidade} onChange={(v:any) => setFormData({...formData, probabilidade:v})} /></div>
            <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
            <div className="md:col-span-2"><FormGroup label="VALOR (OURO)" type="number" value={formData.valor_venda} onChange={(v:any) => setFormData({...formData, valor_venda:v})} /></div>
            
            <div className="md:col-span-2 pt-6">
              <button type="submit" disabled={isSaving || isUploading} className={`w-full h-12 ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase transition-all rounded-sm shadow-xl active:scale-95 flex items-center justify-center gap-2`}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
         <div className="bg-slate-900/30 border border-slate-800/50 h-10 flex items-center px-6 rounded-sm w-full font-black text-[9px] text-slate-500 uppercase tracking-widest">
            <div className="w-[20%]">ATIVO</div>
            <div className="w-[12%] text-center">RANK/CATEGORIA</div>
            <div className="w-[15%] text-center">LOCALIZAÇÃO</div>
            <div className="w-[10%] text-center">PROB.</div>
            <div className="w-[20%] text-center">EFEITO</div>
            <div className="w-[13%] text-center">DESTINO</div>
            <div className="w-[10%] text-right pr-4">AÇÕES</div>
         </div>

         <div className="flex flex-col gap-3">
            {items.map(item => {
                const theme = getCategoryTheme(item.categoria);
                return (
                  <div key={item.id} className="bg-[#030712] border border-slate-800 h-20 flex items-center px-6 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full shadow-lg">
                    <div className={`absolute left-0 top-0 h-full w-1 ${theme.color.replace('text', 'bg')}`} />
                    
                    <div className="w-[20%] flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <div className={theme.color}>{theme.icon}</div>}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <h4 className="text-[12px] font-black text-white uppercase italic truncate">{item.nome}</h4>
                          <span className="text-[8px] font-bold text-slate-600 uppercase mt-1 truncate italic">Rank {item.rank}</span>
                       </div>
                    </div>

                    <div className="w-[12%] text-center">
                        <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-sm border ${theme.border} ${theme.color} text-[8px] font-black uppercase`}>
                           {theme.icon} {item.categoria}
                        </div>
                    </div>

                    <div className="w-[15%] text-center px-2">
                       <div className="flex items-center justify-center gap-1 text-[9px] font-black text-blue-400 uppercase italic">
                          <MapPin size={10} />
                          <span className="truncate">{item.territorio || 'GLOBAL'}</span>
                       </div>
                    </div>

                    <div className="w-[10%] text-center">
                       <div className="flex items-center justify-center gap-1 text-emerald-400 font-black italic">
                          <Percent size={12} />
                          <span className="text-sm">{item.probabilidade}%</span>
                       </div>
                    </div>

                    <div className="w-[20%] text-center px-4">
                       <p className="text-[10px] font-black text-white italic truncate leading-none uppercase tracking-tighter">{item.efeito || 'N/A'}</p>
                       <span className="text-[7px] text-slate-600 font-bold uppercase mt-1 block truncate">{item.uso_principal}</span>
                    </div>

                    <div className="w-[13%] text-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.inventario_destino}</span>
                    </div>

                    <div className="w-[10%] flex items-center justify-end gap-2 pr-2">
                       <button onClick={() => { setEditingId(item.id); setFormData({...item}); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-amber-500 transition-all"><Edit3 size={14}/></button>
                       <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14}/></button>
                    </div>
                  </div>
                );
            })}
         </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, type="text", value, onChange, options, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-blue-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none shadow-inner">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712]">{String(o)}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-blue-400 transition-colors" />
      </div>
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} step={type === 'number' ? '0.1' : undefined} value={value ?? (type === 'number' ? 0 : '')} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-blue-500 placeholder:text-slate-900 font-black transition-all h-12 shadow-inner italic" />
    )}
  </div>
);

export default InventoryNexus;
