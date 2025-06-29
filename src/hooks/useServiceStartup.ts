
import { useState, useEffect } from 'react';
import { ServiceStartupVerifier } from '../services/ServiceStartupVerifier';
import { EventManager } from '../core/EventManager';
import { SystemStartupReport } from '../services/startup/types';

export const useServiceStartup = () => {
  const [startupReport, setStartupReport] = useState<SystemStartupReport>({
    overallStatus: 'initializing',
    totalServices: 0,
    runningServices: 0,
    failedServices: 0,
    serviceStatuses: [],
    startupTime: 0,
    startTime: new Date(),
    endTime: new Date(),
    totalDuration: 0,
    phasesCompleted: 0,
    totalPhases: 0,
    servicesInitialized: 0,
    phaseReports: []
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
