import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save, Trash2, Lock, Unlock } from 'lucide-react';
import Navbar from '../components/Navbar';
import MoodPicker from '../components/MoodPicker';

const MOOD_EMOJIS = {
  1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄'
};

export default function Entry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [visibleWordCount, setVisibleWordCount] = useState(2);
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);

  const handleScroll = (e) => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const renderPrivacyContent = () => {
    if (!content) return null;
    
    // Split into parts, keeping the spaces/delimiters
    const parts = content.split(/(\s+)/);
    console.log("Split into part : " + parts);

    let wordCount = 0;
    let splitIndex = 0;

    // Work backwards to find the start of the last X words
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/\S/.test(parts[i])) {
        wordCount++;
        if (wordCount === visibleWordCount) {
          splitIndex = i;
          break;
        }
      }
    }

    const blurred = parts.slice(0, splitIndex).join('');
    const visible = parts.slice(splitIndex).join('');

    return (
      <div 
        ref={mirrorRef}
        className="absolute inset-0 pointer-events-none whitespace-pre-wrap wrap-break-word text-lg md:text-xl leading-relaxed text-slate-900 dark:text-white overflow-hidden"
        aria-hidden="true"
      >
        <span className="blur-sm opacity-30 select-none">{blurred}</span>
        <span>{visible}</span>
      </div>
    );
  };

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/entries/${id}`);
          setTitle(res.data.title);
          setContent(res.data.content);
          setMood(res.data.mood);
        } catch (err) {
          console.error(err);
          navigate('/dashboard');
        } finally {
          setFetching(false);
        }
      };
      fetchEntry();
    }
  }, [id, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    const entryData = {
      title,
      content,
      mood,
      moodEmoji: MOOD_EMOJIS[mood]
    };

    try {
      if (id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/entries/${id}`, entryData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/entries`, entryData);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save entry', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/entries/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-72px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pb-12 transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          {id && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              title="Delete Entry"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8 bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your story..."
              className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white"
              required
              autoFocus
            />
            <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <MoodPicker selectedMood={mood} onSelect={setMood} />
            <div className="flex flex-wrap items-center gap-3">
              {isPrivacyMode && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200 dark:border-slate-600 transition-all animate-in fade-in slide-in-from-right-4">
                  <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Words visible:</span>
                  {[1, 2, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setVisibleWordCount(count)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        visibleWordCount === count
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all border ${
                  isPrivacyMode 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600'
                }`}
              >
                {isPrivacyMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {isPrivacyMode ? 'Privacy Mode: ON' : 'Privacy Mode: OFF'}
              </button>
            </div>
          </div>

          <div className="relative min-h-100">
            {isPrivacyMode && renderPrivacyContent()}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onScroll={handleScroll}
              placeholder="Tell your story..."
              className={`w-full min-h-100 text-lg md:text-xl leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all duration-300 relative z-10 ${
                isPrivacyMode 
                ? 'text-transparent caret-indigo-600 dark:caret-indigo-400' 
                : 'text-slate-900 dark:text-slate-200'
              }`}
              required
            ></textarea>
          </div>

          <div className="flex justify-end pt-8 border-t border-slate-100 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {id ? 'Update Entry' : 'Save to Luminary'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
