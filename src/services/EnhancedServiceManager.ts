
import { EventManager } from '../core/EventManager';
import { ServiceRegistry } from '../core/ServiceRegistry';
import { createRichLogger } from '../rf4s/utils';
import { profileManagementService } from './ProfileManagementService';
import { PerformanceOptimizationService } from './PerformanceOptimizationService';
import { advancedErrorRecoveryService } from './recovery/AdvancedErrorRecoveryService';
import { enhancedDataProcessor } from './realtime/EnhancedDataProcessor';

export class EnhancedServiceManager {
  private logger = createRichLogger('EnhancedServiceManager');
  private isInitialized = false;
  private services = new Map<string, any>();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.logger.info('Enhanced Service Manager: Initializing...');

    try {
      // Register enhanced services
      this.services.set('ProfileManagementService', profileManagementService);
      this.services.set('PerformanceOptimizationService', PerformanceOptimizationService);
      this.services.set('AdvancedErrorRecoveryService', advancedErrorRecoveryService);
      this.services.set('EnhancedDataProcessor', enhancedDataProcessor);

      // Initialize services in dependency order
      await profileManagementService.initialize();
      PerformanceOptimizationService.start();
      await advancedErrorRecoveryService.initialize();
      enhancedDataProcessor.start();

      this.setupEventListeners();
      this.isInitialized = true;

      this.logger.info('Enhanced Service Manager: All services initialized successfully');

      EventManager.emit('enhanced_services.initialized', {
        services: Array.from(this.services.keys()),
        timestamp: Date.now()
      }, 'EnhancedServiceManager');

    } catch (error) {
      this.logger.error('Enhanced Service Manager: Initialization failed:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Performance monitoring integration
    EventManager.subscribe('performance.optimizations_applied', (data) => {
      this.logger.info('Performance optimizations applied:', data);
      enhancedDataProcessor.addData('system-events', {
        type: 'performance.optimization',
        ...data
      });
    });

    // Error recovery integration
    EventManager.subscribe('recovery.plan_completed', (data) => {
      this.logger.info('Recovery plan completed:', data);
      enhancedDataProcessor.addData('system-events', {
        type: 'recovery.completed',
        ...data
      });
    });

    // Profile management integration
    EventManager.subscribe('profile.activated', (data) => {
      this.logger.info('Profile activated:', data.profile?.name);
      
      // Apply performance optimizations based on profile
      if (data.profile?.settings?.performance) {
        EventManager.emit('performance.apply_profile_settings', {
          settings: data.profile.settings.performance
        }, 'EnhancedServiceManager');
      }
    });

    // Data processing anomaly alerts
    EventManager.subscribe('anomaly.detection_completed', (data) => {
      if (data.data.severity === 'critical' || data.data.severity === 'high') {
        this.logger.warning('Anomaly detected:', data);
        
        EventManager.emit('system.anomaly_alert', {
          severity: data.data.severity,
          anomalies: data.data.anomalies,
          timestamp: data.timestamp
        }, 'EnhancedServiceManager');
      }
    });
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    this.logger.info('Enhanced Service Manager: Shutting down...');

    // Shutdown services in reverse order
    enhancedDataProcessor.stop();
    PerformanceOptimizationService.stop();
    profileManagementService.destroy();

    this.services.clear();
    this.isInitialized = false;

    this.logger.info('Enhanced Service Manager: Shutdown complete');
  }

  getServiceStatus(): { [serviceName: string]: any } {
    const status: { [serviceName: string]: any } = {};

    for (const [serviceName, service] of this.services.entries()) {
      try {
        if (serviceName === 'ProfileManagementService') {
          status[serviceName] = {
            healthy: service.isHealthy(),
            activeProfile: service.getActiveProfile()?.name || 'None'
          };
        } else if (serviceName === 'PerformanceOptimizationService') {
          status[serviceName] = {
            active: service.getOptimizationStatus().active,
            appliedOptimizations: service.getOptimizationStatus().appliedOptimizations
          };
        } else if (serviceName === 'AdvancedErrorRecoveryService') {
          status[serviceName] = {
            activeRecoveries: service.getActiveRecoveries().length,
            stats: service.getRecoveryStats()
          };
        } else if (serviceName === 'EnhancedDataProcessor') {
          status[serviceName] = {
            processing: true,
            streamStats: service.getStreamStats(),
            pipelineStats: service.getPipelineStats()
          };
        }
      } catch (error) {
        status[serviceName] = { error: error.message };
      }
    }

    return status;
  }

  isHealthy(): boolean {
    if (!this.isInitialized) return false;

    try {
      return profileManagementService.isHealthy() &&
             this.services.has('PerformanceOptimizationService') &&
             this.services.has('AdvancedErrorRecoveryService') &&
             this.services.has('EnhancedDataProcessor');
    } catch {
      return false;
    }
  }
}

export const enhancedServiceManager = new EnhancedServiceManager();
