import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Card from './Card';
import Button from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm | md | lg | xl
  footer
}) => {
  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent scroll
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'modal-sm';
      case 'lg':
        return 'modal-lg';
      case 'xl':
        return 'modal-xl';
      default:
        return 'modal-md';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container ${getSizeClass()}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="modal-card">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="modal-close-btn"
              icon={IoClose}
            />
          </div>
          <div className="modal-body">
            {children}
          </div>
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Modal;
