
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
        VERSION: '1.0.0',
        SCRIPT: {
          LANGUAGE: 'python',
          LAUNCH_OPTIONS: '',
          SMTP_VERIFICATION: false,
          IMAGE_VERIFICATION: true,
          SNAG_DETECTION: true,
          SPOOLING_DETECTION: true,
          RANDOM_ROD_SELECTION: false,
          SPOOL_CONFIDENCE: 0.8,
          SPOD_ROD_RECAST_DELAY: 2,
          LURE_CHANGE_DELAY: 1,
          ALARM_SOUND: 'default',
          RANDOM_CAST_PROBABILITY: 0.1,
          SCREENSHOT_TAGS: []
        },
        KEY: {
          TEA: 1,
          CARROT: 2,
          BOTTOM_RODS: [3, 4, 5],
          COFFEE: 6,
          DIGGING_TOOL: 7,
          ALCOHOL: 8,
          MAIN_ROD: 9,
          SPOD_ROD: 10,
          QUIT: 'q'
        },
        STAT: {
          ENERGY_THRESHOLD: 20,
          HUNGER_THRESHOLD: 20,
          COMFORT_THRESHOLD: 20,
          TEA_DELAY: 5,
          COFFEE_LIMIT: 10,
          COFFEE_PER_DRINK: 1,
          ALCOHOL_DELAY: 10,
          ALCOHOL_PER_DRINK: 1
        },
        FRICTION_BRAKE: {
          INITIAL: 50,
          MAX: 100,
          START_DELAY: 1,
          INCREASE_DELAY: 1,
          SENSITIVITY: 'medium'
        },
        KEEPNET: {
          CAPACITY: 50,
          FISH_DELAY: 2,
          GIFT_DELAY: 5,
          FULL_ACTION: 'release',
          WHITELIST: [],
          BLACKLIST: [],
          TAGS: []
        },
        NOTIFICATION: {
          EMAIL: '',
          PASSWORD: '',
          SMTP_SERVER: '',
          MIAO_CODE: '',
          DISCORD_WEBHOOK_URL: ''
        },
        PAUSE: {
          DELAY: 30,
          DURATION: 5
        },
        PROFILE: {}
      };
      
      return { success: true, data: config, errors: [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to get configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async loadConfiguration(): Promise<{ success: boolean; data?: RF4SYamlConfig; errors: string[] }> {
    return this.getConfig();
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

  async saveConfiguration(config: RF4SYamlConfig): Promise<{ success: boolean; errors: string[] }> {
    return this.saveConfig(config);
  }

  async validateConfiguration(config: RF4SYamlConfig): Promise<{ success: boolean; errors: string[] }> {
    return this.validateConfig(config);
  }

  async resetConfiguration(): Promise<{ success: boolean; data?: RF4SYamlConfig; errors: string[] }> {
    this.logger.info('ConfigurationAPI: Resetting configuration to defaults...');
    
    try {
      // Return default configuration
      const defaultConfig = await this.getConfig();
      return defaultConfig;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to reset configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  validateConfig(config: RF4SYamlConfig): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config) {
      errors.push('Configuration is required');
      return { success: false, errors };
    }
    
    // Validate SCRIPT settings
    if (config.SCRIPT) {
      if (typeof config.SCRIPT.SPOOL_CONFIDENCE !== 'number' || 
          config.SCRIPT.SPOOL_CONFIDENCE < 0 || 
          config.SCRIPT.SPOOL_CONFIDENCE > 1) {
        errors.push('Spool confidence must be a number between 0 and 1');
      }
    }
    
    // Validate FRICTION_BRAKE settings
    if (config.FRICTION_BRAKE) {
      if (typeof config.FRICTION_BRAKE.INITIAL !== 'number' || config.FRICTION_BRAKE.INITIAL < 0) {
        errors.push('Friction brake initial must be a positive number');
      }
      
      if (typeof config.FRICTION_BRAKE.MAX !== 'number' || config.FRICTION_BRAKE.MAX < 0) {
        errors.push('Friction brake max must be a positive number');
      }
      
      if (config.FRICTION_BRAKE.INITIAL > config.FRICTION_BRAKE.MAX) {
        errors.push('Friction brake initial cannot be greater than maximum');
      }
    }
    
    return { success: errors.length === 0, errors };
  }
}
