import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmoji } from '../utils/emojis';

export default function StatsPanel({ entries }) {
  const { user } = useAuth();
  const settings = user?.settings;

  const stats = useMemo(() => {
    if (!entries.length) return null;

    const total = entries.length;
    const avgMood = entries.reduce((acc, curr) => acc + curr.mood, 0) / total;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(entry => {
      distribution[entry.mood]++;
    });

    let mostUsed = 3;
    let maxCount = 0;
    Object.entries(distribution).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = parseInt(mood);
      }
    });

    return {
      total,
      avgMood: avgMood.toFixed(1),
      distribution,
      mostUsedMood: mostUsed
    };
  }, [entries]);

  if (!stats) return null;

  const mostUsedEmoji = getEmoji(stats.mostUsedMood, settings);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Entries</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Avg Mood</p>
        <p className="text-3xl font-bold text-indigo-600 dark:text-blue-400">{stats.avgMood}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Mood Breakdown</p>
        <div className="flex justify-center gap-1">
          {[1,2,3,4,5].map(m => {
            const emoji = getEmoji(m, settings);
            return (
              <div key={m} className="flex flex-col items-center">
                <div className="w-2 bg-indigo-100 dark:bg-blue-900/30 rounded-t-sm relative h-8">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm" 
                    style={{ height: `${(stats.distribution[m] / stats.total) * 100}%` }}
                  ></div>
                </div>
                {emoji && <span className="text-[10px] mt-1">{emoji}</span>}
              </div>
            );
          })}
        </div>
      </div>
      {!settings?.disableEmojis && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Most Frequent</p>
          <p className="text-3xl" role="img" aria-label="Most frequent mood">{mostUsedEmoji}</p>
        </div>
      )}
    </div>
  );
}
