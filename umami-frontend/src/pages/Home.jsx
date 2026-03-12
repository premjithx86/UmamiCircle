import React from 'react';
import { SEO } from '../components/SEO';

const Home = () => {
  return (
    <div className="p-4">
      <SEO 
        title="Home" 
        description="Welcome to UmamiCircle, your favorite food-focused social media platform."
      />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Welcome to UmamiCircle!</p>
    </div>
  );
};

export { Home };
