import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { ContentGrid } from '../components/ContentGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';

const Explore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchExploreFeed = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/explore?page=${pageNum}&limit=15`);
      const newItems = response.data;
      
      if (pageNum === 1) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      
      if (newItems.length < 15) {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load explore feed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreFeed(1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Explore" 
        description="Discover the best recipes and food posts on UmamiCircle."
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Explore</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover trending dishes and new inspirations from our global community.
        </p>
      </div>

      <div className="space-y-10">
        <ContentGrid items={items} emptyMessage="No trending content found." />

        {loading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center py-10">
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchExploreFeed(next);
              }}
              className="px-8 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Show More
            </button>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => fetchExploreFeed(page)}
              className="mt-4 text-orange-600 font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Explore };
