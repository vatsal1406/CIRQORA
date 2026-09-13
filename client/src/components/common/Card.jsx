import React from 'react';

const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-card border border-carbon-border p-5 transition-all duration-300
        ${glass ? 'glass-panel' : 'bg-carbon-card'}
        ${hoverEffect ? 'hover:border-carbon-borderLight hover:shadow-card hover:-translate-y-0.5 cursor-pointer' : ''}
        ${glow ? 'shadow-glow border-primary/30' : 'shadow-card'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
