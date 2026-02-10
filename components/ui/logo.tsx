import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg sm:text-xl md:text-2xl',
    md: 'text-2xl sm:text-3xl md:text-3xl lg:text-4xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
  };

  return (
    <span 
      className={`font-normal ${sizeClasses[size]} ${className}`} 
      style={{ 
        fontFamily: "'League Spartan', sans-serif",
        color: '#7b2b04',
        letterSpacing: '-0.08em',
        fontWeight: 600
      }}
    >
      Kruno
    </span>
  );
}
