import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Image as ImageIcon, X, Upload, AlertCircle, Loader2 } from 'lucide-react';

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'moderating', 'publishing'
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
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please select an image.');

    try {
      setError(null);
      
      // 1. Image Moderation and Upload
      setStatus('moderating');
      const uploadFormData = new FormData();
      uploadFormData.append('image', image);

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { imageUrl, imageHash } = uploadResponse.data;

      // 2. Finalize Post Creation
      setStatus('publishing');
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const postResponse = await api.post('/posts', {
        imageUrl,
        imageHash,
        caption,
        tags: tagArray
      });

      if (postResponse.status === 201 || postResponse.status === 200) {
        const newPostId = postResponse.data._id;
        navigate(`/posts/${newPostId}`);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <SEO title="Create Post" description="Share your latest food creation with UmamiCircle." />
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create New Post</h1>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={status !== 'idle'}
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-0 overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
          {imagePreview ? (
            <div className="relative aspect-square">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              {status === 'idle' && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all shadow-lg"
                >
                  <X size={20} />
                </button>
              )}
              {status !== 'idle' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-6">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-orange-500" />
                  <p className="text-xl font-bold mb-2">
                    {status === 'moderating' ? 'Checking your image...' : 'Finalizing post...'}
                  </p>
                  <p className="text-sm opacity-80">
                    {status === 'moderating' 
                      ? 'Our AI is making sure your content is food-related and safe.' 
                      : 'Almost there! Saving your masterpiece to the community.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div 
              onClick={() => status === 'idle' && fileInputRef.current.click()}
              className="aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Upload a delicious photo</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click to browse or drag and drop</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
            disabled={status !== 'idle'}
            data-testid="file-input"
          />
        </Card>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-3 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm font-medium leading-relaxed">
              <p className="font-bold">Moderation Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="caption" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Caption
            </label>
            <textarea
              id="caption"
              rows="4"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none shadow-sm"
              placeholder="Tell the community about your dish..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={status !== 'idle'}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
              placeholder="e.g. homemade, italian, breakfast"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={status !== 'idle'}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-lg font-bold rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none"
            disabled={status !== 'idle' || !image}
          >
            {status === 'idle' ? 'Share Post' : 'Processing...'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { CreatePost };
