
import { RealtimeDataService } from '../RealtimeDataService';
import { SystemMonitorService } from '../SystemMonitorService';
import { RF4SIntegrationService } from '../RF4SIntegrationService';
import { ConfigValidationService } from '../ConfigValidationService';
import { PerformanceOptimizationService } from '../PerformanceOptimizationService';
import { ErrorRecoveryService } from '../ErrorRecoveryService';
import { StatisticsCalculator } from '../StatisticsCalculator';
import { DetectionLogicHandler } from '../DetectionLogicHandler';
import { ProfileLogicManager } from '../ProfileLogicManager';
import { FishingModeLogic } from '../FishingModeLogic';
import { UserPreferenceService } from '../UserPreferenceService';
import { SessionStateService } from '../SessionStateService';
import { PanelEventCoordinator } from '../PanelEventCoordinator';
import { RF4SProcessMonitor } from '../RF4SProcessMonitor';

export interface ServiceInfo {
  name: string;
  instance: any;
  running: boolean;
  startTime: Date | null;
  dependencies?: string[];
  errorCount?: number;
}

export class ServiceDefinitions {
  private services: Map<string, ServiceInfo> = new Map();
  
  private startupOrder: string[] = [
    // Core system services first
    'ErrorRecoveryService',
    'ConfigValidationService',
    'UserPreferenceService',
    'SessionStateService',
    
    // Process and system monitoring
    'RF4SProcessMonitor',
    'SystemMonitorService',
    'RealtimeDataService',
    
    // RF4S Integration
    'RF4SIntegrationService',
    
    // Logic services
    'DetectionLogicHandler',
    'ProfileLogicManager',
    'FishingModeLogic',
    'StatisticsCalculator',
    
    // Optimization and coordination
    'PerformanceOptimizationService',
    'PanelEventCoordinator'
  ];

  constructor() {
    this.registerServices();
  }

  getServices(): Map<string, ServiceInfo> {
    return this.services;
  }

  getStartupOrder(): string[] {
    return [...this.startupOrder];
  }

  private registerServices(): void {
    // Register all services with their instances
    this.services.set('RealtimeDataService', {
      name: 'RealtimeDataService',
      instance: RealtimeDataService,
      running: false,
      startTime: null
    });

    this.services.set('SystemMonitorService', {
      name: 'SystemMonitorService',
      instance: SystemMonitorService,
      running: false,
      startTime: null
    });

    this.services.set('RF4SIntegrationService', {
      name: 'RF4SIntegrationService',
      instance: RF4SIntegrationService,
      running: false,
      startTime: null
    });

    this.services.set('RF4SProcessMonitor', {
      name: 'RF4SProcessMonitor',
      instance: RF4SProcessMonitor,
      running: false,
      startTime: null
    });

    this.services.set('ConfigValidationService', {
      name: 'ConfigValidationService',
      instance: ConfigValidationService,
      running: false,
      startTime: null
    });

    this.services.set('PerformanceOptimizationService', {
      name: 'PerformanceOptimizationService',
      instance: PerformanceOptimizationService,
      running: false,
      startTime: null
    });

    this.services.set('ErrorRecoveryService', {
      name: 'ErrorRecoveryService',
      instance: ErrorRecoveryService,
      running: false,
      startTime: null
    });

    this.services.set('StatisticsCalculator', {
      name: 'StatisticsCalculator',
      instance: StatisticsCalculator,
      running: false,
      startTime: null
    });

    this.services.set('DetectionLogicHandler', {
      name: 'DetectionLogicHandler',
      instance: DetectionLogicHandler,
      running: false,
      startTime: null
    });

    this.services.set('ProfileLogicManager', {
      name: 'ProfileLogicManager',
      instance: ProfileLogicManager,
      running: false,
      startTime: null
    });

    this.services.set('FishingModeLogic', {
      name: 'FishingModeLogic',
      instance: FishingModeLogic,
      running: false,
      startTime: null
    });

    this.services.set('UserPreferenceService', {
      name: 'UserPreferenceService',
      instance: UserPreferenceService,
      running: false,
      startTime: null
    });

    this.services.set('SessionStateService', {
      name: 'SessionStateService',
      instance: SessionStateService,
      running: false,
      startTime: null
    });

    this.services.set('PanelEventCoordinator', {
      name: 'PanelEventCoordinator',
      instance: PanelEventCoordinator,
      running: false,
      startTime: null
    });
  }
}
