import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import api from '../services/api';

export const EditContentModal = ({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  onUpdate 
}) => {
  const [content, setContent] = useState(type === 'Recipe' ? item.description : item.caption);
  const [tags, setTags] = useState(item.tags?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = type === 'Recipe' ? `/recipes/${item._id}` : `/posts/${item._id}`;
      const payload = type === 'Recipe' 
        ? { description: content, tags: tags.split(',').map(t => t.trim()).filter(t => t) }
        : { caption: content, tags: tags.split(',').map(t => t.trim()).filter(t => t) };

      const response = await api.put(endpoint, payload);
      onUpdate(response.data);
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${type}`}>
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            {type === 'Recipe' ? 'Description' : 'Caption'}
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Update your ${type.toLowerCase()}...`}
            required
          />
        </div>

        <Input
          label="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. food, delicious, dinner"
        />

        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
