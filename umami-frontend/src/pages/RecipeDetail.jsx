import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card } from '../components/Card';
import { TagList } from '../components/TagList';
import { EngagementBar } from '../components/EngagementBar';
import { CommentSection } from '../components/CommentSection';
import { ShareModal } from '../components/ShareModal';

export const RecipeDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      setRecipe({
        _id: id,
        user: {
          _id: 'u1',
          username: 'chef_jane',
          name: 'Jane Smith',
          avatar: '',
        },
        title: 'Test Recipe',
        description: 'Delicious test recipe description.',
        imageUrl: 'https://via.placeholder.com/800x400',
        tags: ['dinner', 'easy', 'healthy'],
        ingredients: [
          '2 cups Flour',
          '1 cup Sugar',
          '3 Eggs',
          '1/2 cup Milk',
        ],
        instructions: [
          'Preheat oven to 350 degrees.',
          'Mix ingredients in a bowl.',
          'Bake for 30 minutes.',
        ],
        servings: 4,
        prepTime: '30 mins',
        difficulty: 'Easy',
        createdAt: new Date().toISOString(),
        likes: Array(150).fill('u1'),
        isLiked: false,
        isBookmarked: false,
        comments: [],
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return <div className="text-center py-20 text-gray-500">Recipe not found.</div>;
  }

  const shareUrl = `${window.location.origin}/recipes/${id}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500" data-testid="recipe-detail">
      <SEO 
        title={recipe.title}
        description={recipe.description}
        image={recipe.imageUrl}
        type="article"
      />
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-lg">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {recipe.title}
          </h1>
          <div className="mt-4 flex items-center space-x-4 text-white/90">
            <div className="flex items-center space-x-2">
              <img
                src={recipe.user.avatar || 'https://via.placeholder.com/40'}
                alt={recipe.user.username}
                className="w-8 h-8 rounded-full border-2 border-white/50"
              />
              <Link to={`/u/${recipe.user.username}`} className="font-bold hover:text-primary transition-colors">
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
          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.prepTime}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Servings</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.servings} servings</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Difficulty</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.difficulty}</p>
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
              {recipe.ingredients.map((ingredient, index) => (
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
              {recipe.instructions.map((step, index) => (
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
                isLiked={recipe.isLiked}
                isBookmarked={recipe.isBookmarked}
                likesCount={recipe.likes.length}
                onLikeToggle={() => setRecipe({ 
                  ...recipe, 
                  isLiked: !recipe.isLiked,
                  likes: recipe.isLiked ? recipe.likes.slice(0, -1) : [...recipe.likes, 'u1']
                })}
                onShare={() => setIsShareModalOpen(true)}
                onBookmarkToggle={() => setRecipe({ ...recipe, isBookmarked: !recipe.isBookmarked })}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Comments
              </h3>
              <CommentSection
                comments={recipe.comments}
                onAddComment={(content) => {
                  const newComment = {
                    _id: Date.now().toString(),
                    user: { username: 'testuser', avatar: '' },
                    content,
                    createdAt: new Date().toISOString()
                  };
                  setRecipe({ ...recipe, comments: [newComment, ...recipe.comments] });
                }}
              />
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
