import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for managing dynamic meta tags.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} [props.image] - Open Graph image URL
 * @param {string} [props.url] - Canonical URL
 * @param {string} [props.type] - OG type (e.g., 'article', 'website', 'recipe')
 */
export const SEO = ({ 
  title, 
  description, 
  image = '/logo.png', 
  url = window.location.href, 
  type = 'website' 
}) => {
  const siteName = 'UmamiCircle';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
