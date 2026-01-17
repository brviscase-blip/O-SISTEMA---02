
import React from 'react';
import { Weapon } from '../types';
import { Sword, Zap, Shield, Target } from 'lucide-react';

const MOCK_WEAPONS: Weapon[] = [
  {
    id: 'w-01',
    name: "Rasaka's Fang",
    rank: 'C',
    type: 'ADAGA',
    damage: 25,
    effect: 'Paralisia & Sangramento',
    description: "Uma adaga feita do dente do Grande Veneno de Rasaka."
  },
  {
    id: 'w-02',
    name: "Baruka's Dagger",
    rank: 'A',
    type: 'ADAGA',
    damage: 110,
    effect: '+30 Agilidade',
    description: "A adaga preferida do Lorde Elfo de Gelo, Baruka."
  },
  {
    id: 'w-03',
    name: "Demon King's Shortsword",
    rank: 'S',
    type: 'ADAGA',
    damage: 350,
    effect: 'Tempestade de Raios',
    description: "Empunhada pelo Rei Demônio Baran. Possui o poder dos relâmpagos."
  }
];

const InventoryView: React.FC = () => {
  return (
    <div className="space-y-6 h-full overflow-y-auto no-scrollbar pb-10">
      <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">INVENTÁRIO DE ELITE</h3>
        <span className="text-[9px] font-black text-slate-500 uppercase">CAPACIDADE: 3 / 100</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_WEAPONS.map((weapon) => (
          <div key={weapon.id} className="bg-[#030712] border border-slate-800 rounded-sm p-5 flex flex-col gap-4 hover:border-purple-500/50 transition-all shadow-xl group relative">
            <div className="absolute top-0 right-0 p-2">
              <span className={`text-xl font-black italic ${
                weapon.rank === 'S' ? 'text-orange-500' : weapon.rank === 'A' ? 'text-purple-500' : 'text-blue-500'
              }`}>{weapon.rank}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-slate-600 group-hover:text-purple-400 group-hover:border-purple-500/50 transition-all">
                <Sword size={32} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tighter">{weapon.name}</h4>
                <p className="text-[9px] font-black text-purple-500 uppercase">{weapon.type}</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed italic">{weapon.description}</p>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                 <Zap size={12} className="text-blue-400" />
                 <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-600 uppercase">DANO</span>
                   <span className="text-xs font-black text-white">{weapon.damage}</span>
                 </div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                 <Target size={12} className="text-rose-400" />
                 <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-600 uppercase">EFEITO</span>
                   <span className="text-[9px] font-black text-white uppercase truncate">{weapon.effect}</span>
                 </div>
              </div>
            </div>
            
            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all">EQUIPAR</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryView;
