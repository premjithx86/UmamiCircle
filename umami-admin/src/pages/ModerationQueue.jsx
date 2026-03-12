import React, { useState, useEffect } from 'react';
import { getPosts, deletePost, getRecipes, deleteRecipe } from '../services/adminService';
import { Search, Trash2, Loader2, Image as ImageIcon, MessageSquare, Filter } from 'lucide-react';

/**
 * Moderation Queue page for reviewing and managing posts and recipes.
 * @returns {JSX.Element}
 */
export const ModerationQueue = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let data;
      const params = { search, status };
      
      if (activeTab === 'posts') {
        data = await getPosts(params);
      } else {
        data = await getRecipes(params);
      }
      
      setItems(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch ${activeTab}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, activeTab]);

  const handleDelete = async (id) => {
    const itemType = activeTab === 'posts' ? 'post' : 'recipe';
    if (window.confirm(`Are you sure you want to permanently delete this ${itemType}? This action cannot be undone.`)) {
      try {
        if (activeTab === 'posts') {
          await deletePost(id);
        } else {
          await deleteRecipe(id);
        }
        setItems(items.filter(item => item._id !== id));
      } catch (err) {
        alert(`Failed to delete ${itemType}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Moderation Queue</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'posts' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'recipes' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recipes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by ${activeTab === 'posts' ? 'caption' : 'title'}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="flex items-center text-sm font-medium text-gray-600">
              <Filter className="w-4 h-4 mr-1" />
              Status:
            </label>
            <select
              id="status-filter"
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Content</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading {activeTab}...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No {activeTab} found matching your criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 max-w-xs">
                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400 m-3" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-gray-900 truncate">
                            {activeTab === 'posts' ? item.caption : item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {item._id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{item.user?.username || 'Unknown'}</p>
                        <p className="text-gray-500 text-xs">{item.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        item.moderationStatus === 'flagged' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.moderationStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={`Delete ${activeTab === 'posts' ? 'Post' : 'Recipe'}`}
                        aria-label={`Delete ${activeTab === 'posts' ? 'Post' : 'Recipe'}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
