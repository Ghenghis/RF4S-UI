
import React from 'react';
import { Badge } from '../../ui/badge';

interface StatusBadgeProps {
  status: 'ready' | 'partial' | 'failed' | 'initializing';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants = {
    ready: 'default',
    partial: 'secondary',
    failed: 'destructive',
    initializing: 'outline'
  } as const;
  
  return (
    <Badge variant={variants[status] || 'outline'}>
      {status.toUpperCase()}
    </Badge>
  );
};
