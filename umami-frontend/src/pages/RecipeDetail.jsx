import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { RecipeJSONLD } from '../components/RecipeJSONLD';
import { OptimizedImage } from '../components/OptimizedImage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import { TagList } from '../components/TagList';
import { EngagementBar } from '../components/EngagementBar';
import { CommentSection } from '../components/CommentSection';
import { ShareModal } from '../components/ShareModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const handleLikeToggle = async () => {
    if (!recipe || !userData) return;
    try {
      const response = await api.post(`/recipes/like/${recipe._id}`);
      const isLiked = !recipe.likes.includes(userData._id);
      setRecipe({
        ...recipe,
        isLiked,
        likes: isLiked 
          ? [...recipe.likes, userData._id] 
          : recipe.likes.filter(id => id !== userData._id)
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">{error || "Recipe not found."}</p>
        <Link to="/" className="text-orange-600 font-bold hover:underline">Go back home</Link>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/recipes/${id}`;
  const isLiked = userData ? recipe.likes.includes(userData._id) : false;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500" data-testid="recipe-detail">
      <SEO 
        title={recipe.title}
        description={recipe.description}
        image={recipe.imageUrl}
        type="article"
      />
      <RecipeJSONLD recipe={recipe} />
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-lg">
        <OptimizedImage
          src={recipe.imageUrl}
          alt={recipe.title}
          width={1200}
          lazy={false}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {recipe.title}
          </h1>
          <div className="mt-4 flex items-center space-x-4 text-white/90">
            <div className="flex items-center space-x-2">
              <img
                src={recipe.user.profilePicUrl || 'https://via.placeholder.com/40'}
                alt={recipe.user.username}
                className="w-8 h-8 rounded-full border-2 border-white/50"
              />
              <Link to={`/u/${recipe.user.username}`} className="font-bold hover:text-primary transition-colors text-white">
                {recipe.user.username}
              </Link>
            </div>
            <span>•</span>
            <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Time</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.prepTime || '-'}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Servings</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.servings || '-'} servings</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Difficulty</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.difficulty || '-'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Ingredients and Instructions */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {recipe.description}
              </p>
              <TagList tags={recipe.tags} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ingredients</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-gray-700 dark:text-gray-200">{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Instructions</h2>
            <div className="space-y-6">
              {recipe.instructions && recipe.instructions.map((step, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Engagement and Comments */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Engagement
              </h3>
              <EngagementBar
                isLiked={isLiked}
                isBookmarked={false}
                likesCount={recipe.likes.length}
                onLikeToggle={handleLikeToggle}
                onShare={() => setIsShareModalOpen(true)}
                onBookmarkToggle={() => {}}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Comments
              </h3>
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm italic">Comments coming soon in next update.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
      />
    </div>
  );
};
