import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for common social interactions (Like, Bookmark)
 * @param {string} targetType - 'Post' or 'Recipe'
 * @param {object} initialData - The content object
 */
export const useSocialActions = (targetType, initialData) => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [isLiked, setIsLiked] = useState(
    initialData?.likes?.includes(userData?._id) || initialData?.isLiked || false
  );
  const [likesCount, setLikesCount] = useState(initialData?.likes?.length || initialData?.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(
    initialData?.bookmarks?.includes(userData?._id) || initialData?.isBookmarked || false
  );
  const [loading, setLoading] = useState(false);

  const handleLikeToggle = async (id) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const typePath = targetType.toLowerCase() === 'recipe' ? 'recipes' : 'posts';
      const response = await api.post(`/${typePath}/like/${id}`);
      
      setIsLiked(!isLiked);
      setLikesCount(response.data.likes);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleBookmarkToggle = async (id) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const typePath = targetType.toLowerCase() === 'recipe' ? 'recipes' : 'posts';
      await api.post(`/${typePath}/${id}/bookmark`);
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likesCount,
    isBookmarked,
    loading,
    handleLikeToggle,
    handleBookmarkToggle,
  };
};
