
import React, { useState } from 'react';
import { 
  Lock, Database, Sword, X, Shield, Box, Crown, Package, MapPin, User, Skull
} from 'lucide-react';
import WeaponsNexus from './WeaponsNexus';
import ArmorsNexus from './ArmorsNexus';
import InventoryNexus from './InventoryNexus';
import TerritoriesNexus from './TerritoriesNexus';
import PlayerNexus from './PlayerNexus';
import EnemiesNexus from './EnemiesNexus';

interface Props {
  onClose: () => void;
}

type AdminModule = 'PLAYER' | 'ARMAS' | 'ARMADURAS' | 'INVENTARIO' | 'TERRITORIO' | 'INIMIGOS';

const AdminSettings: React.FC<Props> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<AdminModule>('PLAYER');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'Rafael' && password === '1234') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ACESSO NEGADO: DNA NÃO RECONHECIDO.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[8000] bg-[#010307] flex flex-col font-sans overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-[#030712] border border-slate-800 p-10 rounded-sm shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-blue-900/10 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-500 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <Lock size={40} />
              </div>
              <h2 className="text-base font-black text-white uppercase tracking-[0.4em]">SISTEMA CENTRAL</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest opacity-60 italic">NEXUS MASTER CORE</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">DNA REQUISITION</label>
                 <input type="text" placeholder="IDENTIFICAÇÃO" value={login} onChange={e => setLogin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-xs font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800" />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">ACCESS KEY</label>
                 <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-sm px-5 py-4 text-xs font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800" />
              </div>
              {error && <p className="text-[9px] font-black text-rose-500 text-center uppercase tracking-widest animate-pulse">{error}</p>}
              <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.5em] transition-all rounded-sm shadow-xl shadow-blue-600/10 active:scale-95 mt-4">AUTENTICAR</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[8000] bg-[#010307] flex flex-col font-sans overflow-hidden">
      <div className="bg-[#030712] border-b border-slate-800 p-5 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <Database className="text-blue-400" size={20} />
          <h2 className="text-sm font-black text-white italic uppercase tracking-[0.5em]">NEXUS MASTER CORE</h2>
        </div>
        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-all"><X size={24} /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-[#020617] border-r border-slate-800 flex flex-col flex-shrink-0 shadow-2xl z-10">
          <nav className="flex-1 p-3 space-y-1 custom-scrollbar overflow-y-auto">
            <AdminNavItem icon={<User size={18}/>} label="PLAYER" active={activeModule === 'PLAYER'} onClick={() => setActiveModule('PLAYER')} />
            <AdminNavItem icon={<Sword size={18}/>} label="ARSENAL" active={activeModule === 'ARMAS'} onClick={() => setActiveModule('ARMAS')} />
            <AdminNavItem icon={<Shield size={18}/>} label="ARMADURAS" active={activeModule === 'ARMADURAS'} onClick={() => setActiveModule('ARMADURAS')} />
            <AdminNavItem icon={<Package size={18}/>} label="INVENTÁRIO" active={activeModule === 'INVENTARIO'} onClick={() => setActiveModule('INVENTARIO')} />
            <AdminNavItem icon={<MapPin size={18}/>} label="TERRITÓRIOS" active={activeModule === 'TERRITORIO'} onClick={() => setActiveModule('TERRITORIO')} />
            <AdminNavItem icon={<Skull size={18}/>} label="INIMIGOS" active={activeModule === 'INIMIGOS'} onClick={() => setActiveModule('INIMIGOS')} />
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#010307]">
          {activeModule === 'PLAYER' && <PlayerNexus />}
          {activeModule === 'ARMAS' && <WeaponsNexus />}
          {activeModule === 'ARMADURAS' && <ArmorsNexus />}
          {activeModule === 'INVENTARIO' && <InventoryNexus />}
          {activeModule === 'TERRITORIO' && <TerritoriesNexus />}
          {activeModule === 'INIMIGOS' && <EnemiesNexus />}
        </main>
      </div>
    </div>
  );
};

const AdminNavItem = ({ icon, label, active, onClick, isLocked }: any) => (
  <button 
    onClick={onClick}
    disabled={isLocked}
    className={`w-full flex items-center gap-4 px-6 py-5 rounded-sm transition-all border-l-[3px] ${
      active 
        ? 'bg-blue-600/10 border-blue-500 text-white shadow-[inset_15px_0_25px_-15px_rgba(59,130,246,0.3)]' 
        : 'border-transparent text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
    } ${isLocked ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
  >
    <span className={`${active ? 'text-blue-400' : ''} transition-colors`}>{icon}</span>
    <span className="text-[12px] font-black uppercase tracking-[0.2em] flex-1 text-left italic">{label}</span>
    {isLocked && <Lock size={14} className="opacity-60" />}
  </button>
);

export default AdminSettings;
