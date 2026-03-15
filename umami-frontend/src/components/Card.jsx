import React from 'react';
import { Card as CardRoot } from './ui/Card';
import { cn } from '../utils/cn';

const Card = ({ children, className = '', ...props }) => {
  return (
    <CardRoot
      className={cn("border-border bg-card shadow-sm overflow-hidden", className)}
      {...props}
    >
      {children}
    </CardRoot>
  );
};

export { Card };
