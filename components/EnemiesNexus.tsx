
import React, { useState, useEffect, useRef } from 'react';
import { 
  Skull, Plus, Edit3, Trash2, X, Save, 
  Search, Database, Heart, Sword, Shield, 
  Zap, MapPin, Ghost, Target, ImagePlus, 
  ChevronDown, Flame, ShieldAlert, Info
} from 'lucide-react';

const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
const ENEMY_TYPES = ['INIMIGO COMUM (MINION)', 'BOSS DA DUNGEON'];

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

const EnemiesNexus: React.FC = () => {
  const [enemies, setEnemies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Vínculos
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [arenaOptions, setArenaOptions] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialForm = {
    nome: '',
    tipo: 'INIMIGO COMUM (MINION)',
    arena: '',
    rank: 'E',
    territorio: '',
    hp: 100,
    atk: 10,
    def: 5,
    spd: 10,
    img: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    // Carregar dados locais
    const savedEnemies = localStorage.getItem('nexus_enemies_v1');
    if (savedEnemies) setEnemies(JSON.parse(savedEnemies));

    // Carregar opções de território (do outro Nexus)
    const savedTerritories = localStorage.getItem('nexus_territories_v2');
    if (savedTerritories) {
      const territories = JSON.parse(savedTerritories).map((t: any) => t.nome);
      setTerritoryOptions(territories);
    }

    // Carregar opções de arena (simulado ou do nexus arenas se existir)
    const savedArenas = localStorage.getItem('nexus_arenas_v1');
    if (savedArenas) {
      setArenaOptions(JSON.parse(savedArenas).map((a: any) => a.nome));
    } else {
      // Fallback para exemplo
      setArenaOptions(['Arena de Sangue', 'Cripta de Gelo', 'Coliseu das Sombras']);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_enemies_v1', JSON.stringify(enemies));
  }, [enemies]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    if (editingId) {
      setEnemies(prev => prev.map(en => en.id === editingId ? { ...formData, id: en.id } : en));
    } else {
      setEnemies(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const startEdit = (en: any) => {
    setFormData(en);
    setEditingId(en.id);
    setIsModalOpen(true);
  };

  const deleteEnemy = (id: string) => {
    if (confirm("EXPURGAR REGISTRO DE AMEAÇA?")) {
      setEnemies(prev => prev.filter(en => en.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const filteredEnemies = enemies.filter(en => 
    en.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    en.territorio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-40">
      {/* HEADER BESTIÁRIO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-600/10 border border-rose-500/40 rounded flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.15)]">
             <Skull size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Bestiário de Ameaças</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1 italic">Catalogação Biometríca de Inimigos e Bosses</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 rounded-sm pl-12 pr-4 py-4 text-xs font-black text-white uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                placeholder="Identificar ameaça..."
              />
           </div>
           <div className="bg-[#030712] border border-slate-800 p-4 rounded-sm flex items-center gap-4 shrink-0">
             <Database className="text-rose-500" size={20} />
             <span className="text-xl font-black text-white italic tabular-nums">{enemies.length}</span>
           </div>
        </div>
      </div>

      {/* GRADE DE BESTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         <button 
           onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }}
           className="aspect-[4/5] bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-rose-500/50 hover:bg-rose-600/5 transition-all group"
         >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 group-hover:text-rose-500 group-hover:scale-110 transition-all">
               <Plus size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">Registrar Nova Ameaça</span>
         </button>

         {filteredEnemies.map(en => {
           const theme = getRankTheme(en.rank);
           const isBoss = en.tipo === 'BOSS DA DUNGEON';
           return (
             <div 
               key={en.id}
               onClick={() => startEdit(en)}
               className={`group relative aspect-[4/5] bg-[#030712] border-2 rounded-sm overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl ${theme.border} hover:${theme.glow}`}
             >
                <div className="absolute inset-0 z-0">
                   {en.img ? (
                     <img src={en.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                   ) : (
                     <div className="w-full h-full bg-slate-950 flex items-center justify-center opacity-10">
                        <Skull size={100} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                </div>

                <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className={`px-3 py-1 bg-black/80 border-2 rounded-sm text-[10px] font-black italic tracking-widest ${theme.text} ${theme.border}`}>
                        RANK {en.rank}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         {isBoss ? (
                           <div className="bg-rose-600 text-white px-2 py-0.5 rounded-sm text-[7px] font-black uppercase shadow-lg shadow-rose-900/50">BOSS</div>
                         ) : (
                           <div className="bg-slate-700 text-white px-2 py-0.5 rounded-sm text-[7px] font-black uppercase">MINION</div>
                         )}
                         <button onClick={(e) => { e.stopPropagation(); deleteEnemy(en.id); }} className="p-1.5 bg-black/60 border border-slate-800 rounded-sm text-white hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-rose-400 transition-colors drop-shadow-lg">
                          {en.nome}
                        </h4>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                           <MapPin size={10} className="text-blue-500" /> {en.territorio || 'Área Inexplorada'}
                        </p>
                      </div>

                      {/* Mini Stats Bar */}
                      <div className="space-y-1.5 pt-3 border-t border-white/5">
                         <div className="flex justify-between items-end text-[7px] font-black text-rose-500 uppercase">
                            <span>Vitalidade (HP)</span>
                            <span className="text-white">{en.hp}</span>
                         </div>
                         <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600" style={{ width: '100%' }} />
                         </div>
                         <div className="flex justify-between items-center pt-1">
                            <StatIcon icon={<Sword size={8}/>} val={en.atk} color="text-amber-500" />
                            <StatIcon icon={<Shield size={8}/>} val={en.def} color="text-blue-400" />
                            <StatIcon icon={<Zap size={8}/>} val={en.spd} color="text-emerald-400" />
                         </div>
                      </div>
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-px bg-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.4)] translate-y-[-100%] group-hover:animate-[scan_3s_linear_infinite]" />
             </div>
           );
         })}
      </div>

      {/* MODAL DE REGISTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#030712] border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/40">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                   <Skull size={18} className="text-rose-500" /> {editingId ? 'RECALIBRAR ASSINATURA BIOMÉTRICA' : 'REGISTRAR NOVA AMEAÇA'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors"><X size={24}/></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual & Core Data */}
                    <div className="lg:col-span-4 space-y-6">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Assinatura Visual (.PNG)</label>
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full aspect-[3/4] bg-slate-950 border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-rose-500/50 transition-all relative overflow-hidden group ${formData.img ? 'border-emerald-500/50' : 'border-slate-800'}`}
                       >
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                          {formData.img ? (
                            <img src={formData.img} className="w-full h-full object-cover" />
                          ) : (
                            <ImagePlus size={48} className="text-slate-800 group-hover:text-rose-500 transition-colors" />
                          )}
                       </div>
                       <FormGroup label="NOME DO INIMIGO" value={formData.nome} onChange={(v:any) => setFormData({...formData, nome:v})} />
                       <FormGroup label="TIPO" type="select" options={ENEMY_TYPES} value={formData.tipo} onChange={(v:any) => setFormData({...formData, tipo:v})} />
                       <FormGroup label="RANK" type="select" options={RANKS} value={formData.rank} onChange={(v:any) => setFormData({...formData, rank:v})} />
                    </div>

                    {/* Vínculos e Atributos */}
                    <div className="lg:col-span-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Geolocalização & Arena</h4>
                             <FormGroup label="TERRITÓRIO VINCULADO" type="select" options={['SELECIONAR...', ...territoryOptions]} value={formData.territorio} onChange={(v:any) => setFormData({...formData, territorio:v})} icon={<MapPin size={12}/>} />
                             <FormGroup label="ARENA DE COMBATE" type="select" options={['SELECIONAR...', ...arenaOptions]} value={formData.arena} onChange={(v:any) => setFormData({...formData, arena:v})} icon={<Target size={12}/>} />
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-l-2 border-rose-500 pl-3">Matriz de Atributos</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="VITALIDADE (HP)" type="number" value={formData.hp} onChange={(v:any) => setFormData({...formData, hp:v})} icon={<Heart size={12} className="text-rose-500"/>} />
                                <FormGroup label="ATAQUE (ATK)" type="number" value={formData.atk} onChange={(v:any) => setFormData({...formData, atk:v})} icon={<Sword size={12} className="text-amber-500"/>} />
                                <FormGroup label="DEFESA (DEF)" type="number" value={formData.def} onChange={(v:any) => setFormData({...formData, def:v})} icon={<Shield size={12} className="text-blue-500"/>} />
                                <FormGroup label="VELOCIDADE (SPD)" type="number" value={formData.spd} onChange={(v:any) => setFormData({...formData, spd:v})} icon={<Zap size={12} className="text-emerald-500"/>} />
                             </div>
                          </div>
                       </div>

                       <div className="bg-rose-950/10 border border-rose-900/30 p-6 rounded-sm">
                          <p className="text-[9px] text-slate-400 font-bold uppercase italic leading-relaxed">
                            <Info size={12} className="inline mr-2 text-rose-500" />
                            Ameaças de <span className="text-rose-500">Rank S</span> registradas como <span className="text-rose-500">Boss</span> herdarão automaticamente multiplicadores de Dungeon Master.
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-slate-800 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all">Cancelar</button>
                    <button type="submit" className="px-16 py-4 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm shadow-xl active:scale-95 flex items-center gap-3">
                       <Save size={18} /> {editingId ? 'ATUALIZAR MATRIZ' : 'SINCRONIZAR AMEAÇA'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const StatIcon = ({ icon, val, color }: any) => (
  <div className="flex items-center gap-1.5">
    <span className={`${color} opacity-70`}>{icon}</span>
    <span className="text-[9px] font-black text-white tabular-nums">{val}</span>
  </div>
);

const FormGroup = ({ label, type="text", value, onChange, options, icon, placeholder }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">{icon} {label}</label>
    {type === 'select' ? (
      <div className="relative group">
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-rose-500 transition-all cursor-pointer h-12 uppercase font-black appearance-none rounded-sm">
          {(options || []).map((o:any) => <option key={String(o)} value={String(o)} className="bg-[#030712] uppercase">{String(o)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover:text-rose-400 transition-colors" />
      </div>
    ) : (
      <input 
        type={type === 'number' ? 'number' : 'text'} 
        value={value} 
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} 
        placeholder={placeholder} 
        className="w-full bg-slate-950 border border-slate-800 px-4 py-3 text-[11px] text-white outline-none focus:border-rose-500 font-black transition-all h-12 italic rounded-sm placeholder:text-slate-900 uppercase shadow-inner" 
      />
    )}
  </div>
);

export default EnemiesNexus;
