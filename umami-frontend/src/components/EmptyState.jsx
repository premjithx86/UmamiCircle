import React from 'react';
import { Button } from './Button';

export const EmptyState = ({ 
  icon, 
  title, 
  message, 
  actionLabel, 
  onAction,
  className = "" 
}) => {
  return (
    <div className={`text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in duration-500 ${className}`}>
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" className="rounded-full px-8">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
