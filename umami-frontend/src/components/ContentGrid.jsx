import React from 'react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';
import { EmptyState } from './EmptyState';

const ContentGrid = ({ items = [], emptyMessage = "No content yet." }) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🍽️"
        title="Nothing here yet"
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 lg:gap-4">
      {items.map((item) => {
        const isRecipe = !!item.ingredients || !!item.title;
        const detailUrl = isRecipe ? `/recipes/${item._id}` : `/posts/${item._id}`;

        return (
          <Link
            key={item._id}
            to={detailUrl}
            className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg group cursor-pointer"
          >
            <OptimizedImage
              src={item.imageUrl}
              alt={item.title || item.caption || 'Content image'}
              width={400}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              {isRecipe && (
                <div className="bg-white/90 dark:bg-gray-900/90 p-2 rounded-full shadow-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export { ContentGrid };
