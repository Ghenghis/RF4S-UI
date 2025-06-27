
import { EventManager } from '../../core/EventManager';
import { SystemStartupReport } from './types';

export class StartupEventManager {
  static setupEventListeners(
    updatePhaseCallback: (phaseData: any) => void,
    updateHealthCallback: (healthData: any) => void
  ): void {
    // Listen for phase updates
    EventManager.subscribe('startup.phase_started', (data: any) => {
      updatePhaseCallback(data);
    });

    EventManager.subscribe('startup.phase_completed', (data: any) => {
      console.log(`Phase completed: ${data.phaseName} in ${data.duration}ms`);
    });

    EventManager.subscribe('startup.phase_failed', (data: any) => {
      console.error(`Phase failed: ${data.phaseName} - ${data.error}`);
    });

    // Listen for health updates
    EventManager.subscribe('health.check_completed', (data: any) => {
      updateHealthCallback(data);
    });

    EventManager.subscribe('health.critical_alert', (data: any) => {
      console.warn('Critical health alert:', data);
    });

    // Listen for error recovery
    EventManager.subscribe('error.recovered', (data: any) => {
      console.log('Error recovered:', data.recoveryStrategy);
    });

    EventManager.subscribe('error.escalated', (data: any) => {
      console.error('Error escalated:', data.errorContext);
    });
  }

  static emitStartupComplete(report: SystemStartupReport): void {
    EventManager.emit('system.startup_complete', report, 'ServiceStartupVerifier');
  }

  static emitStartupFailed(error: any, startupTime: number): void {
    EventManager.emit('system.startup_failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
      startupTime
    }, 'ServiceStartupVerifier');
  }

  static emitPhaseUpdate(phase: any, services: any): void {
    EventManager.emit('system.startup_phase_updated', {
      phase,
      services
    }, 'ServiceStartupVerifier');
  }
}
