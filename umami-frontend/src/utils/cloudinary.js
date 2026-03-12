/**
 * Cloudinary URL transformation helper.
 * Inserts optimization parameters into a Cloudinary URL.
 * 
 * @param {string} url - The original Cloudinary URL
 * @param {Object} options - Transformation options
 * @param {number} [options.width] - Image width
 * @param {number} [options.height] - Image height
 * @param {string} [options.crop='fill'] - Crop mode
 * @returns {string} The optimized URL
 */
export const getOptimizedUrl = (url, { width, height, crop = 'fill' } = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Transformations to insert
  let transformations = ['q_auto', 'f_auto'];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');

  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transformString}/`);
};
