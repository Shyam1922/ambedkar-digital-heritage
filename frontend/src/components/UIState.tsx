import React from 'react';
import { AlertCircle, FileQuestion, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading archival material...', className = '' }: LoadingStateProps) {
  return (
    <div className={`notice loading-state ${className}`}>
      <Loader2 className="spinner-icon" size={20} />
      <span>{message}</span>
    </div>
  );
}

interface ErrorNoticeProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorNotice({ message, onRetry, className = '' }: ErrorNoticeProps) {
  return (
    <div className={`notice error ${className}`}>
      <div className="error-content">
        <AlertCircle size={18} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          Retry
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  message = 'Try adjusting your search criteria or material type filter.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`empty-state-box ${className}`}>
      <div className="empty-icon">{icon || <FileQuestion size={36} />}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
