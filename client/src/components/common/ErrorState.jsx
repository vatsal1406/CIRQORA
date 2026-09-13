import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while communicating with the CIRQORA backend.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-card border border-status-danger/30 bg-status-danger/10 my-4">
      <div className="p-3 rounded-full bg-status-danger/20 text-status-danger mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
      <p className="text-sm text-text-secondary max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" icon={RefreshCw}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
