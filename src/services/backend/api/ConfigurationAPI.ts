
import { RF4SYamlConfig } from '../../../types/config';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfigurationAPI {
  private logger = createRichLogger('ConfigurationAPI');

  async getConfig(): Promise<{ success: boolean; data?: RF4SYamlConfig; errors: string[] }> {
    this.logger.info('ConfigurationAPI: Getting configuration...');
    
    try {
      // Simulate loading configuration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const config: RF4SYamlConfig = {
        detection: {
          spoolConfidence: 0.8,
          imageVerification: true,
          snagDetection: true
        },
        automation: {
          castDelayMin: 2,
          castDelayMax: 4,
          autoRecast: true
        },
        general: {
          logLevel: 'info',
          enableMetrics: true
        }
      };
      
      return { success: true, data: config, errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to get configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async saveConfig(config: RF4SYamlConfig): Promise<{ success: boolean; errors: string[] }> {
    this.logger.info('ConfigurationAPI: Saving configuration...');
    
    try {
      // Validate configuration first
      const validation = this.validateConfig(config);
      if (!validation.success) {
        return validation;
      }
      
      // Simulate saving configuration
      await new Promise(resolve => setTimeout(resolve, 200));
      
      this.logger.info('Configuration saved successfully');
      return { success: true, errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to save configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  validateConfig(config: RF4SYamlConfig): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config) {
      errors.push('Configuration is required');
      return { success: false, errors };
    }
    
    // Validate detection settings
    if (config.detection) {
      if (typeof config.detection.spoolConfidence !== 'number' || 
          config.detection.spoolConfidence < 0 || 
          config.detection.spoolConfidence > 1) {
        errors.push('Spool confidence must be a number between 0 and 1');
      }
    }
    
    // Validate automation settings
    if (config.automation) {
      if (typeof config.automation.castDelayMin !== 'number' || config.automation.castDelayMin < 0) {
        errors.push('Cast delay minimum must be a positive number');
      }
      
      if (typeof config.automation.castDelayMax !== 'number' || config.automation.castDelayMax < 0) {
        errors.push('Cast delay maximum must be a positive number');
      }
      
      if (config.automation.castDelayMin > config.automation.castDelayMax) {
        errors.push('Cast delay minimum cannot be greater than maximum');
      }
    }
    
    return { success: errors.length === 0, errors };
  }
}
