
import React from 'react';
import { Goal, GoalType } from '../types';

interface GoalCardProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateProgress?: (id: string, newValue: number) => void;
  darkMode: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onToggle, onDelete, onUpdateProgress, darkMode }) => {
  const isProgressGoal = goal.type !== GoalType.DAILY && goal.targetValue !== undefined;
  const percentage = isProgressGoal ? Math.min(100, Math.round(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100)) : 0;

  return (
    <div className="p-3 bg-white bg-opacity-5 rounded-lg mb-2 group border border-transparent hover:border-current/10 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {!isProgressGoal ? (
            <input 
              type="checkbox" 
              checked={goal.completed} 
              onChange={() => onToggle(goal.id)}
              className="w-4 h-4 accent-current rounded cursor-pointer shrink-0"
            />
          ) : (
             <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${
               goal.completed 
                ? (darkMode ? 'bg-white border-white' : 'bg-black border-black') 
                : 'bg-transparent border-gray-400'
             }`}>
                {goal.completed && (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${darkMode ? 'text-black' : 'text-white'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
             </div>
          )}
          <span className={`text-sm font-medium truncate ${goal.completed ? 'line-through opacity-30' : ''}`}>
            {goal.text}
          </span>
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isProgressGoal && (
        <div className="ml-7 mt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">
              {goal.currentValue} / {goal.targetValue}
            </span>
            <span className="text-[10px] font-black">
              {percentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-400 bg-opacity-20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onUpdateProgress?.(goal.id, Math.max(0, (goal.currentValue || 0) - 1))}
              className="px-2 py-0.5 border border-current/20 rounded bg-white bg-opacity-5 text-[10px] font-bold hover:bg-current hover:text-gray-900 transition-colors"
            >
              -1
            </button>
            <button 
              onClick={() => onUpdateProgress?.(goal.id, (goal.currentValue || 0) + 1)}
              className="px-2 py-0.5 border border-current/20 rounded bg-white bg-opacity-5 text-[10px] font-bold hover:bg-current hover:text-gray-900 transition-colors"
            >
              +1
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
