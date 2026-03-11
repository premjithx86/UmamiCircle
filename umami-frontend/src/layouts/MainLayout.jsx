import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <nav className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">UmamiCircle</Link>
          <div className="space-x-4 flex items-center">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary">Home</Link>
            <Link to="/explore" className="text-gray-600 dark:text-gray-300 hover:text-primary">Explore</Link>
            <Link to="/notifications" className="text-gray-600 dark:text-gray-300 hover:text-primary">Notifications</Link>
            <Link to="/messages" className="text-gray-600 dark:text-gray-300 hover:text-primary">Messages</Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export { MainLayout };
