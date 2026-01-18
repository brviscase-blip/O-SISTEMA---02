
import React;

export type ViewType = 'SISTEMA' | 'TAREFAS' | 'DUNGEON' | 'TIMELINE';
export type ItemRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface PlayerStats {
  strength: number;
  agility: number;
  intelligence: number;
  perception: number;
  vitality: number;
  hp?: number; 
  mp?: number; 
}

export interface ArmorSet {
  id: string;
  nome: string;
  rank: ItemRank;
  descricao_lore: string;
  nivel_desbloqueio: number;
  img?: string;
  boss_id?: string;
  desafio_concluido?: boolean;
  created_at?: string;
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
  selectedCards: string[]; 
  milestones: Milestone[];
  completedTrials: string[];
  isDebilitated?: boolean;
  isJobQuestActive?: boolean;
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

export type FileCategory = 'TODOS OS ATIVOS' | 'DOCUMENTOS' | 'FINANCEIROS' | 'JURÍDICOS';
export interface FileItem {
  id: string;
  name: string;
  type: string;
  category: FileCategory;
  size: string;
}

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

export type EquipmentSlot = 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'ring';

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
