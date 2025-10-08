import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = "" }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative inline-flex items-center justify-center w-10 h-10 
        rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition-colors duration-200
        ${className}
      `}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon size={18} />
            ) : (
                <Sun size={18} />
            )}
        </button>
    );
}
