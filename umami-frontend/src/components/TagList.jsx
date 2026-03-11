import React from 'react';
import { Link } from 'react-router-dom';

export const TagList = ({ tags = [] }) => {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="tag-list">
      {tags.map((tag) => (
        <Link
          key={tag}
          to={`/explore?tag=${tag}`}
          className="text-primary hover:underline font-medium text-sm transition-all"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
};
