import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component to inject Recipe Structured Data (JSON-LD) for SEO.
 * 
 * @param {Object} props
 * @param {Object} props.recipe - The recipe data object
 */
export const RecipeJSONLD = ({ recipe }) => {
  if (!recipe) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: [recipe.imageUrl],
    author: {
      '@type': 'Person',
      name: recipe.user?.username || 'UmamiCircle User',
    },
    datePublished: recipe.createdAt,
    prepTime: recipe.prepTime ? `PT${recipe.prepTime.replace(/[^0-9]/g, '')}M` : undefined,
    recipeYield: recipe.servings?.toString(),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions?.map((step, index) => ({
      '@type': 'HowToStep',
      text: step,
      position: index + 1,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};
