
import React from 'react';
import { Weapon } from '../types';
import { Sword, Zap, Shield, Target } from 'lucide-react';

// Updated MOCK_WEAPONS to match the current Weapon interface from types.ts
const MOCK_WEAPONS: Weapon[] = [
  {
    id: 'w-01',
    nome: "Rasaka's Fang",
    rank: 'C',
    atributo_base: 'AGILIDADE',
    dano_inicial: 25,
    lvl_range: '1-10',
    material_refino: 'Dente de Rasaka',
    efeito_passivo: 'Paralisia & Sangramento',
    descricao_efeito: "Uma adaga feita do dente do Grande Veneno de Rasaka.",
    historia: "Derrubada no Pântano de Kasaka.",
    img: ""
  },
  {
    id: 'w-02',
    nome: "Baruka's Dagger",
    rank: 'A',
    atributo_base: 'AGILIDADE',
    dano_inicial: 110,
    lvl_range: '20-30',
    material_refino: 'Cristal de Gelo',
    efeito_passivo: '+30 Agilidade',
    descricao_efeito: "A adaga preferida do Lorde Elfo de Gelo, Baruka.",
    historia: "Conquistada após derrotar Baruka.",
    img: ""
  },
  {
    id: 'w-03',
    nome: "Demon King's Shortsword",
    rank: 'S',
    atributo_base: 'AGILIDADE',
    dano_inicial: 350,
    lvl_range: '50-60',
    material_refino: 'Pedra do Rei Demônio',
    efeito_passivo: 'Tempestade de Raios',
    descricao_efeito: "Empunhada pelo Rei Demônio Baran. Possui o poder dos relâmpagos.",
    historia: "Herança do Rei Demônio Baran.",
    img: ""
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
                {weapon.img ? <img src={weapon.img} className="w-full h-full object-cover" /> : <Sword size={32} />}
              </div>
              <div>
                {/* Fixed: Use weapon.nome instead of weapon.name */}
                <h4 className="text-sm font-black text-white uppercase tracking-tighter">{weapon.nome}</h4>
                {/* Fixed: Use weapon.atributo_base instead of weapon.type */}
                <p className="text-[9px] font-black text-purple-500 uppercase">{weapon.atributo_base}</p>
              </div>
            </div>

            {/* Fixed: Use weapon.descricao_efeito instead of weapon.description */}
            <p className="text-[10px] text-slate-500 leading-relaxed italic">{weapon.descricao_efeito}</p>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                 <Zap size={12} className="text-blue-400" />
                 <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-600 uppercase">DANO</span>
                   {/* Fixed: Use weapon.dano_inicial instead of weapon.damage */}
                   <span className="text-xs font-black text-white">{weapon.dano_inicial}</span>
                 </div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800 flex items-center gap-2">
                 <Target size={12} className="text-rose-400" />
                 <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-600 uppercase">EFEITO</span>
                   {/* Fixed: Use weapon.efeito_passivo instead of weapon.effect */}
                   <span className="text-[9px] font-black text-white uppercase truncate">{weapon.efeito_passivo}</span>
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
