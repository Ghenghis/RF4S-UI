
import { RF4SConfigBridge } from '../RF4SConfigBridge';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfigurationAPI {
  private logger = createRichLogger('ConfigurationAPI');

  async loadConfiguration(): Promise<any> {
    try {
      const result = RF4SConfigBridge.loadConfigToDict();
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async saveConfiguration(config: any): Promise<any> {
    try {
      const result = RF4SConfigBridge.saveDictToConfig(config);
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async validateConfiguration(config: any): Promise<any> {
    try {
      const validation = RF4SConfigBridge.validateConfigData(config);
      return {
        success: true,
        data: validation,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to validate configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }

  async resetConfiguration(): Promise<any> {
    try {
      // Load default configuration
      const result = RF4SConfigBridge.loadConfigToDict();
      return {
        success: result.success,
        data: result.data,
        errors: result.errors,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to reset configuration:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: Date.now()
      };
    }
  }
}
