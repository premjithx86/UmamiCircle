/**
 * Helper to insert Cloudinary transformation parameters into a Cloudinary URL.
 * 
 * @param {string} url - The original Cloudinary URL.
 * @param {number} width - Target width.
 * @param {number} height - Target height.
 * @param {string} crop - Transformation crop mode (default: 'fill').
 * @returns {string} - The transformed URL.
 */
export const getCloudinaryUrl = (url, width, height, crop = 'fill') => {
  if (!url || typeof url !== 'string') return url;
  
  // Only transform Cloudinary URLs
  if (!url.includes('cloudinary.com')) return url;

  // If width and height are not provided, return original URL unchanged
  if (!width && !height) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  let transformation = '';
  if (width && height) {
    transformation = `w_${width},h_${height},c_${crop},q_auto,f_auto`;
  } else if (width) {
    transformation = `w_${width},q_auto,f_auto`;
  } else if (height) {
    transformation = `h_${height},q_auto,f_auto`;
  }

  return transformation ? `${parts[0]}/upload/${transformation}/${parts[1]}` : url;
};
