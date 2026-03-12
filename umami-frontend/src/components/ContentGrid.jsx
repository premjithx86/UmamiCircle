import React from 'react';
import { OptimizedImage } from './OptimizedImage';

const ContentGrid = ({ items = [], emptyMessage = "No content yet." }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🍽️</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg group cursor-pointer"
        >
          <OptimizedImage
            src={item.imageUrl}
            alt={item.title || item.caption || 'Content image'}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            {/* Overlay icons could be added here (e.g. likes/comments count) */}
          </div>
        </div>
      ))}
    </div>
  );
};

export { ContentGrid };
