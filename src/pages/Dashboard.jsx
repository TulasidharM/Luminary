import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Plus, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatsPanel from '../components/StatsPanel';
import DiaryCard from '../components/DiaryCard';

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEntries = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/entries');
      // res.data is now { entries: [], summaries: [] }
      setEntries(res.data.entries || []);
      console.log("got entries : " + JSON.stringify(res.data.entries));
      setSummaries(res.data.summaries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const groupedEntries = useMemo(() => {
    const groups = {};
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const isoDate = date.toISOString().split('T')[0];
      const dateKey = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      let displayLabel = dateKey;
      if (dateKey === today) displayLabel = "Today";
      else if (dateKey === yesterdayKey) displayLabel = "Yesterday";

      if (!groups[isoDate]) {
        const summary = summaries.find(s => s.date === isoDate);
        groups[isoDate] = { 
          label: displayLabel, 
          items: [], 
          summary: summary?.summary,
          avgEmoji: summary?.avgEmoji 
        };
      }
      groups[isoDate].items.push(entry);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(g => g[1]);
  }, [entries, summaries]);

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/entries/${id}`);
      fetchEntries();
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  const openNewEntry = () => {
    navigate('/entry');
  };

  const openEditEntry = (entry) => {
    navigate(`/entry/${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Your Journey</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Every word is a step forward.</p>
          </div>
          <button
            onClick={openNewEntry}
            className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
            <span>New Entry</span>
          </button>
        </div>

        <StatsPanel entries={entries} />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <span className="text-7xl mb-6 block" role="img" aria-label="Book">📖</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The pages are waiting</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Start capturing your thoughts, moods, and moments.</p>
            <button
              onClick={openNewEntry}
              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-8 py-3 rounded-2xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
            >
              Begin Your Story
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedEntries.map(group => (
              <div key={group.label} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{group.label}</h2>
                  </div>
                  {group.summary && (
                    <div className="flex items-center gap-3 px-5 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20">
                      <span className="text-2xl shrink-0" role="img" aria-label="Average Mood">{group.avgEmoji}</span>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 italic flex items-center gap-2">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        {group.summary}
                      </p>
                    </div>
                  )}
                  <div className="hidden md:block h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {group.items.map(entry => (
                    <DiaryCard 
                      key={entry.id} 
                      entry={entry} 
                      onEdit={openEditEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}