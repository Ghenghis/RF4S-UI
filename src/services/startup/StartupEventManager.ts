
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface PhaseEventData {
  phaseName: string;
  phaseNumber?: number;
  totalPhases?: number;
  services?: string[];
  completedAt?: number;
}

interface PhaseFailedEventData {
  phaseName: string;
  error: string;
}

interface HealthUpdateData {
  summary?: any;
  serviceResults?: any[];
}

export class StartupEventManager {
  private static logger = createRichLogger('StartupEventManager');

  static setupEventListeners(
    onPhaseUpdate: (phaseData: any) => void,
    onHealthUpdate: (healthData: any) => void
  ): void {
    EventManager.subscribe('startup.phase_started', (data: PhaseEventData) => {
      this.logger.info(`Phase started: ${data.phaseName}`);
      onPhaseUpdate(data);
    });

    EventManager.subscribe('startup.phase_completed', (data: PhaseEventData) => {
      this.logger.info(`Phase completed: ${data.phaseName}`);
      onPhaseUpdate(data);
    });

    EventManager.subscribe('startup.phase_failed', (data: PhaseFailedEventData) => {
      this.logger.error(`Phase failed: ${data.phaseName} - ${data.error}`);
      const handler = (data: PhaseFailedEventData) => {
        console.error('Phase failed:', data.phaseName, '-', data.error);
      };
      handler(data);
    });

    EventManager.subscribe('health.status_updated', (data: HealthUpdateData) => {
      onHealthUpdate(data);
    });
  }

  static emitPhaseUpdate(currentPhase: any, services: string[]): void {
    EventManager.emit('startup.phase_update', {
      currentPhase,
      services,
      timestamp: Date.now()
    }, 'StartupEventManager');
  }

  static emitStartupComplete(report: any): void {
    EventManager.emit('startup.complete', report, 'StartupEventManager');
  }

  static emitStartupFailed(error: any, duration: number): void {
    EventManager.emit('startup.failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp: Date.now()
    }, 'StartupEventManager');
  }
}
