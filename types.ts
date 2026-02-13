
export enum GoalType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface Habit {
  id: string;
  name: string;
  points: number;
  completedDates: string[]; // ISO format YYYY-MM-DD
}

export interface Goal {
  id: string;
  text: string;
  type: GoalType;
  completed: boolean;
  createdAt: string;
  currentValue?: number;
  targetValue?: number;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
}

export interface UserStats {
  totalPoints: number;
  streak: number;
  perfectDays: string[]; // Dates where all DAILY goals were completed
}
