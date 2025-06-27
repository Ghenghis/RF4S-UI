
import React from 'react';
import { ServiceHealthIndicator } from './ServiceHealthIndicator';

interface ServiceStatus {
  serviceName: string;
  status: 'initializing' | 'running' | 'failed' | 'stopped';
  startTime: Date | null;
  error?: string;
  phase?: string;
  healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
}

interface ServiceListProps {
  services: ServiceStatus[];
}

export const ServiceList = ({ services }: ServiceListProps) => {
  return (
    <div className="max-h-40 overflow-y-auto space-y-1">
      {services.map((service) => (
        <div key={service.serviceName} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs truncate">{service.serviceName}</span>
          </div>
          <ServiceHealthIndicator 
            status={service.status} 
            healthStatus={service.healthStatus} 
          />
        </div>
      ))}
    </div>
  );
};
