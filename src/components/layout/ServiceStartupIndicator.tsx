
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { RefreshCw, ChevronDown, ChevronUp, X, Activity } from 'lucide-react';
import { useServiceStartup } from '../../hooks/useServiceStartup';
import { StatusBadge } from './startup/StatusBadge';
import { ServiceList } from './startup/ServiceList';
import { HealthSummary } from './startup/HealthSummary';
import { PhaseIndicator } from './startup/PhaseIndicator';

export const ServiceStartupIndicator = () => {
  const { startupReport, isInitializing, retryStartup } = useServiceStartup();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
                <PhaseIndicator currentPhase={startupReport.currentPhase} isInitializing />
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
              <StatusBadge status={startupReport.overallStatus} />
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
            <HealthSummary healthSummary={startupReport.healthSummary} />
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
              <PhaseIndicator currentPhase={startupReport.currentPhase} />

              <ServiceList services={startupReport.serviceStatuses} />

              {/* Health metrics */}
              {startupReport.healthSummary && (
                <HealthSummary healthSummary={startupReport.healthSummary} />
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
