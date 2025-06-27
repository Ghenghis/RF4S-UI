
import { useState, useCallback } from 'react';
import { useUIEventSubscriptions } from './useUIEventSubscriptions';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  temperature: number;
  timestamp?: Date;
}

interface RealtimeMetrics {
  systemMetrics?: SystemMetrics;
  fishingStats?: any;
  sessionStats?: any;
}

export const useSystemMonitorEvents = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    temperature: 0
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    lastUpdate: Date | null;
  }>({
    connected: false,
    lastUpdate: null
  });

  // Define event handlers
  const eventHandlers = {
    handleSystemResourceUpdate: useCallback((data: any) => {
      console.log('System Monitor: Received resource update', data);
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: data.cpuUsage || prev.cpuUsage,
        memoryUsage: data.memoryUsage || prev.memoryUsage,
        fps: data.fps || prev.fps,
        temperature: data.temperature || prev.temperature,
        timestamp: new Date()
      }));
      setConnectionStatus({
        connected: true,
        lastUpdate: new Date()
      });
    }, []),

    handleRealtimeMetricsUpdate: useCallback((data: RealtimeMetrics) => {
      console.log('System Monitor: Received realtime metrics', data);
      if (data.systemMetrics) {
        setSystemMetrics(prev => ({
          ...prev,
          ...data.systemMetrics,
          timestamp: new Date()
        }));
      }
      setConnectionStatus({
        connected: true,
        lastUpdate: new Date()
      });
    }, []),

    handleSessionStart: useCallback((data: any) => {
      console.log('System Monitor: Session started', data);
      // Update any session-related metrics
    }, []),

    handleSessionStop: useCallback((data: any) => {
      console.log('System Monitor: Session stopped', data);
      // Update any session-related metrics
    }, []),

    handleConfigUpdate: useCallback((data: any) => {
      console.log('System Monitor: Config updated', data);
      // Handle configuration changes that affect monitoring
    }, []),

    handlePreferenceChange: useCallback((data: any) => {
      console.log('System Monitor: Preference changed', data);
      // Handle preference changes
    }, []),

    handleBackendHealthUpdate: useCallback((data: any) => {
      console.log('System Monitor: Backend health updated', data);
      setConnectionStatus({
        connected: data.integrationStatus === 'connected',
        lastUpdate: new Date()
      });
    }, []),

    handleValidationReport: useCallback((data: any) => {
      console.log('System Monitor: Validation report received', data);
      // Handle validation status updates
    }, []),

    handleServiceError: useCallback((data: any) => {
      console.log('System Monitor: Service error detected', data);
      // Handle service errors
      setConnectionStatus(prev => ({
        ...prev,
        connected: false
      }));
    }, [])
  };

  // Use the UI event subscriptions hook
  const { emitUIAction } = useUIEventSubscriptions('SystemMonitorPanel', eventHandlers);

  // Helper functions for UI actions
  const requestSystemUpdate = useCallback(() => {
    emitUIAction('system_update_request', { timestamp: new Date() });
  }, [emitUIAction]);

  const reportUIError = useCallback((error: string) => {
    emitUIAction('ui_error', { error, source: 'SystemMonitorPanel', timestamp: new Date() });
  }, [emitUIAction]);

  return {
    systemMetrics,
    connectionStatus,
    requestSystemUpdate,
    reportUIError
  };
};
