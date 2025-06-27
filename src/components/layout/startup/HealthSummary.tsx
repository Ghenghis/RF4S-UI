
import React from 'react';
import { Badge } from '../../ui/badge';

interface HealthSummaryData {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  avgResponseTime: number;
  avgErrorRate: number;
}

interface HealthSummaryProps {
  healthSummary: HealthSummaryData;
}

export const HealthSummary = ({ healthSummary }: HealthSummaryProps) => {
  return (
    <>
      <div className="flex items-center gap-2 mt-2 text-xs">
        <span>Health:</span>
        <Badge variant="default" className="text-xs">
          {healthSummary.healthy}✓
        </Badge>
        {healthSummary.warning > 0 && (
          <Badge variant="secondary" className="text-xs">
            {healthSummary.warning}⚠
          </Badge>
        )}
        {healthSummary.critical > 0 && (
          <Badge variant="destructive" className="text-xs">
            {healthSummary.critical}✗
          </Badge>
        )}
      </div>
      
      <div className="border-t border-gray-700 pt-2 mt-2">
        <div className="text-xs text-muted-foreground mb-1">Performance</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Avg Response: {healthSummary.avgResponseTime}ms</div>
          <div>Error Rate: {healthSummary.avgErrorRate}%</div>
        </div>
      </div>
    </>
  );
};
