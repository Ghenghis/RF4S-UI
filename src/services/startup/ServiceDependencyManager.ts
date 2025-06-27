
export interface ServiceDependency {
  serviceName: string;
  dependencies: string[];
  timeout: number;
  retryAttempts: number;
  criticalService: boolean;
}

export class ServiceDependencyManager {
  private serviceDependencies: Map<string, ServiceDependency> = new Map();

  constructor() {
    this.defineServiceDependencies();
  }

  private defineServiceDependencies(): void {
    const dependencies: ServiceDependency[] = [
      {
        serviceName: 'ErrorRecoveryService',
        dependencies: [],
        timeout: 5000,
        retryAttempts: 2,
        criticalService: true
      },
      {
        serviceName: 'ConfigValidationService',
        dependencies: ['ErrorRecoveryService'],
        timeout: 3000,
        retryAttempts: 3,
        criticalService: true
      },
      {
        serviceName: 'UserPreferenceService',
        dependencies: ['ConfigValidationService'],
        timeout: 2000,
        retryAttempts: 2,
        criticalService: false
      },
      {
        serviceName: 'SessionStateService',
        dependencies: ['UserPreferenceService'],
        timeout: 2000,
        retryAttempts: 2,
        criticalService: false
      },
      {
        serviceName: 'RF4SProcessMonitor',
        dependencies: ['ErrorRecoveryService'],
        timeout: 8000,
        retryAttempts: 3,
        criticalService: true
      },
      {
        serviceName: 'SystemMonitorService',
        dependencies: ['RF4SProcessMonitor'],
        timeout: 5000,
        retryAttempts: 2,
        criticalService: true
      },
      {
        serviceName: 'RealtimeDataService',
        dependencies: ['SystemMonitorService'],
        timeout: 4000,
        retryAttempts: 3,
        criticalService: true
      },
      {
        serviceName: 'RF4SIntegrationService',
        dependencies: ['RealtimeDataService', 'RF4SProcessMonitor'],
        timeout: 10000,
        retryAttempts: 3,
        criticalService: true
      }
    ];

    dependencies.forEach(dep => {
      this.serviceDependencies.set(dep.serviceName, dep);
    });
  }

  getDependency(serviceName: string): ServiceDependency | undefined {
    return this.serviceDependencies.get(serviceName);
  }

  getAllDependencies(): Map<string, ServiceDependency> {
    return new Map(this.serviceDependencies);
  }
}
