
import { createRichLogger } from '../../rf4s/utils';
import { EventManager } from '../../core/EventManager';
import { integrationConfigManager } from './IntegrationConfigManager';

export interface RF4SSpecificConfig {
  detection: {
    confidenceThreshold: number;
    detectionRegions: Array<{
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
    colorThresholds: {
      green: number;
      yellow: number;
      blue: number;
      purple: number;
      pink: number;
    };
  };
  automation: {
    castDelay: number;
    reelSpeed: number;
    hookDelay: number;
    pauseBetweenCasts: number;
    maxFishingTime: number;
  };
  ui: {
    showOverlay: boolean;
    overlayOpacity: number;
    showDebugInfo: boolean;
    logLevel: 'debug' | 'info' | 'warning' | 'error';
  };
  advanced: {
    useGPUAcceleration: boolean;
    enableTelemetry: boolean;
    customScriptPath?: string;
    environmentVariables: Record<string, string>;
  };
}

export class RF4SConfigLoader {
  private logger = createRichLogger('RF4SConfigLoader');
  private rf4sConfig: RF4SSpecificConfig;

  constructor() {
    this.rf4sConfig = this.getDefaultRF4SConfig();
  }

  async loadRF4SConfiguration(): Promise<RF4SSpecificConfig> {
    try {
      // Load base integration config first
      const integrationConfig = integrationConfigManager.getConfig();
      
      // Load RF4S-specific configuration
      const storedConfig = localStorage.getItem('rf4s_specific_config');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        this.rf4sConfig = { ...this.rf4sConfig, ...parsedConfig };
      }

      // Apply integration config overrides
      if (!integrationConfig.rf4s.enabled) {
        this.rf4sConfig.ui.showOverlay = false;
      }

      this.logger.info('RF4S-specific configuration loaded');
      
      EventManager.emit('rf4s.config_loaded', {
        config: this.rf4sConfig,
        timestamp: Date.now()
      }, 'RF4SConfigLoader');

      return this.rf4sConfig;
    } catch (error) {
      this.logger.error('Failed to load RF4S configuration:', error);
      return this.getDefaultRF4SConfig();
    }
  }

  async saveRF4SConfiguration(config: Partial<RF4SSpecificConfig>): Promise<void> {
    try {
      this.rf4sConfig = { ...this.rf4sConfig, ...config };
      localStorage.setItem('rf4s_specific_config', JSON.stringify(this.rf4sConfig));
      
      this.logger.info('RF4S-specific configuration saved');
      
      EventManager.emit('rf4s.config_saved', {
        config: this.rf4sConfig,
        timestamp: Date.now()
      }, 'RF4SConfigLoader');
    } catch (error) {
      this.logger.error('Failed to save RF4S configuration:', error);
      throw error;
    }
  }

  private getDefaultRF4SConfig(): RF4SSpecificConfig {
    return {
      detection: {
        confidenceThreshold: 0.8,
        detectionRegions: [
          { name: 'bite_indicator', x: 960, y: 540, width: 100, height: 50 },
          { name: 'fish_fight', x: 800, y: 400, width: 320, height: 240 }
        ],
        colorThresholds: {
          green: 0.7,
          yellow: 0.75,
          blue: 0.8,
          purple: 0.85,
          pink: 0.9
        }
      },
      automation: {
        castDelay: 2000,
        reelSpeed: 50,
        hookDelay: 500,
        pauseBetweenCasts: 3000,
        maxFishingTime: 300000 // 5 minutes
      },
      ui: {
        showOverlay: true,
        overlayOpacity: 0.8,
        showDebugInfo: false,
        logLevel: 'info'
      },
      advanced: {
        useGPUAcceleration: true,
        enableTelemetry: true,
        environmentVariables: {}
      }
    };
  }

  getRF4SConfig(): RF4SSpecificConfig {
    return { ...this.rf4sConfig };
  }

  updateDetectionConfig(updates: Partial<RF4SSpecificConfig['detection']>): Promise<void> {
    return this.saveRF4SConfiguration({
      detection: { ...this.rf4sConfig.detection, ...updates }
    });
  }

  updateAutomationConfig(updates: Partial<RF4SSpecificConfig['automation']>): Promise<void> {
    return this.saveRF4SConfiguration({
      automation: { ...this.rf4sConfig.automation, ...updates }
    });
  }

  updateUIConfig(updates: Partial<RF4SSpecificConfig['ui']>): Promise<void> {
    return this.saveRF4SConfiguration({
      ui: { ...this.rf4sConfig.ui, ...updates }
    });
  }

  updateAdvancedConfig(updates: Partial<RF4SSpecificConfig['advanced']>): Promise<void> {
    return this.saveRF4SConfiguration({
      advanced: { ...this.rf4sConfig.advanced, ...updates }
    });
  }

  exportConfiguration(): string {
    return JSON.stringify(this.rf4sConfig, null, 2);
  }

  async importConfiguration(configData: string): Promise<void> {
    try {
      const parsedConfig = JSON.parse(configData);
      await this.saveRF4SConfiguration(parsedConfig);
      this.logger.info('RF4S configuration imported successfully');
    } catch (error) {
      this.logger.error('Failed to import RF4S configuration:', error);
      throw new Error('Invalid configuration format');
    }
  }
}

export const rf4sConfigLoader = new RF4SConfigLoader();
