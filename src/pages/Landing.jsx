import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Landing() {
  const { token } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-black dark:to-blue-950 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur shadow-sm hover:scale-110 transition-transform"
        >
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
      
      <div className="z-10 text-center px-4 max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
          Luminary <span className="text-indigo-500">✨</span>
        </h1>
        <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-300 mb-12 font-medium">
          Your thoughts, beautifully kept.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all text-lg border border-slate-200 dark:border-slate-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}