
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Plus, Edit3, Trash2, X, Save, 
  Search, Database, FlaskConical, Crown, Box, 
  Zap, MapPin, Target, ImagePlus, ChevronDown, 
  Sparkles, Gem, Info, Flame, ShieldPlus, Heart,
  Timer, RotateCcw, Swords, Percent, Skull, CheckCircle2
} from 'lucide-react';
import { getSupabaseClient } from '../supabaseClient';

const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
const CATEGORIAS = ['CONSUMÍVEL', 'MATERIAL DE REFINO', 'RELÍQUIA'];
const DESTINOS = ['Consumíveis', 'Geral', 'Relíquias'];
const ATRIBUTOS = ['FORÇA', 'AGILIDADE', 'INTELIGÊNCIA', 'VITALIDADE', 'PERCEPÇÃO', 'HP', 'MP'];

const getRankTheme = (rank: string) => {
  switch (rank) {
    case 'S': return { text: 'text-rose-500', border: 'border-rose-500/40', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/30' };
    case 'A': return { text: 'text-amber-500', border: 'border-amber-500/40', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/30' };
    case 'B': return { text: 'text-purple-500', border: 'border-purple-500/40', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/30' };
    case 'C': return { text: 'text-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/30' };
    case 'D': return { text: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/30' };
    default: return { text: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-900/40', glow: '' };
  }
};

const InventoryNexus: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Vínculos dinâmicos
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [dungeonOptions, setDungeonOptions] = useState<string[]>([]);
  const [weaponOptions, setWeaponOptions] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialForm = {
    nome: '',
    territorio: '',
    tipo_dungeon: '',
    probabilidade: 5,
    inventario_destino: 'Geral',
    rank: 'E',
    categoria: 'CONSUMÍVEL',
    img: '',
    // Campos Consumível
    buff_atributos: [] as string[],
    qtd_buff: 0,
    tempo_buff: '10 min',
    // Campos Material
    arsenal_vinc: '',
    // Campos Relíquia
    is_trial_unlock: false,
    is_real_vitality: false,
    is_return_stone: false
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    // 1. Carregar itens do inventário
    const saved = localStorage.getItem('nexus_inventory_v2');
    if (saved) setItems(JSON.parse(saved));

    // 2. Carregar Territórios
    const territories = localStorage.getItem('nexus_territories_v2');
    if (territories) setTerritoryOptions(JSON.parse(territories).map((t:any) => t.nome));

    // 3. Carregar Dungeons (do nexus arena/territórios se disponível)
    const savedArenas = localStorage.getItem('nexus_arenas_v1');
    if (savedArenas) setDungeonOptions(JSON.parse(savedArenas).map((a:any) => a.nome));
    else setDungeonOptions(['Masmorra de Rank E', 'Cripta de Sombras', 'Ninho de Dragões']);

    // 4. Carregar Armas (Arsenal) - Busca do Supabase pois WeaponsNexus usa banco
    const fetchWeapons = async () => {
      const client = getSupabaseClient();
      const { data } = await client.from('armas').select('nome');
      if (data) setWeaponOptions(data.map(w => w.nome));
    };
    fetchWeapons();
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_inventory_v2', JSON.stringify(items));
  }, [items]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? { ...formData, id: i.id } : i));
    } else {
      setItems(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const deleteItem = (id: string) => {
    if (confirm("EXPURGAR ATIVO DO BANCO DE DADOS?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const filteredItems = items.filter(i => 
    i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      {/* HEADER LOGÍSTICO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600/10 border border-emerald-500/40 rounded flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
             <Package size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Logística de Ativos</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Gestão de Consumíveis, Refino e Relíquias</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-sm pl-12 pr-4 py-4 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                placeholder="Pesquisar item..."
              />
           </div>
           <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4 shrink-0">
             <Database className="text-emerald-500" size={20} />
             <span className="text-xl font-black text-white italic tabular-nums">{items.length}</span>
           </div>
        </div>
      </div>

      {/* GRADE DE ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
         <button 
           onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }}
           className="aspect-square bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-600/5 transition-all group"
         >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
               <Plus size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Registrar Novo Ativo</span>
         </button>

         {filteredItems.map(item => {
           const theme = getRankTheme(item.rank);
           const isRelic = item.categoria === 'RELÍQUIA';
           return (
             <div 
               key={item.id}
               onClick={() => { setFormData(item); setEditingId(item.id); setIsModalOpen(true); }}
               className={`group relative aspect-square bg-[#030712] border-2 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl ${theme.border} hover:${theme.glow}`}
             >
                <div className="absolute inset-0 z-0">
                   {item.img ? (
                     <img src={item.img} className="w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-950 flex items-center justify-center opacity-10">
                        {item.categoria === 'CONSUMÍVEL' ? <FlaskConical size={80} /> : isRelic ? <Crown size={80} /> : <Box size={80} />}
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                </div>

                <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className={`px-2 py-0.5 bg-black/80 border rounded-sm text-[9px] font-black italic tracking-widest ${theme.text} ${theme.border}`}>
                        RANK {item.rank}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-1.5 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                   </div>

                   <div className="space-y-2">
                      <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-sm border border-emerald-500/20 w-fit">
                         <span className="text-[7px] font-black text-emerald-400 uppercase italic tabular-nums">{item.probabilidade}% DROP</span>
                      </div>
                      <h4 className="text-base font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-emerald-400 transition-colors drop-shadow-lg">
                        {item.nome}
                      </h4>
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{item.categoria}</p>
                   </div>
                </div>
                {isRelic && <div className="absolute -top-1 -right-1 w-10 h-10 bg-amber-500/20 blur-xl animate-pulse" />}
             </div>
           );
         })}
      </div>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/40">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                   <Package size={18} className="text-emerald-500" /> {editingId ? 'RECALIBRAR ATIVO LOGÍSTICO' : 'CATALOGAR NOVO ATIVO'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual & Core Data */}
                    <div className="lg:col-span-4 space-y-6">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">ESTRUTURA MOLECULAR (.PNG)</label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full aspect-square bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all relative overflow-hidden group ${formData.img ? 'border-emerald-500/50' : 'border-slate-800'}`}
                       >
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                          {formData.img ? (
                            <img src={formData.img} className="w-full h-full object-contain p-6" />
                          ) : (
                            <ImagePlus size={48} className="text-slate-800 group-hover:text-emerald-500 transition-colors" />
                          )}
                       </div>
                       <FormGroup label="NOME DO ITEM" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} />
                       <div className="grid grid-cols-2 gap-4">
                          <FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                          <FormGroup label="CATEGORIA" type="select" options={CATEGORIAS} value={formData.categoria} onChange={(v:any) => setFormData({...formData, categoria:v})} />
                       </div>
                    </div>

                    {/* Lógica de Vínculos e Condicionais */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Configuração de Drop */}
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Matriz de Spawn</h4>
                             <FormGroup label="TERRITÓRIO ORIGEM" type="select" options={['GLOBAL', ...territoryOptions]} value={formData.territorio} onChange={(v:any) => setFormData({...formData, territorio:v})} icon={<MapPin size={12}/>} />
                             <FormGroup label="TIPO DE DUNGEON" type="select" options={['QUALQUER', ...dungeonOptions]} value={formData.tipo_dungeon} onChange={(v:any) => setFormData({...formData, tipo_dungeon:v})} icon={<Target size={12}/>} />
                             <FormGroup label="PROBABILIDADE DE SURGIMENTO" type="number" value={formData.probabilidade} onChange={(v:any) => setFormData({...formData, probabilidade:v})} icon={<Percent size={12} className="text-emerald-500"/>} />
                             <FormGroup label="INVENTÁRIO DESTINO" type="select" options={DESTINOS} value={formData.inventario_destino} onChange={(v:any) => setFormData({...formData, inventario_destino:v})} icon={<Box size={12}/>} />
                          </div>

                          {/* Lógica Específica por Categoria */}
                          <div className="space-y-6 bg-slate-900/20 p-6 border border-slate-800 rounded-sm min-h-[300px]">
                             <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Propriedades Técnicas</h4>
                             
                             {formData.categoria === 'CONSUMÍVEL' && (
                               <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black text-slate-500 uppercase">BUFF ATRIBUTOS</label>
                                     <div className="flex flex-wrap gap-2">
                                        {ATRIBUTOS.map(attr => (
                                          <button 
                                            key={attr}
                                            type="button"
                                            onClick={() => {
                                              const current = formData.buff_atributos;
                                              setFormData({...formData, buff_atributos: current.includes(attr) ? current.filter(a => a !== attr) : [...current, attr]});
                                            }}
                                            className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase transition-all ${formData.buff_atributos.includes(attr) ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}
                                          >
                                            {attr}
                                          </button>
                                        ))}
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                     <FormGroup label="% BUFF" type="number" value={formData.qtd_buff} onChange={(v:any) => setFormData({...formData, qtd_buff:v})} icon={<Zap size={12} className="text-amber-500"/>} />
                                     <FormGroup label="DURAÇÃO" value={formData.tempo_buff} onChange={(v:any) => setFormData({...formData, tempo_buff:v})} icon={<Timer size={12} className="text-blue-500"/>} />
                                  </div>
                               </div>
                             )}

                             {formData.categoria === 'MATERIAL DE REFINO' && (
                               <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                  <FormGroup label="ARSENAL DESIGNADO" type="select" options={['SELECIONAR ARMA...', ...weaponOptions]} value={formData.arsenal_vinc} onChange={(v:any) => setFormData({...formData, arsenal_vinc:v})} icon={<Swords size={12} className="text-rose-500"/>} />
                                  <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                                    Materiais de refino aumentam a eficácia de armamentos específicos em +15% por grau de pureza.
                                  </p>
                               </div>
                             )}

                             {formData.categoria === 'RELÍQUIA' && (
                               <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                                  {/* Error Fixed: Skull component now properly imported */}
                                  <RelicCheckbox label="Desbloqueia Instância de Trial" checked={formData.is_trial_unlock} onChange={v => setFormData({...formData, is_trial_unlock: v})} icon={<Skull size={14}/>} color="text-rose-500" />
                                  <RelicCheckbox label="Vitalidade Real (Auto-Ressurreição)" checked={formData.is_real_vitality} onChange={v => setFormData({...formData, is_real_vitality: v})} icon={<Heart size={14}/>} color="text-emerald-500" />
                                  <RelicCheckbox label="Pedra de Retorno (Freeze-Frame)" checked={formData.is_return_stone} onChange={v => setFormData({...formData, is_return_stone: v})} icon={<RotateCcw size={14}/>} color="text-blue-500" />
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="bg-blue-950/10 border border-blue-900/30 p-6 rounded-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase italic leading-relaxed">
                            <Info size={12} className="inline mr-2 text-blue-500" />
                            A probabilidade de drop é calculada dinamicamente pelo Sistema baseada no <span className="text-blue-500">Luck Stat</span> do jogador no momento da conclusão da fenda.
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>
                    <button type="submit" className="px-16 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-xl active:scale-95 flex items-center gap-3">
                       <Save size={18} /> {editingId ? 'RECALIBRAR MATRIZ' : 'SINCRONIZAR ATIVO'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const RelicCheckbox = ({ label, checked, onChange, icon, color }: any) => (
  <button 
    type="button" 
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center gap-4 p-4 rounded-sm border transition-all ${checked ? 'bg-slate-900 border-slate-700' : 'bg-black/40 border-slate-800/40 opacity-50 hover:opacity-100'}`}
  >
    <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${checked ? 'bg-emerald-600/20 border-emerald-500/50 ' + color : 'bg-slate-950 border-slate-800 text-slate-800'}`}>
       {checked ? icon : <Box size={14} />}
    </div>
    <div className="flex-1 text-left">
       <p className={`text-[10px] font-black uppercase tracking-tight ${checked ? 'text-white' : 'text-slate-600'}`}>{label}</p>
       <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{checked ? 'Efeito Ativo no Consumo' : 'Efeito Passivo'}</p>
    </div>
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked ? 'border-emerald-500 bg-emerald-600' : 'border-slate-800'}`}>
       {/* Error Fixed: CheckCircle2 component now properly imported */}
       {checked && <CheckCircle2 size={10} className="text-white" />}
    </div>
  </button>
);

const FormGroup = ({ label, type="text", value, onChange, options, icon, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">{icon} {label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-emerald-400 transition-colors" />
      </div>
    ) : (
      <input 
        type={type === 'number' ? 'number' : 'text'} 
        value={value} 
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} 
        placeholder={placeholder} 
        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500 font-black transition-all h-12 italic rounded-sm placeholder:text-slate-900 uppercase shadow-inner" 
      />
    )}
  </div>
);

export default InventoryNexus;
