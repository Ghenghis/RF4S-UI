
export interface StartupPhase {
  name: string;
  services: string[];
  parallel: boolean;
  timeout: number;
}

export class StartupPhaseManager {
  private startupPhases: StartupPhase[] = [];
  private currentPhase = 0;

  constructor() {
    this.defineStartupPhases();
  }

  private defineStartupPhases(): void {
    this.startupPhases = [
      {
        name: 'Core Services',
        services: ['ErrorRecoveryService', 'ConfigValidationService'],
        parallel: false,
        timeout: 10000
      },
      {
        name: 'User Services',
        services: ['UserPreferenceService', 'SessionStateService'],
        parallel: true,
        timeout: 5000
      },
      {
        name: 'Monitoring Services',
        services: ['RF4SProcessMonitor', 'SystemMonitorService'],
        parallel: false,
        timeout: 15000
      },
      {
        name: 'Data Services',
        services: ['RealtimeDataService'],
        parallel: false,
        timeout: 8000
      },
      {
        name: 'Integration Services',
        services: ['RF4SIntegrationService'],
        parallel: false,
        timeout: 12000
      },
      {
        name: 'Logic Services',
        services: ['DetectionLogicHandler', 'ProfileLogicManager', 'FishingModeLogic'],
        parallel: true,
        timeout: 8000
      },
      {
        name: 'Optimization Services',
        services: ['StatisticsCalculator', 'PerformanceOptimizationService', 'PanelEventCoordinator'],
        parallel: true,
        timeout: 6000
      }
    ];
  }

  getPhases(): StartupPhase[] {
    return [...this.startupPhases];
  }

  getCurrentPhaseIndex(): number {
    return this.currentPhase;
  }

  setCurrentPhaseIndex(index: number): void {
    this.currentPhase = index;
  }

  getCurrentPhase(): { phase: number; total: number; name: string } {
    return {
      phase: this.currentPhase + 1,
      total: this.startupPhases.length,
      name: this.startupPhases[this.currentPhase]?.name || 'Complete'
    };
  }

  getTotalPhases(): number {
    return this.startupPhases.length;
  }
}
