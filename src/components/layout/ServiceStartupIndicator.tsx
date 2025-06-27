
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useServiceStartup } from '../../hooks/useServiceStartup';

export const ServiceStartupIndicator = () => {
  const { startupReport, isInitializing, isSystemReady, retryStartup } = useServiceStartup();

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

  if (isInitializing) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Initializing Services...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressValue} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">
            Setting up backend services...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Status</span>
          {getStatusBadge(startupReport.overallStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Services Running</span>
            <span className="text-sm">
              {startupReport.runningServices}/{startupReport.totalServices}
            </span>
          </div>
          
          <Progress value={progressValue} className="w-full" />
          
          <div className="text-sm text-muted-foreground">
            Startup time: {startupReport.startupTime}ms
          </div>

          {startupReport.overallStatus === 'failed' && (
            <Button onClick={retryStartup} variant="outline" size="sm">
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
    </Card>
  );
};
