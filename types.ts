
import React from 'react';

export type ViewType = 'SISTEMA' | 'TAREFAS' | 'DUNGEON' | 'TIMELINE' | 'PUNISHMENT';
export type ItemRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface PlayerStats {
  strength: number;
  agility: number;
  intelligence: number;
  perception: number;
  vitality: number;
  hp?: number; // Representa o bônus de itens no Dungeon HP
  mp?: number; 
}

export interface PlayerStatus {
  level: number;
  xp: number;
  maxXp: number;
  rank: ItemRank;
  job: string;
  title: string;
  hp: number;             // HP Global Atual (Vitalidade Real)
  maxHp: number;          // HP Global Máximo (Baseado no Rank)
  dungeon_hp: number;     // HP de Combate Atual
  max_dungeon_hp: number; // HP de Combate Máximo (+15 por nível)
  mp: number;
  maxMp: number;
  gold: number;
  statPoints: number;
  stats: PlayerStats;
  equipment: Record<string, EquipmentItem | null>;
  inventory: any[];
  milestones: Milestone[];
  completedTrials: string[];
  isPunished: boolean;
  punishmentStartTime?: string;
  criticalFailureCount: number;
}

export interface EquipmentItem {
  id: string;
  nome: string; 
  rank: ItemRank;
  slot: string;
  bonus: Partial<PlayerStats>;
  bonus_status?: string; 
  description: string;
  img: string;
  conjunto_id?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  days: number[]; 
  completedDays: Record<string, boolean | number>; 
  targetValue: number; 
  xpReward: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
}

export interface Vice {
  id: string;
  name: string;
  penaltyHpPercent: number; // Ex: 0.20 para 20%
}

export type NotificationType = 'success' | 'warning' | 'info' | 'error' | 'alert';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  rank: ItemRank;
  level: number;
}

/**
 * Interface de Conjunto de Armadura atualizada com campos requeridos
 * pelo sistema ArmorsNexus e gerenciamento de trials.
 */
export interface ArmorSet {
  id: string;
  nome: string;
  rank: ItemRank;
  nivel_desbloqueio: number;
  boss_id: string | null;
  desafio_concluido?: boolean;
  descricao_lore?: string;
  img?: string;
}

// --- Novas Definições para o Sistema de Demandas ---

export type DemandStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Difficulty = 'FÁCIL' | 'MÉDIA' | 'DIFÍCIL' | 'EXTREMA';

export interface SubActivity {
  id: string;
  title: string;
  completed: boolean;
}

export interface DemandItem {
  id: string;
  title: string;
  requester: string;
  responsible: string;
  contract: string;
  startDate: string;
  dueDate: string;
  status: DemandStatus;
  priority: Priority;
  difficulty: Difficulty;
  pomodoros: number;
  description: string;
  subActivities: SubActivity[];
  order: number;
}

// --- Definições para o Sistema de Arquivos ---

export type FileCategory = 'TODOS OS ATIVOS' | 'DOCUMENTOS' | 'FINANCEIROS' | 'JURÍDICOS';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  category: FileCategory;
  size: string;
}

// --- Definições para o Dashboard e Eficiência ---

export interface MemberStats {
  name: string;
  total: number;
  inProgress: number;
  completed: number;
  blocked: number;
  overdue: number;
  urgent: number;
  onTime: number;
  loadScore: number;
  lastActivity: string;
}

// --- Definições para o Sistema de Notas ---

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  tags: string[];
  updatedAt: string;
  isFavorite: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

// --- Definições para o Sistema de Quests ---

export interface Quest {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  goal: number;
  reward: string;
}

// --- Definições para o Sistema de Inventário ---

export interface Weapon {
  id: string;
  name: string;
  rank: ItemRank;
  type: string;
  damage: number;
  effect: string;
  description: string;
}

// --- Definições para Eventos de Sistema ---

export interface SystemEvent {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  reward: {
    xp?: number;
    gold?: number;
    stats?: number;
  };
  penalty: {
    hp?: number;
  };
}
