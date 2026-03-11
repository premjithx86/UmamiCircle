import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

const EditProfileForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="relative group cursor-pointer">
          <img
            src={formData.avatar || 'https://via.placeholder.com/100'}
            alt="Avatar preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-bold text-center px-2">Change Photo</span>
          </div>
        </div>
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
        <label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about your culinary journey..."
          rows="4"
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
        />
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
        >
          Save Changes
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export { EditProfileForm };
