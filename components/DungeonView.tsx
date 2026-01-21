
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Skull, Sword, Shield, Sparkles, Zap, Heart, 
  Crosshair, ChevronRight, Radar, Lock, Volume2, VolumeX,
  Pickaxe, Gem, Box, ShieldAlert, Target, Info, Flame, Wand2,
  Trophy, Star, Crown, Loader2, Coins, MapPin, Percent
} from 'lucide-react';
import { PlayerStatus, ItemRank } from '../types';
import { getSupabaseClient } from '../supabaseClient';

interface DungeonViewProps {
  playerStatus: PlayerStatus;
  setPlayerStatus: React.Dispatch<React.SetStateAction<PlayerStatus>>;
  addNotification: (message: string, type?: any) => void;
  forcedTrialWeapon?: any | null;
  onTrialEnd?: () => void;
}

type CombatStatus = 'RADAR' | 'LOBBY' | 'DUEL' | 'VICTORY' | 'DEFEAT' | 'EXCAVATION' | 'TRIAL_SUCCESS';
type ActionType = 'ATAQUE' | 'DEFESA' | 'MAGIA';

interface Portal {
  id: string;
  rank: ItemRank;
  name: string;
  type: 'AZUL' | 'VERMELHO';
  expiresAt: number;
  enemyType: 'FERA' | 'GOLEM' | 'HUMANOIDE' | 'MORTO-VIVO' | 'BOSS_TRIAL';
  dominantStat: keyof PlayerStatus['stats'];
  territory?: string;
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
  isTrialBoss?: boolean;
}

