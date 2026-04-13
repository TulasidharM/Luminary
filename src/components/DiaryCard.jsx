import { Edit2, Trash2 } from 'lucide-react';

const MOOD_LABELS = {
  1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great'
};

export default function DiaryCard({ entry, onEdit, onDelete }) {
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 relative">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button 
          onClick={() => onEdit(entry)}
          className="p-2 text-slate-400 hover:text-indigo-600 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(entry.id)}
          className="p-2 text-slate-400 hover:text-red-600 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
          {entry.moodEmoji}
        </span>
        <div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block">{MOOD_LABELS[entry.mood]}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{date}</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{entry.title}</h3>
      <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
        {entry.content}
      </p>
    </div>
  );
}