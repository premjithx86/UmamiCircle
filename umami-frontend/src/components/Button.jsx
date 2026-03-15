import React from 'react';
import { Button as ButtonRoot } from './ui/Button';

const Button = ({ children, variant = 'primary', ...props }) => {
  // Map old variants to shadcn variants
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    danger: 'destructive'
  };

  return (
    <ButtonRoot variant={variantMap[variant] || variant} {...props}>
      {children}
    </ButtonRoot>
  );
};

export { Button };
