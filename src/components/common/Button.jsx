import React from 'react';

export const Button = ({
  children,
  className = '',
  variant = 'primary', // primary | secondary | success | danger | warning | outline
  size = 'md', // sm | md | lg
  icon: Icon,
  disabled = false,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'success':
        return 'btn-success';
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'outline':
        return 'btn-outline';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      default:
        return 'btn-md';
    }
  };

  return (
    <button
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="btn-icon" />}
      {children}
    </button>
  );
};

export default Button;
