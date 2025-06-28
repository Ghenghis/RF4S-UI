
import { EventManager } from '../../core/EventManager';
import { ServiceRegistry } from '../../core/ServiceRegistry';
import { createRichLogger } from '../../rf4s/utils';

export interface IntegrationConfig {
  rf4s: {
    enabled: boolean;
    connectionTimeout: number;
    retryAttempts: number;
    apiEndpoint: string;
    webhookUrl?: string;
  };
  realtime: {
    enabled: boolean;
    updateInterval: number;
    batchSize: number;
    websocketUrl: string;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      cpu: number;
      memory: number;
      fps: number;
    };
  };
  backup: {
    enabled: boolean;
    autoBackupInterval: number;
    maxBackups: number;
    compressionEnabled: boolean;
  };
}

export class IntegrationConfigManager {
  private logger = createRichLogger('IntegrationConfigManager');
  private config: IntegrationConfig;
  private isInitialized = false;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.logger.info('IntegrationConfigManager: Initializing...');

    try {
      // Register with ServiceRegistry
      ServiceRegistry.register('IntegrationConfigManager', this, [], {
        type: 'integration',
        priority: 'high'
      });

      // Load configuration from storage
      await this.loadConfiguration();

      this.isInitialized = true;
      ServiceRegistry.updateStatus('IntegrationConfigManager', 'running');

      this.logger.info('IntegrationConfigManager: Successfully initialized');

      EventManager.emit('integration.config_loaded', {
        config: this.config,
        timestamp: Date.now()
      }, 'IntegrationConfigManager');

    } catch (error) {
      ServiceRegistry.updateStatus('IntegrationConfigManager', 'error');
      this.logger.error('IntegrationConfigManager: Initialization failed:', error);
      throw error;
    }
  }

  private getDefaultConfig(): IntegrationConfig {
    return {
      rf4s: {
        enabled: true,
        connectionTimeout: 5000,
        retryAttempts: 3,
        apiEndpoint: 'http://localhost:8080/api',
        webhookUrl: undefined
      },
      realtime: {
        enabled: true,
        updateInterval: 1000,
        batchSize: 50,
        websocketUrl: 'ws://localhost:8080/ws'
      },
      monitoring: {
        enabled: true,
        metricsInterval: 2000,
        alertThresholds: {
          cpu: 80,
          memory: 400,
          fps: 30
        }
      },
      backup: {
        enabled: true,
        autoBackupInterval: 300000, // 5 minutes
        maxBackups: 10,
        compressionEnabled: true
      }
    };
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const stored = localStorage.getItem('rf4s_integration_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...parsedConfig };
        this.logger.info('Configuration loaded from storage');
      }
    } catch (error) {
      this.logger.warning('Failed to load stored configuration, using defaults:', error);
    }
  }

  async saveConfiguration(): Promise<void> {
    try {
      localStorage.setItem('rf4s_integration_config', JSON.stringify(this.config));
      this.logger.info('Configuration saved to storage');
      
      EventManager.emit('integration.config_saved', {
        config: this.config,
        timestamp: Date.now()
      }, 'IntegrationConfigManager');
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }

  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  getRF4SConfig() {
    return { ...this.config.rf4s };
  }

  getRealtimeConfig() {
    return { ...this.config.realtime };
  }

  getMonitoringConfig() {
    return { ...this.config.monitoring };
  }

  getBackupConfig() {
    return { ...this.config.backup };
  }

  async updateConfig(section: keyof IntegrationConfig, updates: Partial<IntegrationConfig[typeof section]>): Promise<void> {
    try {
      this.config[section] = { ...this.config[section], ...updates };
      await this.saveConfiguration();
      
      EventManager.emit('integration.config_updated', {
        section,
        updates,
        timestamp: Date.now()
      }, 'IntegrationConfigManager');
    } catch (error) {
      this.logger.error(`Failed to update ${section} config:`, error);
      throw error;
    }
  }

  async resetToDefaults(): Promise<void> {
    this.config = this.getDefaultConfig();
    await this.saveConfiguration();
    
    EventManager.emit('integration.config_reset', {
      timestamp: Date.now()
    }, 'IntegrationConfigManager');
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate RF4S config
    if (this.config.rf4s.connectionTimeout < 1000) {
      errors.push('RF4S connection timeout must be at least 1000ms');
    }

    // Validate realtime config
    if (this.config.realtime.updateInterval < 100) {
      errors.push('Realtime update interval must be at least 100ms');
    }

    // Validate monitoring config
    if (this.config.monitoring.metricsInterval < 500) {
      errors.push('Monitoring metrics interval must be at least 500ms');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isHealthy(): boolean {
    return this.isInitialized;
  }

  destroy(): void {
    this.isInitialized = false;
    ServiceRegistry.updateStatus('IntegrationConfigManager', 'stopped');
    this.logger.info('IntegrationConfigManager: Destroyed');
  }
}

export const integrationConfigManager = new IntegrationConfigManager();
