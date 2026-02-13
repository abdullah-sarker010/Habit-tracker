
import React from 'react';
import { Habit } from '../types';

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted, onToggle, onDelete, darkMode }) => {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl shadow-sm border transition-all ${isCompleted ? 'border-current' : 'border-transparent'} bg-white bg-opacity-5`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
            isCompleted 
              ? (darkMode ? 'bg-white border-white text-black' : 'bg-black border-black text-white') 
              : 'border-gray-400'
          }`}
        >
          {isCompleted && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <div>
          <h3 className={`font-bold text-sm ${isCompleted ? 'line-through opacity-40' : ''}`}>
            {habit.name}
          </h3>
          <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">{habit.points} PTS</span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(habit.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
