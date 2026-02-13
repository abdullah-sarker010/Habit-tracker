
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, Goal, GoalType, Reward, UserStats } from './types';
import { INITIAL_HABITS, INITIAL_GOALS, INITIAL_REWARDS } from './constants';
import { HabitItem } from './components/HabitItem';
import { GoalCard } from './components/GoalCard';


const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hq_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('hq_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('hq_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('hq_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('hq_stats');
    return saved ? JSON.parse(saved) : { totalPoints: 0, streak: 0, perfectDays: [] };
  });


  const [activeTab, setActiveTab] = useState<'daily' | 'stats' | 'goals' | 'rewards'>('daily');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [showAddRewardModal, setShowAddRewardModal] = useState<boolean>(false);
  
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [newItemName, setNewItemName] = useState("");
  const [newItemPoints, setNewItemPoints] = useState(10);
  const [newGoalType, setNewGoalType] = useState<GoalType>(GoalType.DAILY);
  const [newGoalTarget, setNewGoalTarget] = useState<number>(5);
  const [tempRewardName, setTempRewardName] = useState("");
  const [tempRewardCost, setTempRewardCost] = useState(100);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const lastReset = localStorage.getItem('hq_last_reset');
    if (lastReset && lastReset !== todayStr) {
      setHabits(prev => prev.map(h => ({ ...h, completedDates: h.completedDates.filter(d => d !== lastReset) })));
      setGoals(prev => prev.map(g => g.type === GoalType.DAILY ? { ...g, completed: false } : g));
    }
    localStorage.setItem('hq_last_reset', todayStr);
  }, [todayStr]);

  useEffect(() => {
    localStorage.setItem('hq_habits', JSON.stringify(habits));
    localStorage.setItem('hq_goals', JSON.stringify(goals));
    localStorage.setItem('hq_rewards', JSON.stringify(rewards));
    localStorage.setItem('hq_stats', JSON.stringify(stats));
    localStorage.setItem('hq_dark_mode', JSON.stringify(darkMode));
  }, [habits, goals, rewards, stats, darkMode]);



  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompletedToday = h.completedDates.includes(todayStr);
        let newCompletedDates = [...h.completedDates];
        let pointChange = 0;

        if (isCompletedToday) {
          newCompletedDates = newCompletedDates.filter(d => d !== todayStr);
          pointChange = -h.points;
        } else {
          newCompletedDates.push(todayStr);
          pointChange = h.points;
        }

        setStats(s => ({ ...s, totalPoints: Math.max(0, s.totalPoints + pointChange) }));
        return { ...h, completedDates: newCompletedDates };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const addHabit = () => {
    if (!newItemName) return;
    const newHabit: Habit = { id: Date.now().toString(), name: newItemName, points: newItemPoints, completedDates: [] };
    setHabits([...habits, newHabit]);
    setNewItemName("");
    setShowAddModal(false);
  };

  const toggleGoal = (id: string) => {
    const updatedGoals = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    setGoals(updatedGoals);
    checkDailyPerfectDay(updatedGoals);
  };

  const updateGoalProgress = (id: string, newValue: number) => {
    const updatedGoals = goals.map(g => {
      if (g.id === id) {
        const isCompleted = g.targetValue !== undefined && newValue >= g.targetValue;
        return { ...g, currentValue: newValue, completed: isCompleted };
      }
      return g;
    });
    setGoals(updatedGoals);
    checkDailyPerfectDay(updatedGoals);
  };

  const checkDailyPerfectDay = (currentGoals: Goal[]) => {
    const dailyGoals = currentGoals.filter(g => g.type === GoalType.DAILY);
    if (dailyGoals.length === 0) return;

    const allDailyDone = dailyGoals.every(g => g.completed);
    setStats(prev => {
      const isAlreadyPerfect = prev.perfectDays.includes(todayStr);
      let newPerfectDays = [...(prev.perfectDays || [])];

      if (allDailyDone && !isAlreadyPerfect) {
        newPerfectDays.push(todayStr);
      } else if (!allDailyDone && isAlreadyPerfect) {
        newPerfectDays = newPerfectDays.filter(d => d !== todayStr);
      }
      return { ...prev, perfectDays: newPerfectDays };
    });
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addGoal = () => {
    if (!newItemName) return;
    const isProgress = newGoalType !== GoalType.DAILY;
    const newGoal: Goal = {
      id: Date.now().toString(), text: newItemName, type: newGoalType, completed: false,
      createdAt: new Date().toISOString(),
      currentValue: isProgress ? 0 : undefined,
      targetValue: isProgress ? newGoalTarget : undefined,
    };
    setGoals([...goals, newGoal]);
    setNewItemName("");
    setShowAddModal(false);
  };

  const addReward = () => {
    if (!tempRewardName) return;
    const newR: Reward = { id: Date.now().toString(), name: tempRewardName, cost: tempRewardCost, unlocked: false };
    setRewards([...rewards, newR]);
    setTempRewardName("");
    setShowAddRewardModal(false);
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const redeemReward = (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (reward && stats.totalPoints >= reward.cost && !reward.unlocked) {
      setStats(s => ({ ...s, totalPoints: s.totalPoints - reward.cost }));
      setRewards(prev => prev.map(r => r.id === id ? { ...r, unlocked: true } : r));
    }
  };

  const currentStreak = useMemo(() => {
    if (!stats.perfectDays || stats.perfectDays.length === 0) return 0;
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (stats.perfectDays.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  }, [stats.perfectDays, todayStr]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayArray = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const allDailyDone = stats.perfectDays.includes(dateStr);
      dayArray.push({ day: i, dateStr, completed: allDailyDone });
    }
    return dayArray;
  }, [stats.perfectDays, viewDate]);

  const changeMonth = (offset: number) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

  const navItems = [
    { id: 'daily', label: 'Daily Routine', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { id: 'goals', label: 'Goals', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { id: 'stats', label: 'History', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { id: 'rewards', label: 'Rewards', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ];

  const themeClasses = darkMode 
    ? "bg-[#000000] text-[#E8EAEB] selection:bg-gray-800" 
    : "bg-[#E8EAEB] text-[#000000] selection:bg-gray-300";
  
  const componentBg = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-black/10";

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${themeClasses}`}>
      
      <nav className={`fixed bottom-0 md:sticky md:top-0 md:h-screen w-full md:w-24 lg:w-64 border-t md:border-t-0 md:border-r z-50 flex flex-row md:flex-col items-center justify-around md:justify-start md:pt-8 pb-6 md:pb-0 shadow-sm ${darkMode ? "bg-[#000000] border-gray-800" : "bg-white border-black/10"}`}>
        <div className="hidden lg:flex items-center space-x-3 mb-10 px-6 w-full cursor-pointer" onClick={() => setActiveTab('daily')}>
          <div className={`${darkMode ? "bg-[#E8EAEB] text-[#000000]" : "bg-[#000000] text-white"} p-2 rounded-xl`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight">HabitQuest</span>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col lg:flex-row items-center lg:space-x-4 w-full px-4 lg:px-6 py-3 transition-all duration-200 ${
              activeTab === item.id 
                ? (darkMode ? 'text-[#E8EAEB] lg:bg-gray-900 lg:border-r-4 lg:border-white' : 'text-[#000000] lg:bg-[#E8EAEB] lg:border-r-4 lg:border-[#000000]') 
                : 'text-gray-500 hover:text-current lg:hover:bg-opacity-10 lg:hover:bg-gray-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1 lg:mb-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {item.icon}
            </svg>
            <span className="text-[10px] lg:text-sm font-bold uppercase lg:capitalize tracking-wider">{item.label}</span>
          </button>
        ))}

        <div className="hidden md:flex flex-col mt-auto pb-10 w-full px-6">
           <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all ${darkMode ? "bg-gray-900 text-yellow-400 hover:bg-gray-800" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
           >
             {darkMode ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
               </svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
               </svg>
             )}
             <span className="text-sm font-bold truncate">{darkMode ? 'Light' : 'Dark'}</span>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 md:pb-0 pb-24">
        <header className={`border-b p-4 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${darkMode ? "bg-black border-gray-800" : "bg-white border-black/10"}`}>
          <div>
            <h1 className="text-xl lg:text-3xl font-black">
              {activeTab === 'daily' && "Today's Routine"}
              {activeTab === 'goals' && "Life Goals"}
              {activeTab === 'stats' && "Your Progress"}
              {activeTab === 'rewards' && "The Rewards Shop"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Consistency is key.</p>
          </div>
          
          <div className="flex items-center space-x-4">
             <button onClick={() => setDarkMode(!darkMode)} className="md:hidden p-3 rounded-xl bg-gray-400 bg-opacity-10">
                {darkMode ? "☀️" : "🌙"}
             </button>
            <div className={`${darkMode ? "bg-[#E8EAEB] text-black" : "bg-[#000000] text-white"} px-6 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-xl`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Score</span>
              <span className="text-2xl font-black">{stats.totalPoints}</span>
            </div>
          </div>
        </header>



        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
          {activeTab === 'daily' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold">Routine Checklist</h2>
                  <p className="text-xs text-gray-500">Resets every 24 hours.</p>
                </div>
                <button onClick={() => { setShowAddModal(true); setNewGoalType(GoalType.DAILY); }} className={`${darkMode ? "bg-[#E8EAEB] text-black" : "bg-black text-white"} px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95`}>+ Add Routine Item</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map(habit => (
                  <HabitItem key={habit.id} habit={habit} isCompleted={habit.completedDates.includes(todayStr)} onToggle={toggleHabit} onDelete={deleteHabit} darkMode={darkMode} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold">Goals & Milestones</h2>
                <button onClick={() => setShowAddModal(true)} className={`${darkMode ? "bg-[#E8EAEB] text-black" : "bg-black text-white"} px-5 py-2.5 rounded-xl font-bold text-sm transition-all`}>New Goal</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[GoalType.DAILY, GoalType.WEEKLY, GoalType.MONTHLY, GoalType.YEARLY].map(type => (
                  <div key={type} className={`${componentBg} p-6 rounded-3xl border shadow-sm`}>
                    <h3 className="text-sm font-black uppercase text-gray-400 mb-4 flex items-center">
                       <span className={`w-3 h-3 rounded-full mr-3 ${darkMode ? "bg-white" : "bg-black"}`}></span>
                       {type} Goals
                    </h3>
                    <div className="space-y-1">
                      {goals.filter(g => g.type === type).map(goal => (
                        <GoalCard key={goal.id} goal={goal} onToggle={toggleGoal} onDelete={deleteGoal} onUpdateProgress={updateGoalProgress} darkMode={darkMode} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Daily Goal Calendar</h2>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => changeMonth(-1)} className={`p-2 border rounded-xl ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-black/5"}`}><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={() => setViewDate(new Date())} className={`px-3 py-1 border rounded-xl text-[10px] font-bold uppercase tracking-widest ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-black/5"}`}>Today</button>
                    <button onClick={() => changeMonth(1)} className={`p-2 border rounded-xl ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-black/5"}`}><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                  </div>
                </div>
                <div className={`${componentBg} border rounded-[2.5rem] p-8 shadow-xl`}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span className="text-4xl font-black">{calendarDays.filter(d => d.completed).length}</span>
                      <span className="ml-3 text-gray-400 text-xs uppercase tracking-widest">Mastered Days</span>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${darkMode ? "bg-gray-800" : "bg-[#E8EAEB]"}`}>
                      {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate)}
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {['S','M','T','W','T','F','S'].map(d => (
                      <div key={d} className="text-center text-[10px] text-gray-400 font-black">{d}</div>
                    ))}
                    {Array.from({length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()}).map((_, i) => <div key={`p-${i}`} />)} 
                    {calendarDays.map(day => (
                      <div key={day.day} className={`aspect-square flex items-center justify-center rounded-2xl text-xs font-black transition-all group relative ${day.completed ? (darkMode ? "bg-white text-black" : "bg-black text-white shadow-lg") : (darkMode ? "bg-gray-800 text-gray-500 border-transparent" : "bg-[#E8EAEB] text-gray-400 border-transparent hover:border-black/20")}`}>
                        {day.completed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : day.day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-lg font-bold mb-4">Streak Data</h2>
                <div className={`${componentBg} p-6 border rounded-[2rem] shadow-sm`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} p-4 rounded-2xl`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 10 1 15 1 15z" /></svg>
                    </div>
                    <div>
                      <span className="block text-3xl font-black">{currentStreak} Days</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Goals Streak</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-[#E8EAEB]"}`}>
                    <p className="text-[11px] leading-relaxed text-gray-500">Streak resets daily unless <strong className={darkMode ? "text-white" : "text-black"}>ALL daily goals</strong> are met. Habits reset every 24h as well.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Rewards Shop</h2>
                <button onClick={() => setShowAddRewardModal(true)} className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} px-4 py-2 rounded-xl text-sm font-bold`}>+ Create Reward</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map(reward => (
                  <div key={reward.id} className={`${componentBg} p-6 rounded-[2rem] border-2 transition-all group relative ${reward.unlocked ? 'bg-opacity-50 grayscale' : (stats.totalPoints >= reward.cost ? (darkMode ? 'border-white' : 'border-black') : 'border-transparent shadow-sm opacity-60')}`}>
                    <button onClick={() => deleteReward(reward.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-5 rounded-2xl shadow-lg ${reward.unlocked ? (darkMode ? 'bg-gray-800' : 'bg-gray-200') : (darkMode ? 'bg-white text-black' : 'bg-black text-white')}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-black">{reward.name}</h3>
                        <span className="text-sm font-black tracking-tighter opacity-50">{reward.cost} PTS</span>
                      </div>
                      <button disabled={reward.unlocked || stats.totalPoints < reward.cost} onClick={() => redeemReward(reward.id)} className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${reward.unlocked ? (darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400') : (stats.totalPoints >= reward.cost ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-gray-800 text-gray-600' : 'bg-[#E8EAEB] text-gray-400'))}`}>
                        {reward.unlocked ? 'Redeemed' : 'Unlock Reward'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className={`${darkMode ? "bg-gray-900" : "bg-white"} rounded-[2.5rem] w-full max-w-md p-8 lg:p-10 shadow-2xl animate-in zoom-in duration-300`}>
            <h2 className="text-2xl font-black mb-6">New {activeTab === 'daily' ? 'Routine Item' : 'Goal'}</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                <input autoFocus type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className={`w-full mt-2 px-5 py-4 border-none rounded-2xl outline-none transition-all ${darkMode ? "bg-gray-800 text-white focus:ring-white" : "bg-[#E8EAEB] text-black focus:ring-black"}`} />
              </div>
              {activeTab === 'daily' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Points</label>
                  <div className="flex space-x-2 mt-2">
                    {[10, 25, 50].map(p => (
                      <button key={p} onClick={() => setNewItemPoints(p)} className={`flex-1 py-3 rounded-xl border-2 font-black transition-all ${newItemPoints === p ? (darkMode ? "bg-white text-black border-white" : "bg-black text-white border-black") : (darkMode ? "bg-gray-800 border-transparent text-gray-500" : "bg-white border-gray-100 text-gray-400")}`}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'goals' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interval</label>
                    <select value={newGoalType} onChange={(e) => setNewGoalType(e.target.value as GoalType)} className={`w-full mt-2 px-5 py-4 rounded-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-[#E8EAEB] text-black"}`}>
                      <option value={GoalType.DAILY}>Daily</option>
                      <option value={GoalType.WEEKLY}>Weekly</option>
                      <option value={GoalType.MONTHLY}>Monthly</option>
                      <option value={GoalType.YEARLY}>Yearly</option>
                    </select>
                  </div>
                  {newGoalType !== GoalType.DAILY && (
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Value</label>
                      <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 1)} className={`w-full mt-2 px-5 py-4 border-none rounded-2xl outline-none font-black ${darkMode ? "bg-gray-800 text-white" : "bg-[#E8EAEB] text-black"}`} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-4 mt-10">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest">Cancel</button>
              <button onClick={activeTab === 'daily' ? addHabit : addGoal} className={`flex-1 py-4 font-black rounded-2xl shadow-xl uppercase tracking-widest ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}>Create</button>
            </div>
          </div>
        </div>
      )}



      {showAddRewardModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className={`${darkMode ? "bg-gray-900" : "bg-white"} rounded-[2.5rem] w-full max-w-md p-8 lg:p-10 shadow-2xl`}>
            <h2 className="text-2xl font-black mb-6">Create Reward</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                <input autoFocus type="text" value={tempRewardName} onChange={(e) => setTempRewardName(e.target.value)} className={`w-full mt-2 px-5 py-4 border-none rounded-2xl outline-none ${darkMode ? "bg-gray-800 text-white" : "bg-[#E8EAEB] text-black"}`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Points</label>
                <input type="number" value={tempRewardCost} onChange={(e) => setTempRewardCost(parseInt(e.target.value))} className={`w-full mt-2 px-5 py-4 border-none rounded-2xl outline-none font-black ${darkMode ? "bg-gray-800 text-white" : "bg-[#E8EAEB] text-black"}`} />
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button onClick={() => setShowAddRewardModal(false)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest">Cancel</button>
              <button onClick={addReward} className={`flex-1 py-4 font-black rounded-2xl shadow-lg uppercase tracking-widest ${darkMode ? "bg-white text-black" : "bg-black text-white"}`}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
