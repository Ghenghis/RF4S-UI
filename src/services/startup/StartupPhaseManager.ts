
import { createRichLogger } from '../../rf4s/utils';

interface StartupPhase {
  name: string;
  services: string[];
  parallel: boolean;
}

export class StartupPhaseManager {
  private logger = createRichLogger('StartupPhaseManager');
  private phases: StartupPhase[] = [];
  private currentPhaseIndex = 0;

  constructor() {
    this.initializePhases();
  }

  private initializePhases(): void {
    this.phases = [
      {
        name: 'Core Services',
        services: ['EventManager', 'ServiceRegistry'],
        parallel: false
      },
      {
        name: 'Backend Services', 
        services: ['BackendIntegrationService'],
        parallel: false
      },
      {
        name: 'Integration Services',
        services: ['ConfiguratorIntegrationService', 'RF4SIntegrationService'],
        parallel: true
      },
      {
        name: 'Monitoring Services',
        services: ['ServiceHealthMonitor', 'ValidationService'],
        parallel: true
      },
      {
        name: 'Data Services',
        services: ['RealtimeDataService'],
        parallel: false
      },
      {
        name: 'UI Services',
        services: ['UIEventMappingRegistry'],
        parallel: false
      },
      {
        name: 'System Verification',
        services: ['ServiceIntegrationValidator'],
        parallel: false
      }
    ];
  }

  getPhases(): StartupPhase[] {
    return [...this.phases];
  }

  getCurrentPhase(): { phase: number; total: number; name: string } {
    return {
      phase: this.currentPhaseIndex + 1,
      total: this.phases.length,
      name: this.phases[this.currentPhaseIndex]?.name || 'Unknown'
    };
  }

  setCurrentPhaseIndex(index: number): void {
    this.currentPhaseIndex = index;
  }

  getTotalPhases(): number {
    return this.phases.length;
  }
}
