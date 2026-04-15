const MOODS = [
  { value: 1, emoji: '😢', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export default function MoodPicker({ selectedMood, onSelect }) {
  return (
    <div className="bg-slate-50 dark:bg-black/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Mood Tracking</label>
      <div className="flex justify-between items-center max-w-sm">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.value;
          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => onSelect(mood.value)}
              className={`group flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                isSelected 
                  ? 'bg-white dark:bg-slate-800 shadow-lg ring-2 ring-indigo-500 z-10' 
                  : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-md opacity-60 hover:opacity-100'
              }`}
            >
              <span className={`text-2xl md:text-3xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} role="img" aria-label={mood.label}>
                {mood.emoji}
              </span>
              <span className={`text-[10px] mt-2 font-bold transition-colors ${isSelected ? 'text-indigo-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}