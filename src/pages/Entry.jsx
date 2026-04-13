import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/api/entries/${id}`);
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
        await axios.put(`http://localhost:3001/api/entries/${id}`, entryData);
      } else {
        await axios.post('http://localhost:3001/api/entries', entryData);
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
      await axios.delete(`http://localhost:3001/api/entries/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete entry', err);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-72px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12 transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-medium"
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
              className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white"
              required
              autoFocus
            />
            <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
          </div>

          <div className="pt-4">
            <MoodPicker selectedMood={mood} onSelect={setMood} />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your story..."
            className="w-full min-h-[400px] text-lg md:text-xl leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-200"
            required
          ></textarea>

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