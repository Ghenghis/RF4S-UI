
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin',
        getSpinnerSize()
      )} />
      {text && (
        <span className="text-sm text-gray-400">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
