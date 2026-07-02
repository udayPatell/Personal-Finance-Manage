import React from 'react';

export const Card = ({ children, className = '', interactive = false, ...props }) => {
  return (
    <div
      className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
