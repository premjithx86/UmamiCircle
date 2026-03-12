import React from 'react';
import { getOptimizedUrl } from '../utils/cloudinary';

/**
 * Image component with automatic Cloudinary optimization and lazy loading.
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
  const optimizedSrc = getOptimizedUrl(src, { width, height });

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      className={className}
      {...props}
    />
  );
};
