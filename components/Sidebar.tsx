import React from 'react';
import { LayoutDashboard, Settings, ChevronLeft, ChevronRight, X, Zap, Swords, History, Target, ArrowLeft } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onOpenAdmin?: () => void;
  onExitRank?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isCollapsed, 
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  onOpenAdmin,
  onExitRank
}) => {
  const handleNavigation = (view: ViewType) => {
    onViewChange(view);
    if (isMobileOpen) {
      onMobileClose();
    }
    if (!isCollapsed) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[998]" onClick={onMobileClose} />
      )}

      <aside 
        className={`bg-[#020617] border-r border-purple-900/30 flex flex-col transition-all duration-300 fixed md:relative z-[999] h-full
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        <button onClick={onMobileClose} className="md:hidden absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={20} />
        </button>

        <button 
          onClick={onToggleCollapse}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-purple-600 rounded-full items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] border border-black z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="w-10 h-10 bg-purple-900/20 border border-purple-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Zap className="text-purple-400" size={20} />
          </div>
          <div className={`${isCollapsed ? 'md:hidden' : 'block'}`}>
            <h2 className="text-sm font-black tracking-widest text-white uppercase italic">SISTEMA</h2>
            <p className="text-[9px] text-purple-400 font-bold uppercase tracking-tighter">O JOGADOR</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Início" active={activeView === 'SISTEMA'} isCollapsed={isCollapsed} onClick={() => handleNavigation('SISTEMA')} />
          <NavItem icon={<Target size={18} />} label="Missões" active={activeView === 'TAREFAS'} isCollapsed={isCollapsed} onClick={() => handleNavigation('TAREFAS')} />
          <NavItem icon={<Swords size={18} />} label="Dungeon" active={activeView === 'DUNGEON'} isCollapsed={isCollapsed} onClick={() => handleNavigation('DUNGEON')} />
          <NavItem icon={<History size={18} />} label="Álbum" active={activeView === 'TIMELINE'} isCollapsed={isCollapsed} onClick={() => handleNavigation('TIMELINE')} />
        </nav>

        <div className={`p-6 space-y-4 ${isCollapsed ? 'md:flex md:flex-col md:items-center' : ''}`}>
          <button 
            onClick={onExitRank}
            className="flex items-center gap-3 text-slate-500 hover:text-blue-400 transition-colors group w-full"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className={`text-xs font-black uppercase tracking-widest ${isCollapsed ? 'md:hidden' : 'block'}`}>Nexus</span>
          </button>
          
          <button 
            onClick={onOpenAdmin}
            className="flex items-center gap-3 text-slate-500 hover:text-purple-400 transition-colors group w-full"
          >
            <Settings size={18} className="group-hover:rotate-90 transition-transform" />
            <span className={`text-xs font-black uppercase tracking-widest ${isCollapsed ? 'md:hidden' : 'block'}`}>Ajustes</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, active, isCollapsed, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 transition-all border-l-2 ${
      active 
        ? 'bg-purple-900/10 border-purple-500 text-white shadow-[inset_10px_0_20px_-10px_rgba(168,85,247,0.2)]' 
        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
    } ${isCollapsed ? 'md:justify-center' : ''}`}
  >
    <span className={active ? 'text-purple-400' : ''}>{icon}</span>
    <span className={`text-[10px] font-black uppercase tracking-widest ${isCollapsed ? 'md:hidden' : 'block'}`}>{label}</span>
  </button>
);

export default Sidebar;