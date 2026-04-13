const MOODS = [
  { value: 1, emoji: '😢', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export default function MoodPicker({ selectedMood, onSelect }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
      <label className="block text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Mood Tracking</label>
      <div className="flex justify-between items-center max-w-md">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.value;
          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => onSelect(mood.value)}
              className={`group flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                isSelected 
                  ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-indigo-500 scale-125 z-10' 
                  : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg opacity-60 hover:opacity-100'
              }`}
            >
              <span className={`text-4xl md:text-5xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} role="img" aria-label={mood.label}>
                {mood.emoji}
              </span>
              <span className={`text-xs mt-3 font-bold transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}