import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />,
    info: <Info className="w-5 h-5 text-secondary shrink-0" />,
  };

  const borders = {
    success: 'border-status-success/30 bg-carbon-card shadow-glow',
    error: 'border-status-danger/30 bg-carbon-card shadow-card',
    info: 'border-secondary/30 bg-carbon-card shadow-cyanGlow',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-card text-sm text-text-primary ${borders[type]} animate-slide-up`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 ml-2 text-text-muted hover:text-text-primary rounded-btn transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
