import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EMOJI_SETS } from '../utils/emojis';
import { X } from 'lucide-react';

export default function SettingsOverlay({ isOpen, onClose }) {
  const { user, updateSettings } = useAuth();
  const [emojiSet, setEmojiSet] = useState(0);
  const [disableEmojis, setDisableEmojis] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.settings) {
      setEmojiSet(user.settings.emojiSet || 0);
      setDisableEmojis(user.settings.disableEmojis || false);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateSettings({ emojiSet, disableEmojis });
      setMessage('Settings updated successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 500);
    } catch (err) {
      setMessage('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Settings</h1>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {message && (
            <div className={`p-4 mb-6 rounded-2xl ${message.includes('success') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Appearance</h2>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Disable Emojis</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hide all mood emojis across the app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={disableEmojis}
                    onChange={(e) => setDisableEmojis(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </section>

            <section className={disableEmojis ? 'opacity-40 pointer-events-none grayscale' : ''}>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Emoji Set</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose the style of emojis used for your moods</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EMOJI_SETS.map((set, index) => (
                  <div 
                    key={index}
                    onClick={() => !disableEmojis && setEmojiSet(index)}
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      emojiSet === index 
                        ? 'border-indigo-600 bg-indigo-50 dark:border-blue-500 dark:bg-blue-900/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-900 dark:text-white">{set.name}</span>
                      {emojiSet === index && (
                        <span className="bg-indigo-600 dark:bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Selected</span>
                      )}
                    </div>
                    <div className="flex gap-2 text-2xl">
                      {Object.values(set.emojis).map((emoji, i) => (
                        <span key={i}>{emoji}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 dark:shadow-blue-900/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 active:translate-y-0"
              >
                {loading ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
