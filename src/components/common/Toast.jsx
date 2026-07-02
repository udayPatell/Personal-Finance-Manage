import React from 'react';
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoCloseCircle, IoClose } from 'react-icons/io5';
import { useFinance } from '../../context/FinanceContext';
import Button from './Button';

export const ToastContainer = () => {
  const { toasts, removeToast } = useFinance();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircle className="toast-icon success" />;
      case 'error':
        return <IoCloseCircle className="toast-icon error" />;
      case 'warning':
        return <IoWarning className="toast-icon warning" />;
      case 'info':
      default:
        return <IoInformationCircle className="toast-icon info" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item glass-panel toast-${toast.type}`}>
          <div className="toast-content">
            {getIcon(toast.type)}
            <span className="toast-message">{toast.message}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="toast-close-btn"
            onClick={() => removeToast(toast.id)}
            icon={IoClose}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
