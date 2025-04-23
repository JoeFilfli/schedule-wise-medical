'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from '@/app/theme-provider';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export default function ThemeToggle({ className = '', size = 18 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={`btn btn-outline-secondary btn-sm rounded-circle position-relative overflow-hidden ${className}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{ width: size * 2, height: size * 2 }}
    >
      <div className="d-flex justify-content-center align-items-center w-100 h-100 transition-all">
        {theme === 'dark' ? (
          <IconSun 
            size={size} 
            className="position-relative" 
            style={{ 
              animation: 'rotateSun 0.5s ease-out' 
            }} 
          />
        ) : (
          <IconMoon 
            size={size} 
            className="position-relative" 
            style={{ 
              animation: 'rotateMoon 0.5s ease-out' 
            }} 
          />
        )}
      </div>
      <style jsx>{`
        @keyframes rotateSun {
          from {
            transform: rotate(-45deg) scale(0.8);
            opacity: 0;
          }
          to {
            transform: rotate(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes rotateMoon {
          from {
            transform: rotate(45deg) scale(0.8);
            opacity: 0;
          }
          to {
            transform: rotate(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
} 