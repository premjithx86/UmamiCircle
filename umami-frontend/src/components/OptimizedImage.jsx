import React from 'react';

/**
 * Image component for posts and recipes.
 * Uses the original Cloudinary URL without transformations as per requirements.
 *
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text
 * @param {number} [props.width] - Display width
 * @param {number} [props.height] - Display height
 * @param {boolean} [props.lazy=true] - Enable lazy loading
 * @param {string} [props.className] - CSS classes
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  className = '',
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      className={className}
      {...props}
    />
  );
};
