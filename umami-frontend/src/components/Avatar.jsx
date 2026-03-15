import React from 'react';
import { Avatar as AvatarRoot, AvatarImage, AvatarFallback } from './ui/Avatar';
import { cn } from '../utils/cn';
import { getCloudinaryUrl } from '../utils/cloudinary';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const imageUrl = user?.profilePicUrl || user?.avatar;
  const name = user?.name || user?.username || '?';
  
  const getInitials = (n) => {
    return n
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-24 w-24',
    '3xl': 'h-32 w-32 md:h-40 md:w-40',
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  // Determine transformation based on size
  let width = 80;
  let height = 80;
  
  if (['xl', '2xl', '3xl'].includes(size)) {
    width = 150;
    height = 150;
  }

  const transformedUrl = getCloudinaryUrl(imageUrl, width, height);

  return (
    <AvatarRoot className={cn(selectedSizeClass, "border border-border shadow-sm", className)}>
      <AvatarImage src={transformedUrl} alt={name} className="object-cover" />
      <AvatarFallback className="bg-primary/10 text-primary font-black">
        {getInitials(name)}
      </AvatarFallback>
    </AvatarRoot>
  );
};

export { Avatar };
