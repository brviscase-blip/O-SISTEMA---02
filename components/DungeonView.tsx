
import React, { useState, useEffect } from 'react';
import { 
  Skull, Sword, Shield, Sparkles, Zap, Heart, 
  Crosshair, ChevronRight, Radar, Lock, Volume2, VolumeX,
  Pickaxe, Gem, Box, ShieldAlert, Target, Info, Flame, Wand2
} from 'lucide-react';
import { PlayerStatus, ItemRank } from '../types';

interface DungeonViewProps {
  playerStatus: PlayerStatus;
  setPlayerStatus: React.Dispatch<React.SetStateAction<PlayerStatus>>;
  addNotification: (message: string, type?: any) => void;
}

type CombatStatus = 'RADAR' | 'LOBBY' | 'DUEL' | 'VICTORY' | 'DEFEAT' | 'EXCAVATION';
type ActionType = 'ATAQUE' | 'DEFESA' | 'MAGIA';

interface Portal {
  id: string;
  rank: ItemRank;
  name: string;
  type: 'AZUL' | 'VERMELHO';
  expiresAt: number;
  enemyType: 'FERA' | 'GOLEM' | 'HUMANOIDE' | 'MORTO-VIVO';
  dominantStat: keyof PlayerStatus['stats'];
}

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  atk: number;
  def: number;
  speed: number;
  nextIntent: ActionType;
}

