
import React from 'react';

export type ViewType = 'SISTEMA' | 'TAREFAS' | 'DUNGEON' | 'TIMELINE';
export type ItemRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface PlayerStats {
  strength: number;
  agility: number;
  intelligence: number;
  perception: number;
  vitality: number;
}

export interface PlayerStatus {
  level: number;
  xp: number;
  maxXp: number;
  rank: ItemRank;
  job: string;
  title: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  statPoints: number;
  stats: PlayerStats;
  equipment: Record<string, EquipmentItem | null>;
  inventory: any[];
  selectedCards: string[]; // IDs das cartas selecionadas para o deck de combate
  milestones: Milestone[];
  isDebilitated?: boolean;
  isJobQuestActive?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  startDate: string;
  reminderTime?: string;
  days: number[]; // 0-6
  completedDays: Record<string, boolean | number>; // 'YYYY-MM-DD': true ou valor numérico
  targetValue: number; // 1 para check simples, > 1 para contador
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
  days: number[]; // Adicionado para suportar recorrência semanal (0-6)
  completed: boolean;
  lastCompleted?: string;
  targetValue: number; // 1 para check simples
  currentProgress: number; // Para tarefas diárias quantitativas
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

// --- Demand Types ---
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

// --- File Types ---
export type FileCategory = 'TODOS OS ATIVOS' | 'DOCUMENTOS' | 'FINANCEIROS' | 'JURÍDICOS';
export interface FileItem {
  id: string;
  name: string;
  type: string;
  category: FileCategory;
  size: string;
}

// --- Note Types ---
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

// --- Equipment Types ---
export type EquipmentSlot = 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'ring';
export interface EquipmentItem {
  id: string;
  name: string;
  rank: ItemRank;
  slot: string;
  bonus: Partial<PlayerStats>;
  description: string;
  icon: string;
}

// --- Quest & Weapon Types ---
export interface Quest {
  id: string;
  title: string;
  type: 'COMUM' | 'URGENTE' | 'TROCA_CLASSE';
  status: 'ATIVA' | 'CONCLUIDA' | 'FALHA';
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

// --- Milestone & Event Types ---
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
