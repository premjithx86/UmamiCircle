import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Image as ImageIcon, X, Upload, AlertCircle } from 'lucide-react';

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please select an image.');

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formData.append('tags', JSON.stringify(tagArray));

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201 || response.status === 200) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post. Content might have been flagged.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <SEO title="Create Post" description="Share your latest food creation with UmamiCircle." />
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create New Post</h1>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-0 overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
          {imagePreview ? (
            <div className="relative aspect-square">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current.click()}
              className="aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Upload a photo</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PNG, JPG or WebP up to 10MB</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </Card>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3 text-red-600 dark:text-red-400">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="caption" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Caption
            </label>
            <textarea
              id="caption"
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="What's on the menu today?..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="e.g. delicious, homemade, healthy"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-lg font-bold"
            disabled={loading || !image}
          >
            {loading ? 'Publishing...' : 'Share Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { CreatePost };