export const DungeonView: React.FC<DungeonViewProps> = ({ playerStatus, setPlayerStatus, addNotification }) => {
  const [gameState, setGameState] = useState<CombatStatus>('RADAR');
  const [activePortal, setActivePortal] = useState<Portal | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isHitting, setIsHitting] = useState<'PLAYER' | 'ENEMY' | null>(null);
  const [isTakingDamage, setIsTakingDamage] = useState(false);
  
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [playerBattleHp, setPlayerBattleHp] = useState(100);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [miningNodes, setMiningNodes] = useState<any[]>([]);

  const [availablePortals, setAvailablePortals] = useState<Portal[]>([]);
  const [nextScanTime, setNextScanTime] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const scanForPortals = () => {
    const count = Math.floor(Math.random() * 3) + 2;
    const names = ["Ninho das Feras", "Cidadela de Ferro", "Cripta Maldita", "Altar de Gelo"];
    const types: any[] = ['FERA', 'GOLEM', 'HUMANOIDE', 'MORTO-VIVO'];
    const stats: any[] = ['strength', 'agility', 'vitality', 'intelligence'];
    
    const newPortals: Portal[] = Array.from({ length: count }).map((_, i) => ({
      id: `PORTAL-${Date.now()}-${i}`,
      rank: Math.random() > 0.7 ? 'D' : 'E',
      name: `${names[Math.floor(Math.random() * names.length)]}`,
      type: Math.random() > 0.8 ? 'VERMELHO' : 'AZUL',
      expiresAt: Date.now() + (1000 * 60 * 60),
      enemyType: types[Math.floor(Math.random() * types.length)],
      dominantStat: stats[Math.floor(Math.random() * stats.length)]
    }));
    setAvailablePortals(newPortals);
    setNextScanTime(Date.now() + (1000 * 60 * 10));
    addNotification(`${count} Fendas localizadas`, 'info');
  };

  const getRandomIntent = (): ActionType => {
    const intents: ActionType[] = ['ATAQUE', 'DEFESA', 'MAGIA'];
    return intents[Math.floor(Math.random() * intents.length)];
  };

  const startDuel = () => {
    if (!activePortal) return;
    const lvl = playerStatus.level;
    setEnemy({
      name: `Guardião ${activePortal.enemyType}`,
      hp: 200 + (lvl * 50),
      maxHp: 200 + (lvl * 50),
      level: lvl,
      atk: 20 + lvl,
      def: 15 + lvl,
      speed: 10 + lvl,
      nextIntent: getRandomIntent()
    });
    setPlayerBattleHp(playerStatus.hp);
    setGameState('DUEL');
    setCombatLog([`Combate iniciado contra ${activePortal.name}`]);
  };

  const executeAction = (playerAction: ActionType) => {
    if (!enemy || gameState !== 'DUEL') return;
    setIsHitting('PLAYER');
    
    const enemyAction = enemy.nextIntent;
    let playerDmg = 0;
    let enemyDmg = 0;
    let logMsg = "";

    // LÓGICA DE TRIÂNGULO HIERÁRQUICO
    // Defesa > Ataque > Magia > Defesa
    
    const baseAtk = playerStatus.stats.strength * 1.5;
    const baseMag = playerStatus.stats.intelligence * 2.0;

    if (playerAction === enemyAction) {
      // Empate técnico
      playerDmg = Math.floor(baseAtk * 0.5);
      enemyDmg = Math.floor(enemy.atk * 0.5);
      logMsg = `CONFLITO DE FORÇAS: Dano reduzido para ambos!`;
    } else if (
      (playerAction === 'DEFESA' && enemyAction === 'ATAQUE') ||
      (playerAction === 'ATAQUE' && enemyAction === 'MAGIA') ||
      (playerAction === 'MAGIA' && enemyAction === 'DEFESA')
    ) {
      // Vantagem Jogador (COUNTER)
      playerDmg = Math.floor((playerAction === 'MAGIA' ? baseMag : baseAtk) * 2.0);
      enemyDmg = Math.floor(enemy.atk * 0.1); // Dano inimigo quase nulo
      logMsg = `COUNTER PERFEITO: ${playerAction} anula ${enemyAction}!`;
    } else {
      // Vantagem Inimigo
      playerDmg = Math.floor((playerAction === 'MAGIA' ? baseMag : baseAtk) * 0.3);
      enemyDmg = Math.floor(enemy.atk * 1.5);
      logMsg = `FALHA ESTRATÉGICA: ${enemyAction} quebrou seu ${playerAction}!`;
    }

    setTimeout(() => {
      setEnemy(prev => prev ? ({ ...prev, hp: Math.max(0, prev.hp - playerDmg) }) : null);
      setCombatLog(prev => [logMsg, ...prev]);
      
      if (enemy.hp - playerDmg <= 0) {
        setGameState('VICTORY');
        return;
      }

      setTimeout(() => {
        setIsHitting('ENEMY');
        setIsTakingDamage(true);
        setPlayerBattleHp(prev => Math.max(0, prev - enemyDmg));
        
        setTimeout(() => {
          setIsTakingDamage(false);
          setIsHitting(null);
          if (playerBattleHp - enemyDmg <= 0) {
            setGameState('DEFEAT');
          } else {
            // Prepara próximo turno com nova intenção
            setEnemy(prev => prev ? ({ ...prev, nextIntent: getRandomIntent() }) : null);
          }
        }, 300);
      }, 600);
    }, 400);
  };

  const startExcavation = () => {
    const nodes = Array.from({ length: 5 }).map((_, i) => ({
      id: i, type: Math.random() > 0.7 ? 'BAÚ' : 'GEM', collected: false,
      x: 20 + Math.random() * 60, y: 30 + Math.random() * 40
    }));
    setMiningNodes(nodes);
    setGameState('EXCAVATION');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#010307] text-slate-200 overflow-hidden relative">
      <style>{`
        .arena-bg { background: linear-gradient(to bottom, #020617, #010307); }
        .vignette { box-shadow: inset 0 0 150px rgba(0,0,0,0.9); }
        @keyframes shake { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(-4px, 4px); } 50% { transform: translate(4px, -4px); } }
        .animate-shake { animation: shake 0.1s infinite; }
        @keyframes glow-pulse { 0% { opacity: 0.3; } 50% { opacity: 0.8; } 100% { opacity: 0.3; } }
        .intent-glow { animation: glow-pulse 1.5s infinite; }
      `}</style>

      {gameState === 'RADAR' && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-[#030712] border border-slate-800 p-8 rounded-sm text-center">
            <div className={`w-32 h-32 mx-auto rounded-full border-2 border-dashed flex items-center justify-center mb-6 ${currentTime >= nextScanTime ? 'border-blue-500' : 'border-slate-800'}`}>
              <Radar size={48} className={currentTime >= nextScanTime ? 'text-blue-500 animate-pulse' : 'text-slate-800'} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-4">Scanner de Portais</h2>
            <button disabled={currentTime < nextScanTime} onClick={scanForPortals} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-sm">
              {currentTime >= nextScanTime ? 'EXECUTAR SCAN' : 'RECARREGANDO...'}
            </button>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Incursões Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePortals.map(p => {
                const rankColor = p.rank === 'S' ? 'text-rose-500' : p.rank === 'A' ? 'text-amber-500' : 'text-blue-400';
                return (
                  <div key={p.id} onClick={() => { setActivePortal(p); setGameState('LOBBY'); }} className="cursor-pointer bg-[#030712] border-2 p-6 rounded-sm border-blue-900/40 hover:border-blue-500 transition-all">
                    <span className={`text-[8px] font-black px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-sm uppercase ${rankColor}`}>RANK {p.rank}</span>
                    <h4 className="text-lg font-black text-white italic uppercase mt-2">{p.name}</h4>
                    <div className="mt-4 pt-4 border-t border-slate-800/50 text-[9px] font-bold text-slate-600 uppercase">FOCO: {p.dominantStat}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === 'LOBBY' && activePortal && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/60">
           <div className="max-w-md w-full bg-[#030712] border border-blue-500/30 p-8 rounded-sm text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-blue-900/20 border border-blue-500 rounded-full flex items-center justify-center text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Skull size={40} />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{activePortal.name}</h2>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="bg-slate-900 p-3 rounded-sm">RANK: <span className={activePortal.rank === 'S' ? 'text-rose-500' : 'text-blue-400'}>{activePortal.rank}</span></div>
                <div className="bg-slate-900 p-3 rounded-sm">TIPO: <span className="text-rose-400">{activePortal.enemyType}</span></div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                Cuidado: O triângulo de combate está ativo. Observe as intenções do guardião.
              </p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setGameState('RADAR')} className="flex-1 py-4 border border-slate-800 text-slate-500 text-[10px] font-black uppercase hover:text-white transition-all">ABORTAR</button>
                <button onClick={startDuel} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20">ENTRAR NA FENDA</button>
              </div>
           </div>
        </div>
      )}

      {gameState === 'DUEL' && enemy && (
        <div className={`flex-1 flex flex-col arena-bg vignette relative p-4 ${isTakingDamage ? 'animate-shake' : ''}`}>
          <div className="flex justify-center pt-8">
            <div className="w-full max-w-xl bg-black/60 border-2 border-slate-800 p-4 rounded-sm flex items-center gap-6 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">INTENÇÃO:</span>
                 <div className={`px-3 py-1 bg-black/60 border rounded-sm flex items-center gap-2 intent-glow ${enemy.nextIntent === 'ATAQUE' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : enemy.nextIntent === 'DEFESA' ? 'border-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.3)]' : 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}>
                    {enemy.nextIntent === 'ATAQUE' && <Sword size={12} className="text-red-500" />}
                    {enemy.nextIntent === 'DEFESA' && <Shield size={12} className="text-slate-400" />}
                    {enemy.nextIntent === 'MAGIA' && <Sparkles size={12} className="text-blue-400" />}
                    <span className={`text-[10px] font-black uppercase ${enemy.nextIntent === 'ATAQUE' ? 'text-red-500' : enemy.nextIntent === 'DEFESA' ? 'text-slate-400' : 'text-blue-400'}`}>{enemy.nextIntent}</span>
                 </div>
              </div>
              
              <Skull size={40} className="text-rose-500" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-end">
                  <h3 className="text-base font-black text-white uppercase italic">{enemy.name}</h3>
                  <span className="text-xs font-black text-rose-500">{enemy.hp} / {enemy.maxHp} HP</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-rose-600 transition-all duration-500" style={{ width: `${(enemy.hp/enemy.maxHp)*100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-black/40 h-32 overflow-y-auto p-4 text-center flex flex-col-reverse gap-2 rounded-sm border border-slate-800/30">
              {combatLog.map((l, i) => <p key={i} className={`text-[10px] font-black uppercase italic ${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{l}</p>)}
            </div>
          </div>

          <div className="mt-auto max-w-4xl mx-auto w-full space-y-6 pb-8">
            <div className="space-y-2 px-4">
              <div className="flex justify-between text-[10px] font-black text-white uppercase italic">
                <span>SINCRONIZAÇÃO VITAL</span>
                <span className="text-blue-400">{playerBattleHp} HP</span>
              </div>
              <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300" style={{ width: `${(playerBattleHp/playerStatus.hp)*100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 px-4">
              <CombatActionBtn label="ATAQUE" onClick={() => executeAction('ATAQUE')} icon={<Sword size={24}/>} color="red" />
              <CombatActionBtn label="DEFESA" onClick={() => executeAction('DEFESA')} icon={<Shield size={24}/>} color="slate" />
              <CombatActionBtn label="MAGIA" onClick={() => executeAction('MAGIA')} icon={<Sparkles size={24}/>} color="blue" />
            </div>
          </div>
        </div>
      )}

      {(gameState === 'VICTORY' || gameState === 'DEFEAT') && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6">
          <div className={`max-w-sm w-full border-2 p-10 text-center rounded-sm ${gameState === 'VICTORY' ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.2)]'}`}>
            <h2 className="text-2xl font-black text-white uppercase italic mb-8 tracking-tighter">{gameState === 'VICTORY' ? 'MASMORRA CONCLUÍDA' : 'FALHA FATAL'}</h2>
            <button onClick={gameState === 'VICTORY' ? startExcavation : () => setGameState('RADAR')} className={`w-full py-4 ${gameState === 'VICTORY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} text-white text-[10px] font-black uppercase tracking-[0.4em]`}>
              {gameState === 'VICTORY' ? 'EXTRAIR ESPÓLIOS' : 'RETORNAR'}
            </button>
          </div>
        </div>
      )}

      {gameState === 'EXCAVATION' && (
        <div className="flex-1 flex flex-col p-6">
          <div className="bg-[#030712] border border-slate-800 p-8 rounded-sm mb-6 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">EXTRAÇÃO DE RECURSOS</h2>
            <button onClick={() => setGameState('RADAR')} className="px-8 py-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">CONCLUIR LIMPEZA</button>
          </div>
          <div className="flex-1 bg-black/40 border border-slate-800/50 rounded-sm relative overflow-hidden min-h-[400px]">
            {miningNodes.map(n => !n.collected && (
              <button key={n.id} onClick={() => {
                setMiningNodes(prev => prev.map(item => item.id === n.id ? { ...item, collected: true } : item));
                const gold = 500 + Math.floor(Math.random() * 500);
                setPlayerStatus(ps => ({ ...ps, gold: ps.gold + gold }));
                addNotification(`+${gold} Ouro extraído`, 'success');
              }} style={{ left: `${n.x}%`, top: `${n.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                {n.type === 'BAÚ' ? <Box size={40} className="text-amber-500" /> : <Gem size={40} className="text-blue-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CombatActionBtn = ({ label, icon, color, onClick }: any) => {
  const colors: any = {
    red: 'from-red-600/20 to-red-950/40 border-red-500/40 hover:border-red-500 text-red-500 shadow-red-500/10 hover:shadow-red-500/30',
    blue: 'from-blue-600/20 to-blue-950/40 border-blue-500/40 hover:border-blue-500 text-blue-500 shadow-blue-500/10 hover:shadow-blue-500/30',
    slate: 'from-slate-600/20 to-slate-950/40 border-slate-500/40 hover:border-slate-400 text-slate-400 shadow-slate-500/10 hover:shadow-slate-500/30'
  };
  return (
    <button onClick={onClick} className={`group flex flex-col items-center justify-center p-6 bg-gradient-to-b ${colors[color]} border-2 rounded-sm transition-all hover:-translate-y-1 active:scale-95 shadow-lg`}>
      <div className="mb-4 transition-transform group-hover:scale-110">{icon}</div>
      <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
};
