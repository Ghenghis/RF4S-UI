
import { useState, useEffect } from 'react';
import { ServiceStartupVerifier } from '../services/ServiceStartupVerifier';
import { EventManager } from '../core/EventManager';

interface SystemStartupReport {
  overallStatus: 'initializing' | 'ready' | 'partial' | 'failed';
  totalServices: number;
  runningServices: number;
  failedServices: number;
  serviceStatuses: Array<{
    serviceName: string;
    status: 'initializing' | 'running' | 'failed' | 'stopped';
    startTime: Date | null;
    error?: string;
    phase?: string;
    healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
  }>;
  startupTime: number;
  currentPhase?: { phase: number; total: number; name: string };
  healthSummary?: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    avgResponseTime: number;
    avgErrorRate: number;
  };
}

export const useServiceStartup = () => {
  const [startupReport, setStartupReport] = useState<SystemStartupReport>({
    overallStatus: 'initializing',
    totalServices: 0,
    runningServices: 0,
    failedServices: 0,
    serviceStatuses: [],
    startupTime: 0
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        const report = await ServiceStartupVerifier.verifySystemStartup();
        setStartupReport(report);
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setIsInitializing(false);
      }
    };

    initializeServices();

    // Listen for system startup events
    const unsubscribeComplete = EventManager.subscribe('system.startup_complete', (data: SystemStartupReport) => {
      setStartupReport(data);
      setIsInitializing(false);
    });

    const unsubscribeFailed = EventManager.subscribe('system.startup_failed', (data: any) => {
      setStartupReport(prev => ({
        ...prev,
        overallStatus: 'failed'
      }));
      setIsInitializing(false);
    });

    // Listen for phase updates
    const unsubscribePhase = EventManager.subscribe('system.startup_phase_updated', (data: any) => {
      setStartupReport(prev => ({
        ...prev,
        currentPhase: data.phase
      }));
    });

    return () => {
      EventManager.unsubscribe('system.startup_complete', unsubscribeComplete);
      EventManager.unsubscribe('system.startup_failed', unsubscribeFailed);
      EventManager.unsubscribe('system.startup_phase_updated', unsubscribePhase);
    };
  }, []);

  const retryStartup = async () => {
    setIsInitializing(true);
    try {
      const report = await ServiceStartupVerifier.verifySystemStartup();
      setStartupReport(report);
    } catch (error) {
      console.error('Retry startup failed:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    startupReport,
    isInitializing,
    isSystemReady: ServiceStartupVerifier.isSystemReady(),
    retryStartup
  };
};
