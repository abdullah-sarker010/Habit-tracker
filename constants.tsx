
import { Habit, Goal, GoalType, Reward } from './types';

export const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Morning Meditation', points: 10, completedDates: [] },
  { id: '2', name: '30 min Exercise', points: 20, completedDates: [] },
  { id: '3', name: 'Read 10 pages', points: 15, completedDates: [] },
  { id: '4', name: 'Drink 2L Water', points: 5, completedDates: [] },
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g1', text: 'Wake up at 6 AM', type: GoalType.DAILY, completed: false, createdAt: new Date().toISOString() },
  { id: 'g2', text: 'Visit the gym', type: GoalType.WEEKLY, completed: false, createdAt: new Date().toISOString(), currentValue: 0, targetValue: 4 },
  { id: 'g3', text: 'Complete course modules', type: GoalType.MONTHLY, completed: false, createdAt: new Date().toISOString(), currentValue: 1, targetValue: 12 },
  { id: 'g4', text: 'Save money ($)', type: GoalType.YEARLY, completed: false, createdAt: new Date().toISOString(), currentValue: 500, targetValue: 5000 },
];

export const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', name: 'Treat yourself to Coffee', cost: 100, unlocked: false },
  { id: 'r2', name: 'Watch a Movie', cost: 300, unlocked: false },
  { id: 'r3', name: 'Dinner Out', cost: 1000, unlocked: false },
  { id: 'r4', name: 'New Gadget', cost: 5000, unlocked: false },
];
