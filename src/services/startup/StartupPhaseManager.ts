
export interface StartupPhase {
  name: string;
  services: string[];
  parallel: boolean;
  timeout: number;
}

export class StartupPhaseManager {
  private phases: StartupPhase[] = [
    {
      name: 'Core Initialization',
      services: ['EventManager', 'ServiceRegistry'],
      parallel: false,
      timeout: 5000
    },
    {
      name: 'Backend Services',
      services: ['BackendIntegrationService'],
      parallel: false,
      timeout: 10000
    },
    {
      name: 'Integration Services',
      services: ['ConfiguratorIntegrationService', 'RF4SIntegrationService'],
      parallel: true,
      timeout: 15000
    },
    {
      name: 'Realtime Services',
      services: ['RealtimeDataService'],
      parallel: false,
      timeout: 5000
    },
    {
      name: 'Monitoring Services',
      services: ['ServiceHealthMonitor'],
      parallel: false,
      timeout: 5000
    },
    {
      name: 'Validation Services',
      services: ['ValidationService'],
      parallel: false,
      timeout: 5000
    },
    {
      name: 'System Ready',
      services: [],
      parallel: false,
      timeout: 1000
    }
  ];
  
  private currentPhaseIndex: number = 0;

  getPhases(): StartupPhase[] {
    return this.phases;
  }

  getCurrentPhase(): { phase: number; total: number; name: string } {
    return {
      phase: this.currentPhaseIndex + 1,
      total: this.phases.length,
      name: this.phases[this.currentPhaseIndex]?.name || 'Unknown Phase'
    };
  }

  setCurrentPhaseIndex(index: number): void {
    this.currentPhaseIndex = index;
  }

  getTotalPhases(): number {
    return this.phases.length;
  }
}
