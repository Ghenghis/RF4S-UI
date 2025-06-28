
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  className
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      case 'disconnected':
      default:
        return 'bg-gray-500';
    }
  };

  const getDotSize = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn('rounded-full', getDotSize(), getStatusColor())} />
      {label && (
        <span className="text-sm text-gray-300 capitalize">{label || status}</span>
      )}
    </div>
  );
};

export default StatusIndicator;
