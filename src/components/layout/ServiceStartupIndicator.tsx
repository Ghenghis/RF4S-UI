
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useServiceStartup } from '../../hooks/useServiceStartup';

export const ServiceStartupIndicator = () => {
  const { startupReport, isInitializing, isSystemReady, retryStartup } = useServiceStartup();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: 'default',
      partial: 'secondary',
      failed: 'destructive',
      initializing: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const progressValue = startupReport.totalServices > 0 
    ? (startupReport.runningServices / startupReport.totalServices) * 100 
    : 0;

  // Don't render if hidden
  if (!isVisible) {
    return null;
  }

  // Compact initializing view
  if (isInitializing) {
    return (
      <div className="fixed top-4 right-4 z-50 w-80">
        <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Initializing Services...
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={progressValue} className="w-full h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Setting up backend services...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>System Status</span>
              {getStatusBadge(startupReport.overallStatus)}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {/* Compact view - always visible */}
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs">
            <span>Services: {startupReport.runningServices}/{startupReport.totalServices}</span>
            <span>Uptime: {startupReport.startupTime}ms</span>
          </div>
          <Progress value={progressValue} className="w-full h-2 mt-2" />
        </CardContent>

        {/* Expanded view - only when expanded */}
        {isExpanded && (
          <CardContent className="pt-0 border-t border-gray-700">
            <div className="space-y-3">
              {startupReport.overallStatus === 'failed' && (
                <Button onClick={retryStartup} variant="outline" size="sm" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Startup
                </Button>
              )}

              <div className="max-h-32 overflow-y-auto space-y-1">
                {startupReport.serviceStatuses.map((service) => (
                  <div key={service.serviceName} className="flex items-center justify-between py-1">
                    <span className="text-xs truncate">{service.serviceName}</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(service.status)}
                      <span className="text-xs">{service.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
