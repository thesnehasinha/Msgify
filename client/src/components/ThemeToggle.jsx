import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full border
        ${theme === 'dark'
          ? 'bg-[#1e293b] border-gray-600 text-yellow-400 hover:bg-[#2b3b53]'
          : 'bg-white border-gray-300 text-indigo-600 hover:bg-indigo-100'}
        transition-all duration-300 shadow-md hover:shadow-lg
      `}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-180" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-180" />
      )}
    </button>
  );
}
