
import { RF4SYamlConfig } from '../../../types/config';
import { rf4sService } from '../../../rf4s/services/rf4sService';
import { createRichLogger } from '../../../rf4s/utils';
import { APIResponse, ValidationResult } from '../types';
import { ConfigurationValidator } from './ConfigurationValidator';
import { ConfigurationConverter } from './ConfigurationConverter';
import { DefaultConfigurationProvider } from './DefaultConfigurationProvider';

export class ConfigurationAPI {
  private logger = createRichLogger('ConfigurationAPI');
  private validator = new ConfigurationValidator();
  private converter = new ConfigurationConverter();
  private defaultProvider = new DefaultConfigurationProvider();

  async getConfig(): Promise<APIResponse<RF4SYamlConfig>> {
    try {
      const config = rf4sService.getConfig();
      
      return {
        success: true,
        data: this.converter.convertToYamlConfig(config),
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async loadConfiguration(): Promise<APIResponse<RF4SYamlConfig>> {
    return this.getConfig();
  }

  async saveConfig(config: RF4SYamlConfig): Promise<APIResponse> {
    try {
      // Validate configuration first
      const validationResponse = await this.validator.validateConfig(config);
      
      if (!validationResponse.success || !validationResponse.data?.isValid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validationResponse.data?.errors.join(', ') || 'Unknown validation error'}`,
          timestamp: Date.now()
        };
      }

      // Convert and save configuration
      this.converter.updateRF4SConfig(config);
      
      this.logger.info('Configuration saved successfully');

      return {
        success: true,
        data: { message: 'Configuration saved successfully' },
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to save config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async saveConfiguration(config: RF4SYamlConfig): Promise<APIResponse> {
    return this.saveConfig(config);
  }

  async validateConfig(config: RF4SYamlConfig): Promise<APIResponse<ValidationResult>> {
    return this.validator.validateConfig(config);
  }

  async validateConfiguration(config: RF4SYamlConfig): Promise<APIResponse<ValidationResult>> {
    return this.validateConfig(config);
  }

  async resetConfiguration(): Promise<APIResponse> {
    try {
      // Reset to default configuration
      const defaultConfig = this.defaultProvider.getDefaultConfig();
      return this.saveConfig(defaultConfig);
    } catch (error) {
      this.logger.error('Failed to reset configuration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }
}