export const DungeonView: React.FC<DungeonViewProps> = ({ playerStatus, setPlayerStatus, addNotification, forcedTrialWeapon, onTrialEnd }) => {
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

  const equippedWeapon = useMemo(() => {
    const saved = localStorage.getItem('nexus_equipped_weapons');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.primary || parsed.secondary || null;
    }
    return null;
  }, [gameState]);

  useEffect(() => {
    if (forcedTrialWeapon) {
      const trialPortal: Portal = {
        id: `TRIAL-${forcedTrialWeapon.id}`,
        rank: forcedTrialWeapon.rank,
        name: `Desafio: ${forcedTrialWeapon.nome}`,
        type: 'VERMELHO',
        expiresAt: Date.now() + 1000 * 3600,
        enemyType: 'BOSS_TRIAL',
        dominantStat: String(forcedTrialWeapon.atributo_base || 'strength').toLowerCase() as any,
        territory: 'Nexus Central'
      };
      setActivePortal(trialPortal);
      setGameState('LOBBY');
    }
  }, [forcedTrialWeapon]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const scanForPortals = () => {
    const territories = [
      'Ruínas da Cidade Morta', 'Fortaleza de Baran', 'Campos de Gelo Eterno', 
      'Minas de Cristal Baixo', 'Templo de Carthenon', 'Montanhas de Nevasca', 
      'Pântanos de Hapax', 'Trono do Cavaleiro', 'Vale dos Reis Antigos', 
      'Pântano de Kasaka', 'Posto Avançado Abandonado'
    ];
    
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
      dominantStat: stats[Math.floor(Math.random() * stats.length)],
      territory: territories[Math.floor(Math.random() * territories.length)]
    }));
    setAvailablePortals(newPortals);
    setNextScanTime(Date.now() + (1000 * 60 * 10));
    addNotification(`${count} Fendas localizadas`, 'info');
  };

  const startDuel = () => {
    if (!activePortal) return;
    const lvl = playerStatus.level;
    const isTrial = activePortal.enemyType === 'BOSS_TRIAL';

    setEnemy({
      name: isTrial ? "Sombra do Guardião" : `Guardião ${activePortal.enemyType}`,
      hp: isTrial ? (300 + lvl * 100) : (200 + (lvl * 50)),
      maxHp: isTrial ? (300 + lvl * 100) : (200 + (lvl * 50)),
      level: lvl,
      atk: isTrial ? (30 + lvl * 2) : (20 + lvl),
      def: 15 + lvl,
      speed: 10 + lvl,
      nextIntent: getRandomIntent(),
      isTrialBoss: isTrial
    });
    setPlayerBattleHp(playerStatus.hp);
    setGameState('DUEL');
    setCombatLog([`Combate iniciado em ${activePortal.territory || 'Desconhecido'}`]);
  };

  const getRandomIntent = (): ActionType => {
    const intents: ActionType[] = ['ATAQUE', 'DEFESA', 'MAGIA'];
    return intents[Math.floor(Math.random() * intents.length)];
  };

  const executeAction = (playerAction: ActionType) => {
    if (!enemy || gameState !== 'DUEL') return;
    setIsHitting('PLAYER');
    
    const enemyAction = enemy.nextIntent;
    let playerDmg = 0;
    let enemyDmg = 0;
    let logMsg = "";

    // Mapeamento para o novo schema
    let weaponAtkBonus = equippedWeapon ? equippedWeapon.dano_inicial : 0;
    let ignoreDefFactor = 1.0;
    let manaSteal = 0;
    
    if (equippedWeapon && equippedWeapon.descricao_efeito) {
      const desc = equippedWeapon.descricao_efeito.toLowerCase();
      if (desc.includes("ignora") && desc.includes("defesa")) {
        ignoreDefFactor = 0.5;
        logMsg = "[EFEITO: PENETRAÇÃO]";
      }
    }

    const baseAtk = (playerStatus.stats.strength * 1.5) + weaponAtkBonus;
    const baseMag = (playerStatus.stats.intelligence * 2.0) + (weaponAtkBonus * 0.5);

    if (playerAction === enemyAction) {
      playerDmg = Math.floor(baseAtk * 0.5);
      enemyDmg = Math.floor(enemy.atk * 0.5);
      logMsg = logMsg || `CONFLITO!`;
    } else if (
      (playerAction === 'DEFESA' && enemyAction === 'ATAQUE') ||
      (playerAction === 'ATAQUE' && enemyAction === 'MAGIA') ||
      (playerAction === 'MAGIA' && enemyAction === 'DEFESA')
    ) {
      const dmgPotency = playerAction === 'MAGIA' ? baseMag : baseAtk;
      playerDmg = Math.floor(dmgPotency * 2.0) - Math.floor(enemy.def * ignoreDefFactor);
      enemyDmg = Math.floor(enemy.atk * 0.1); 
      logMsg = logMsg || `COUNTER!`;
    } else {
      playerDmg = Math.floor(baseAtk * 0.3);
      enemyDmg = Math.floor(enemy.atk * 1.5);
      logMsg = logMsg || `FALHA!`;
    }

    setTimeout(() => {
      setEnemy(prev => prev ? ({ ...prev, hp: Math.max(0, prev.hp - playerDmg) }) : null);
      if (logMsg) setCombatLog(prev => [logMsg, ...prev]);
      
      if (enemy.hp - playerDmg <= 0) {
        setGameState(enemy.isTrialBoss ? 'TRIAL_SUCCESS' : 'VICTORY');
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
            setEnemy(prev => prev ? ({ ...prev, nextIntent: getRandomIntent() }) : null);
          }
        }, 300);
      }, 600);
    }, 400);
  };

  const calculateLoot = async () => {
    if (!activePortal) return;
    const client = getSupabaseClient();
    const gold = 500 + Math.floor(Math.random() * 1000);
    setPlayerStatus(ps => ({ ...ps, gold: ps.gold + gold }));
    addNotification(`+${gold} OURO EXTRAÍDO`, 'success');
    setGameState('RADAR');
  };

  const handleFinishTrial = () => {
      onTrialEnd?.();
      setGameState('RADAR');
      setActivePortal(null);
      addNotification(`Novo Artefato Desbloqueado: ${forcedTrialWeapon.nome}`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#010307] text-slate-200 overflow-hidden relative h-full">
      <style>{`
        .arena-bg { background: linear-gradient(to bottom, #020617, #010307); }
        .vignette { box-shadow: inset 0 0 150px rgba(0,0,0,0.9); }
        @keyframes shake { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(-4px, 4px); } 50% { transform: translate(4px, -4px); } }
        .animate-shake { animation: shake 0.1s infinite; }
      `}</style>

      {gameState === 'RADAR' && (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-[#030712] border border-slate-800 p-8 rounded-sm text-center">
            <div className={`w-32 h-32 mx-auto rounded-full border-2 border-dashed flex items-center justify-center mb-6 ${currentTime >= nextScanTime ? 'border-blue-500' : 'border-slate-800'}`}>
              <Radar size={48} className={currentTime >= nextScanTime ? 'text-blue-500 animate-pulse' : 'text-slate-800'} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-4">Scanner de Portais</h2>
            <button disabled={currentTime < nextScanTime} onClick={scanForPortals} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-sm transition-all shadow-lg active:scale-95 disabled:opacity-50">
              {currentTime >= nextScanTime ? 'EXECUTAR SCAN' : 'RECARREGANDO...'}
            </button>
            <div className="mt-8 pt-6 border-t border-slate-800/50">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Armamento Ativo</p>
               <div className={`p-3 border rounded-sm flex items-center gap-3 ${equippedWeapon ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800 opacity-30'}`}>
                  <Sword size={16} className={equippedWeapon ? 'text-blue-400' : 'text-slate-600'} />
                  <span className="text-[10px] font-black text-white uppercase italic truncate">
                    {equippedWeapon ? equippedWeapon.nome : 'Desarmado'}
                  </span>
               </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Anomalias Detectadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePortals.map(p => (
                <div key={p.id} onClick={() => { setActivePortal(p); setGameState('LOBBY'); }} className="cursor-pointer bg-[#030712] border-2 p-6 rounded-sm border-blue-900/40 hover:border-blue-500 transition-all group">
                   <div className="flex items-center gap-2 mb-2"><MapPin size={10} className="text-blue-400" /><span className="text-[8px] font-black text-slate-600 uppercase italic truncate">{p.territory}</span></div>
                   <h4 className="text-lg font-black text-white italic uppercase group-hover:text-blue-400 transition-colors">{p.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'DUEL' && enemy && (
        <div className={`flex-1 flex flex-col arena-bg vignette relative p-4 h-full ${isTakingDamage ? 'animate-shake' : ''}`}>
           <div className="flex justify-center pt-8">
            <div className={`w-full max-w-xl bg-black/60 border-2 border-slate-800 p-4 rounded-sm flex items-center gap-6`}>
              <Skull size={40} className="text-rose-500" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-end">
                  <h3 className="text-base font-black text-white uppercase italic">{enemy.name}</h3>
                  <span className="text-xs font-black text-rose-500">{enemy.hp} HP</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div className={`h-full bg-rose-600 transition-all duration-500`} style={{ width: `${(enemy.hp/enemy.maxHp)*100}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-black/40 h-32 overflow-y-auto p-4 text-center flex flex-col-reverse gap-2 rounded-sm border border-slate-800/30 custom-scrollbar">
              {combatLog.map((l, i) => <p key={i} className={`text-[10px] font-black uppercase italic ${i === 0 ? 'text-blue-400' : 'text-slate-500 opacity-50'}`}>{l}</p>)}
            </div>
          </div>
          <div className="mt-auto max-w-4xl mx-auto w-full space-y-6 pb-12">
            <div className="grid grid-cols-3 gap-4 px-4">
              <button onClick={() => executeAction('ATAQUE')} className="p-6 bg-red-600/20 border-2 border-red-500/40 rounded-sm text-red-500 font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all">ATAQUE</button>
              <button onClick={() => executeAction('DEFESA')} className="p-6 bg-slate-600/20 border-2 border-slate-500/40 rounded-sm text-slate-400 font-black uppercase italic tracking-widest hover:bg-slate-600 hover:text-white transition-all">DEFESA</button>
              <button onClick={() => executeAction('MAGIA')} className="p-6 bg-blue-600/20 border-2 border-blue-500/40 rounded-sm text-blue-400 font-black uppercase italic tracking-widest hover:bg-blue-600 hover:text-white transition-all">MAGIA</button>
            </div>
          </div>
        </div>
      )}

      {(gameState === 'VICTORY' || gameState === 'DEFEAT' || gameState === 'TRIAL_SUCCESS') && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className={`max-w-sm w-full border-2 p-10 text-center rounded-sm transition-all ${gameState === 'DEFEAT' ? 'border-rose-500' : 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]'}`}>
            <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">
                {gameState === 'TRIAL_SUCCESS' ? 'PROVA CONCLUÍDA' : gameState === 'VICTORY' ? 'MASMORRA CONCLUÍDA' : 'FALHA FATAL'}
            </h2>
            <button 
              onClick={gameState === 'TRIAL_SUCCESS' ? handleFinishTrial : gameState === 'VICTORY' ? calculateLoot : () => setGameState('RADAR')} 
              className={`w-full py-4 mt-6 ${gameState === 'DEFEAT' ? 'bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-500'} text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all`}
            >
              {gameState === 'TRIAL_SUCCESS' ? 'REIVINDICAR ITEM' : 'RETORNAR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
