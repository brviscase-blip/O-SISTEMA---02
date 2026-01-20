
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Trash2, Save, Loader2, Plus, Edit3, 
  FlaskConical, Crown, Box, Search, Upload, 
  CheckCircle2, ChevronDown, Database, Info, 
  TrendingUp, Zap, Coins, FileSpreadsheet, MapPin, Percent, ImagePlus, X
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const client = getSupabaseClient();
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_inv.${fileExt}`;
      const filePath = `inventario/${fileName}`;

      // Upload para o storage 'armas-imgs' (reutilizando o bucket de assets)
      const { error: uploadError } = await client.storage.from('armas-imgs').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = client.storage.from('armas-imgs').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, img: publicUrl }));
    } catch (err: any) {
      alert("Falha no upload visual: " + err.message);
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
      alert("Ativo Sincronizado com Sucesso.");
    } catch (err) {
      alert("Erro ao gravar dados.");
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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Gestão de Ativos e Suporte Dimensional</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-sm">
           <Database size={14} className="text-blue-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} ITENS NO BANCO</span>
        </div>
      </div>

      <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm relative shadow-2xl overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`} />
        
        <form onSubmit={handleSave} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUNA DE UPLOAD (VISUAL) */}
            <div className="lg:col-span-3 space-y-4">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Upload Visual (.PNG)</label>
               <div 
                 onClick={() => !isUploading && fileInputRef.current?.click()}
                 className={`w-full aspect-square bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group/upload ${formData.img ? 'border-emerald-500/50' : 'border-slate-800 hover:border-blue-500/50'}`}
               >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="animate-spin text-blue-500" size={32} />
                       <span className="text-[9px] font-black text-blue-500 uppercase">Sincronizando...</span>
                    </div>
                  ) : formData.img ? (
                    <>
                      <img src={formData.img} className="w-full h-full object-contain p-4" alt="Preview" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-[9px] font-black text-white uppercase tracking-widest">Trocar Imagem</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setFormData({...formData, img: ''}); }}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-500 transition-all shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-700 group-hover/upload:text-blue-500 transition-colors">
                       <ImagePlus size={40} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Selecionar Ativo</span>
                    </div>
                  )}
               </div>
               <p className="text-[8px] text-slate-600 font-bold uppercase text-center italic tracking-tighter">Resolução recomendada: 512x512px</p>
            </div>

            {/* COLUNA DE DADOS */}
            <div className="lg:col-span-9 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormGroup label="NOME DO ITEM" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} placeholder="Ex: Poção de HP [Rank S]" />
                 <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="CATEGORIA" type="select" options={CATEGORIAS} value={formData.categoria} onChange={(v:any) => setFormData({...formData, categoria:v})} />
                    <FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormGroup label="EFEITO DE SISTEMA" value={formData.efeito} onChange={(v:any) => setFormData({...formData, efeito:v})} placeholder="Ex: +30% Poder Vital (Dungeon)" />
                 <FormGroup label="USO PRINCIPAL" value={formData.uso_principal} onChange={(v:any) => setFormData({...formData, uso_principal:v})} placeholder="Ex: Sobrevivência Imediata" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <FormGroup label="TERRITÓRIO" value={formData.territorio} onChange={(v:any) => setFormData({...formData, territorio:v})} placeholder="Ex: TODOS ou Nome da Dungeon" />
                 <FormGroup label="PROBABILIDADE (%)" type="number" value={formData.probabilidade} onChange={(v:any) => setFormData({...formData, probabilidade:v})} />
                 <FormGroup label="DESTINO" type="select" options={DESTINOS} value={formData.inventario_destino} onChange={(v:any) => setFormData({...formData, inventario_destino:v})} />
                 <FormGroup label="VALOR (OURO)" type="number" value={formData.valor_venda} onChange={(v:any) => setFormData({...formData, valor_venda:v})} />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/50">
                 {editingId && (
                   <button type="button" onClick={() => { setEditingId(null); setFormData(initialForm); }} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                 )}
                 <button type="submit" disabled={isSaving || isUploading} className={`px-12 py-4 ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-sm shadow-xl active:scale-95 flex items-center gap-3`}>
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {editingId ? 'RECALIBRAR ATIVO' : 'REGISTRAR NO BANCO'}
                 </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className="space-y-4">
         <div className="bg-slate-900/30 border border-slate-800/50 h-10 flex items-center px-6 rounded-sm w-full font-black text-[9px] text-slate-500 uppercase tracking-widest">
            <div className="w-[8%] text-center">VISUAL</div>
            <div className="w-[17%]">NOME</div>
            <div className="w-[10%] text-center">RANK</div>
            <div className="w-[15%] text-center">TERRITÓRIO</div>
            <div className="w-[20%]">EFEITO</div>
            <div className="w-[10%] text-center">PROB.</div>
            <div className="w-[10%] text-center">DESTINO</div>
            <div className="w-[10%] text-right pr-4">AÇÕES</div>
         </div>

         <div className="flex flex-col gap-3">
            {items.map(item => {
                const theme = getCategoryTheme(item.categoria);
                return (
                  <div key={item.id} className="bg-[#030712] border border-slate-800 h-20 flex items-center px-6 group hover:border-slate-600 transition-all relative overflow-hidden rounded-sm w-full shadow-lg">
                    <div className={`absolute left-0 top-0 h-full w-1 ${theme.color.replace('text', 'bg')}`} />
                    
                    <div className="w-[8%] flex justify-center">
                       <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {item.img ? <img src={item.img} className="w-full h-full object-contain p-1" /> : <div className={theme.color}>{theme.icon}</div>}
                       </div>
                    </div>

                    <div className="w-[17%] pl-4">
                       <h4 className="text-[12px] font-black text-white uppercase italic truncate">{item.nome}</h4>
                       <span className={`text-[7px] font-bold uppercase tracking-widest ${theme.color}`}>{item.categoria}</span>
                    </div>

                    <div className="w-[10%] text-center">
                       <span className="text-sm font-black text-slate-400 italic">RANK {item.rank}</span>
                    </div>

                    <div className="w-[15%] text-center">
                       <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-blue-400 uppercase italic">
                          <MapPin size={10} /> {item.territorio || 'GLOBAL'}
                       </div>
                    </div>

                    <div className="w-[20%] pr-4">
                       <p className="text-[10px] font-black text-white italic truncate leading-none uppercase tracking-tighter">{item.efeito}</p>
                       <span className="text-[7px] text-slate-600 font-bold uppercase mt-1 block truncate">{item.uso_principal}</span>
                    </div>

                    <div className="w-[10%] text-center">
                       <div className="inline-flex items-center gap-1 text-emerald-400 font-black italic text-xs">
                          <Percent size={10} /> {item.probabilidade}%
                       </div>
                    </div>

                    <div className="w-[10%] text-center">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.inventario_destino}</span>
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
