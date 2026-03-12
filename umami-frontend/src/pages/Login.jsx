import React from 'react';
import { SEO } from '../components/SEO';

export const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <SEO title="Login" description="Login to your UmamiCircle account." />
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Login to UmamiCircle</h2>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Please enter your details.</p>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
