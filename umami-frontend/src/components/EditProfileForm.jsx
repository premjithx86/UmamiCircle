import React, { useState, useRef } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Camera, Loader2 } from 'lucide-react';
import api from '../services/api';

const EditProfileForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePicUrl: user?.profilePicUrl || user?.avatar || '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await api.post('/upload/avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({ ...prev, profilePicUrl: response.data.imageUrl }));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Identify changed fields
    const changes = {};
    if (formData.name !== user.name) changes.name = formData.name;
    if (formData.bio !== user.bio) changes.bio = formData.bio;
    
    const currentAvatar = user.profilePicUrl || user.avatar || '';
    if (formData.profilePicUrl !== currentAvatar) {
      changes.profilePicUrl = formData.profilePicUrl;
    }

    if (Object.keys(changes).length === 0) {
      onCancel(); // No changes, just close
      return;
    }

    onSubmit(changes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div 
          className="relative group cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <img
            src={formData.profilePicUrl || 'https://via.placeholder.com/100'}
            alt="Avatar preview"
            className={`w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md ${isUploading ? 'opacity-50' : ''}`}
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="text-white" size={24} />
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="text-orange-600 animate-spin" size={24} />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <p className="mt-2 text-xs text-gray-500">Click to change profile picture</p>
        {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
      </div>

      <Input
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your display name"
        required
      />

      <div className="flex flex-col space-y-1">
        <label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell the community about yourself..."
          rows="4"
          className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none shadow-sm"
        />
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isUploading}
        >
          Save Changes
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          type="button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export { EditProfileForm };
