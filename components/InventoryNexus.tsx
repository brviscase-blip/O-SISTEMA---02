
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Trash2, Save, Loader2, Plus, Edit3, 
  FlaskConical, Crown, Box, Search, Upload, 
  CheckCircle2, ChevronDown, Database, Info, 
  TrendingUp, Zap, Coins
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

const CATEGORIAS = ['CONSUMÍVEL', 'RELÍQUIA', 'MATERIAL'];
const DESTINOS = ['Consumíveis', 'Relíquias', 'Geral'];
const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];

const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case 'CONSUMÍVEL': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <FlaskConical size={14} /> };
    case 'RELÍQUIA': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <Crown size={14} /> };
    case 'MATERIAL': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Box size={14} /> };
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
    efeito: '', uso_principal: '', rank: 'E', valor_venda: 0, img: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    const client = getSupabaseClient();
    setIsLoading(true);
    try {
      const { data } = await client.from('inventario_nexus').select('*').order('categoria', { ascending: true });
      setItems(data || []);
    } catch (err) {
      console.error(err);
      alert("Falha ao sincronizar banco de dados de ativos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
      alert("Erro no upload do visual do item.");
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
      alert("Ativo de Inventário Sincronizado.");
    } catch (err) {
      alert("Falha na recalibração do item.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("CONFIRMAR EXPURGO DO ATIVO?")) return;
    const client = getSupabaseClient();
    await client.from('inventario_nexus').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-40">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Nexus de Inventário</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Sincronização de Ativos Não-Bélicos</p>
        </div>
        <div className="flex items-center gap-3 bg-[#030712] border border-slate-800 p-3 rounded-sm">
           <Database size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} Itens em Registro</span>
        </div>
      </div>

      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-emerald-600'}`} />
        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
          {editingId ? <Edit3 size={18} className="text-amber-500" /> : <Plus size={18} className="text-emerald-500" />}
          {editingId ? 'RECALIBRAR ATIVO' : 'REGISTRAR NOVO ATIVO'}
        </h3>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5"><FormGroup label="NOME DO ITEM" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Poção de HP" /></div>
            <div className="md:col-span-3"><FormGroup label="CATEGORIA" type="select" options={CATEGORIAS} value={formData.categoria} onChange={(v:any) => setFormData({...formData, categoria:v})} /></div>
            <div className="md:col-span-4"><FormGroup label="INVENTÁRIO DESTINO" type="select" options={DESTINOS} value={formData.inventario_destino} onChange={(v:any) => setFormData({...formData, inventario_destino:v})} /></div>
            
            <div className="md:col-span-6"><FormGroup label="EFEITO DE SISTEMA / ATRIBUTO" value={formData.efeito} onChange={(v:any) => setFormData({...formData, efeito:v})} placeholder="Ex: +30% Poder Vital (Dungeon)" /></div>
            <div className="md:col-span-6"><FormGroup label="USO PRINCIPAL" value={formData.uso_principal} onChange={(v:any) => setFormData({...formData, uso_principal:v})} placeholder="Ex: Sobrevivência imediata" /></div>

            <div className="md:col-span-2"><FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} /></div>
            <div className="md:col-span-2"><FormGroup label="VALOR (OURO)" type="number" value={formData.valor_venda} onChange={(v:any) => setFormData({...formData, valor_venda:v})} /></div>
            
            <div className="md:col-span-5">
               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">Upload Visual</label>
               <div onClick={() => !isUploading && fileInputRef.current?.click()} className="w-full h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center px-4 cursor-pointer hover:border-emerald-500 transition-all overflow-hidden shadow-inner">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold text-slate-600 uppercase italic">{isUploading ? 'Sincronizando...' : formData.img ? 'Registro OK' : 'Selecionar .PNG'}</span>
                    {formData.img && <img src={formData.img} className="w-8 h-8 rounded-sm object-cover border border-slate-800" />}
                  </div>
               </div>
            </div>

            <div className="md:col-span-3 pt-6">
              <button type="submit" disabled={isSaving || isUploading} className={`w-full h-12 ${editingId ? 'bg-amber-600' : 'bg-emerald-600'} text-white text-[11px] font-black uppercase transition-all rounded-sm shadow-xl active:scale-95 flex items-center justify-center gap-2`}>
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {editingId ? 'ATUALIZAR' : 'REGISTRAR NO NEXUS'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
         <div className="bg-slate-900/30 border border-slate-800/50 h-10 flex items-center px-6 rounded-sm w-full font-black text-[9px] text-slate-500 uppercase tracking-widest">
            <div className="w-[25%]">ATIVO IDENTIFICADO</div>
            <div className="w-[15%] text-center">CATEGORIA / RANK</div>
            <div className="w-[15%] text-center">DESTINO</div>
            <div className="w-[20%] text-center">EFEITO</div>
            <div className="w-[15%] text-center">VALOR</div>
            <div className="w-[10%] text-right pr-4">AÇÕES</div>
         </div>

         <div className="flex flex-col gap-3">
            {items.map(item => {
                const theme = getCategoryTheme(item.categoria);
                return (
                  <div key={item.id} className="bg-[#030712] border border-slate-800 h-20 flex items-center px-6 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full shadow-lg">
                    <div className={`absolute left-0 top-0 h-full w-1 ${theme.color.replace('text', 'bg')}`} />
                    
                    <div className="w-[25%] flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <div className={theme.color}>{theme.icon}</div>}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <h4 className="text-[12px] font-black text-white uppercase italic truncate">{item.nome}</h4>
                          <span className="text-[8px] font-bold text-slate-600 uppercase mt-1 truncate">{item.uso_principal}</span>
                       </div>
                    </div>

                    <div className="w-[15%] text-center flex flex-col items-center">
                        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-sm border ${theme.border} ${theme.color} text-[8px] font-black uppercase mb-1`}>
                           {theme.icon} {item.categoria}
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter italic">RANK {item.rank}</span>
                    </div>

                    <div className="w-[15%] text-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.inventario_destino}</span>
                    </div>

                    <div className="w-[20%] text-center px-4">
                       <p className="text-[10px] font-black text-white italic truncate leading-none uppercase tracking-tighter">{item.efeito || 'N/A'}</p>
                       <span className="text-[7px] text-slate-600 font-bold uppercase mt-1 block">Propriedade de Sistema</span>
                    </div>

                    <div className="w-[15%] text-center flex items-center justify-center gap-2">
                       <Coins size={12} className="text-amber-500" />
                       <span className="text-xs font-black text-white tabular-nums italic">{item.valor_venda}</span>
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
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none shadow-inner">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712]">{String(o)}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-emerald-400 transition-colors" />
      </div>
    ) : (
      <input type={type === 'number' ? 'number' : 'text'} value={value ?? (type === 'number' ? 0 : '')} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 px-5 py-3 text-[11px] text-white outline-none focus:border-emerald-500 placeholder:text-slate-900 font-black transition-all h-12 shadow-inner italic" />
    )}
  </div>
);

export default InventoryNexus;
