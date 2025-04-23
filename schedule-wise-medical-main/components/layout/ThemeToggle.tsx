'use client';

import { useTheme } from '@/app/theme-provider';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div 
      className={`flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 ${className}`}
      role="group"
      aria-label="Theme toggle"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'light' 
            ? 'bg-white dark:bg-gray-600 text-amber-500 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
        }`}
        title="Light mode"
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
      >
        <IconSun className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'dark' 
            ? 'bg-white dark:bg-gray-600 text-indigo-500 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
        }`}
        title="Dark mode"
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
      >
        <IconMoon className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'system' 
            ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
        }`}
        title="System preference"
        aria-label="System preference"
        aria-pressed={theme === 'system'}
      >
        <IconDeviceDesktop className="w-4 h-4" />
      </button>
    </div>
  );
} 