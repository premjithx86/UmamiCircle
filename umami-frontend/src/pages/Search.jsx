import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { ContentGrid } from '../components/ContentGrid';
import { UserList } from '../components/UserList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Search as SearchIcon, Filter, User as UserIcon, LayoutGrid } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'users'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchQuery, tab) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      let response;
      if (tab === 'posts') {
        response = await api.get(`/posts/search?q=${searchQuery}`);
        setResults(response.data);
      } else {
        response = await api.get(`/users/search?q=${searchQuery}`);
        setResults(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(query, activeTab);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Search" 
        description="Search for recipes, posts, and chefs on UmamiCircle."
      />
      
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search recipes, tags, or chefs..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-orange-500 text-lg transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit mx-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'posts' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'users' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <UserIcon size={16} />
            <span>Chefs</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="md" />
            </div>
          ) : query.trim() ? (
            results.length > 0 ? (
              activeTab === 'posts' ? (
                <ContentGrid items={results} />
              ) : (
                <UserList users={results} />
              )
            ) : (
              <EmptyState
                icon="🔍"
                title={`No ${activeTab} found`}
                message={`We couldn't find any results for "${query}". Try a different keyword or check your spelling.`}
              />
            )
          ) : (
            <EmptyState
              icon="🍳"
              title="Discover Something Delicious"
              message="Search for recipes, tags, or your favorite chefs from around the world."
            />
          )}

          {error && (
            <div className="text-center py-10 text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Search };
