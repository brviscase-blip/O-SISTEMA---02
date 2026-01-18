
import React from 'react';

export type ViewType = 'SISTEMA' | 'TAREFAS' | 'DUNGEON' | 'TIMELINE' | 'PUNISHMENT';
export type ItemRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/* Shared Dashboard Member Stats */
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

/* File System Types */
export type FileCategory = 'TODOS OS ATIVOS' | 'DOCUMENTOS' | 'FINANCEIROS' | 'JURÍDICOS';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  category: FileCategory;
  size: string;
}

/* Demand & Task Management Types */
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
  order?: number;
}

/* Notes & Documentation Types */
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

/* Player & RPG System Types */
export interface PlayerStats {
  strength: number;
  agility: number;
  intelligence: number;
  perception: number;
  vitality: number;
  hp?: number; // Representa o Dungeon HP Máximo (Base + Nível*15)
  mp?: number; 
}

export interface PlayerStatus {
  level: number;
  xp: number;
  maxXp: number;
  rank: ItemRank;
  job: string;
  title: string;
  hp: number;        // HP Global Atual (Vida Real)
  maxHp: number;     // HP Global Máximo (Baseado no Rank: 100, 200...)
  dungeon_hp: number; // HP de Combate Atual
  max_dungeon_hp: number; // HP de Combate Máximo
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

export type EquipmentSlot = 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'ring';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  startDate: string;
  reminderTime?: string;
  days: number[]; 
  completedDays: Record<string, boolean | number>; 
  targetValue: number; 
  xpReward: number;
  streak: number;
}

export interface Task {
  id: string;
  title: string;
  icon: string;
  startDate: string;
  reminderTime?: string;
  isRecurring: boolean;
  days: number[]; 
  completed: boolean;
  lastCompleted?: string;
  targetValue: number; 
  currentProgress: number; 
  xpReward: number;
}

export interface Vice {
  id: string;
  name: string;
  initialLimit: number;
  currentCount: number;
  penaltyHp: number;
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

export interface SystemEvent {
  id: string;
  title: string;
  duration: number;
  reward: {
    xp?: number;
    gold?: number;
    stats?: number;
  };
  penalty: {
    hp?: number;
  };
}

export interface ArmorSet {
  id: string;
  nome: string;
  rank: ItemRank;
  descricao_lore: string;
  nivel_desbloqueio: number;
  img: string | null;
  boss_id: string | null;
  desafio_concluido: boolean;
}

export interface Quest {
  id: string;
  title: string;
  type: 'NORMAL' | 'URGENTE';
  status: 'ATIVA' | 'CONCLUIDA';
  progress: number;
  goal: number;
  reward: string;
}

export interface Weapon {
  id: string;
  name: string;
  rank: ItemRank;
  type: string;
  damage: number;
  effect: string;
  description: string;
}
