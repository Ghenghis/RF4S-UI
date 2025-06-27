
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, X, AlertTriangle, Activity } from 'lucide-react';
import { useServiceStartup } from '../../hooks/useServiceStartup';

export const ServiceStartupIndicator = () => {
  const { startupReport, isInitializing, isSystemReady, retryStartup } = useServiceStartup();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getStatusIcon = (status: string, healthStatus?: string) => {
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

  const getHealthBadge = (health?: string) => {
    if (!health || health === 'unknown') return null;
    
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[health as keyof typeof variants]} className="text-xs">
        {health}
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
                <span>Initializing Services...</span>
                {startupReport.currentPhase && (
                  <Badge variant="outline" className="text-xs">
                    Phase {startupReport.currentPhase.phase}/{startupReport.currentPhase.total}
                  </Badge>
                )}
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
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Setting up backend services...</span>
              {startupReport.currentPhase && (
                <span>{startupReport.currentPhase.name}</span>
              )}
            </div>
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
              <Activity className="w-4 h-4" />
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
          
          {/* Health summary */}
          {startupReport.healthSummary && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>Health:</span>
              <Badge variant="default" className="text-xs">
                {startupReport.healthSummary.healthy}✓
              </Badge>
              {startupReport.healthSummary.warning > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {startupReport.healthSummary.warning}⚠
                </Badge>
              )}
              {startupReport.healthSummary.critical > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {startupReport.healthSummary.critical}✗
                </Badge>
              )}
            </div>
          )}
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

              {/* Current phase info */}
              {startupReport.currentPhase && (
                <div className="text-xs text-muted-foreground">
                  <span>Current Phase: {startupReport.currentPhase.name}</span>
                  <Progress 
                    value={(startupReport.currentPhase.phase / startupReport.currentPhase.total) * 100} 
                    className="w-full h-1 mt-1" 
                  />
                </div>
              )}

              <div className="max-h-40 overflow-y-auto space-y-1">
                {startupReport.serviceStatuses.map((service) => (
                  <div key={service.serviceName} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs truncate">{service.serviceName}</span>
                      {getHealthBadge(service.healthStatus)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(service.status, service.healthStatus)}
                      <span className="text-xs">{service.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Health metrics */}
              {startupReport.healthSummary && (
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Performance</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Avg Response: {startupReport.healthSummary.avgResponseTime}ms</div>
                    <div>Error Rate: {startupReport.healthSummary.avgErrorRate}%</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
