import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow';
  const paddingClasses = padding ? 'p-4' : '';
  
  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;