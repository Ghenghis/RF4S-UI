
import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface ServiceHealthIndicatorProps {
  status: string;
  healthStatus?: string;
}

export const ServiceHealthIndicator = ({ status, healthStatus }: ServiceHealthIndicatorProps) => {
  const getStatusIcon = () => {
    if (healthStatus === 'critical') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (healthStatus === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'initializing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthBadge = () => {
    if (!healthStatus || healthStatus === 'unknown') return null;
    
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[healthStatus as keyof typeof variants]} className="text-xs">
        {healthStatus}
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon()}
      <span className="text-xs">{status}</span>
      {getHealthBadge()}
    </div>
  );
};
