import { RF4SYamlConfig } from '../../../types/config';
import { rf4sService } from '../../../rf4s/services/rf4sService';
import { createRichLogger } from '../../../rf4s/utils';
import { APIResponse, ValidationResult } from '../types';

export class ConfigurationAPI {
  private logger = createRichLogger('ConfigurationAPI');

  async getConfig(): Promise<APIResponse<RF4SYamlConfig>> {
    try {
      const config = rf4sService.getConfig();
      
      return {
        success: true,
        data: this.convertToYamlConfig(config),
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
      const validationResponse = await this.validateConfig(config);
      
      if (!validationResponse.success || !validationResponse.data?.isValid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validationResponse.data?.errors.join(', ') || 'Unknown validation error'}`,
          timestamp: Date.now()
        };
      }

      // Convert and save configuration
      this.updateRF4SConfig(config);
      
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
    try {
      const validation = this.validateConfigData(config);
      
      return {
        success: true,
        data: validation,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to validate config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async validateConfiguration(config: RF4SYamlConfig): Promise<APIResponse<ValidationResult>> {
    return this.validateConfig(config);
  }

  async resetConfiguration(): Promise<APIResponse> {
    try {
      // Reset to default configuration
      const defaultConfig = this.getDefaultConfig();
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

  private validateConfigData(config: RF4SYamlConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.VERSION) {
      errors.push('VERSION is required');
    }

    if (!config.SCRIPT) {
      errors.push('SCRIPT section is required');
    } else {
      if (config.SCRIPT.SPOOL_CONFIDENCE < 0.1 || config.SCRIPT.SPOOL_CONFIDENCE > 1.0) {
        errors.push('SPOOL_CONFIDENCE must be between 0.1 and 1.0');
      }
      if (config.SCRIPT.SPOOL_CONFIDENCE < 0.95) {
        warnings.push('SPOOL_CONFIDENCE below 0.95 may result in missed detections');
      }
    }

    if (!config.KEY) {
      errors.push('KEY section is required');
    }

    if (!config.FRICTION_BRAKE) {
      errors.push('FRICTION_BRAKE section is required');
    } else {
      if (config.FRICTION_BRAKE.INITIAL < 1 || config.FRICTION_BRAKE.INITIAL > 100) {
        errors.push('FRICTION_BRAKE.INITIAL must be between 1 and 100');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private getDefaultConfig(): RF4SYamlConfig {
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: false,
        IMAGE_VERIFICATION: true,
        SNAG_DETECTION: true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: false,
        SPOOL_CONFIDENCE: 0.98,
        SPOD_ROD_RECAST_DELAY: 1800,
        LURE_CHANGE_DELAY: 1800,
        ALARM_SOUND: "./static/sound/guitar.wav",
        RANDOM_CAST_PROBABILITY: 0.25,
        SCREENSHOT_TAGS: ["green", "yellow", "blue", "purple", "pink"]
      },
      KEY: {
        TEA: -1,
        CARROT: -1,
        BOTTOM_RODS: [1, 2, 3],
        COFFEE: 4,
        DIGGING_TOOL: 5,
        ALCOHOL: 6,
        MAIN_ROD: 1,
        SPOD_ROD: 7,
        QUIT: "CTRL-C"
      },
      STAT: {
        ENERGY_THRESHOLD: 0.74,
        HUNGER_THRESHOLD: 0.5,
        COMFORT_THRESHOLD: 0.51,
        TEA_DELAY: 300,
        COFFEE_LIMIT: 20,
        COFFEE_PER_DRINK: 1,
        ALCOHOL_DELAY: 900,
        ALCOHOL_PER_DRINK: 1
      },
      FRICTION_BRAKE: {
        INITIAL: 29,
        MAX: 30,
        START_DELAY: 2.0,
        INCREASE_DELAY: 1.0,
        SENSITIVITY: "medium"
      },
      KEEPNET: {
        CAPACITY: 100,
        FISH_DELAY: 0.0,
        GIFT_DELAY: 4.0,
        FULL_ACTION: "quit",
        WHITELIST: ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
        BLACKLIST: [],
        TAGS: ["green", "yellow", "blue", "purple", "pink"]
      },
      NOTIFICATION: {
        EMAIL: "email@example.com",
        PASSWORD: "password",
        SMTP_SERVER: "smtp.gmail.com",
        MIAO_CODE: "example",
        DISCORD_WEBHOOK_URL: ""
      },
      PAUSE: {
        DELAY: 1800,
        DURATION: 600
      },
      PROFILE: {}
    };
  }

  private convertToYamlConfig(config: any): RF4SYamlConfig {
    // Convert RF4S service config to YAML format
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: config.script?.enabled || false,
        IMAGE_VERIFICATION: config.detection?.imageVerification || true,
        SNAG_DETECTION: config.detection?.snagDetection || true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: config.script?.randomCast || false,
        SPOOL_CONFIDENCE: config.detection?.spoolConfidence || 0.98,
        SPOD_ROD_RECAST_DELAY: 1800,
        LURE_CHANGE_DELAY: 1800,
        ALARM_SOUND: config.script?.alarmSound || "./static/sound/guitar.wav",
        RANDOM_CAST_PROBABILITY: config.script?.randomCastProbability || 0.25,
        SCREENSHOT_TAGS: config.script?.screenshotTags || ["green", "yellow", "blue", "purple", "pink"]
      },
      KEY: {
        TEA: -1,
        CARROT: -1,
        BOTTOM_RODS: config.key?.bottomRods || [1, 2, 3],
        COFFEE: 4,
        DIGGING_TOOL: 5,
        ALCOHOL: 6,
        MAIN_ROD: 1,
        SPOD_ROD: 7,
        QUIT: config.key?.quit || "CTRL-C"
      },
      STAT: {
        ENERGY_THRESHOLD: 0.74,
        HUNGER_THRESHOLD: 0.5,
        COMFORT_THRESHOLD: 0.51,
        TEA_DELAY: 300,
        COFFEE_LIMIT: config.stat?.coffeeLimit || 20,
        COFFEE_PER_DRINK: config.stat?.coffeePerDrink || 1,
        ALCOHOL_DELAY: 900,
        ALCOHOL_PER_DRINK: config.stat?.alcoholPerDrink || 1
      },
      FRICTION_BRAKE: {
        INITIAL: config.frictionBrake?.initial || 29,
        MAX: 30,
        START_DELAY: 2.0,
        INCREASE_DELAY: 1.0,
        SENSITIVITY: "medium"
      },
      KEEPNET: {
        CAPACITY: config.keepnet?.capacity || 100,
        FISH_DELAY: config.keepnet?.fishDelay || 0.0,
        GIFT_DELAY: config.keepnet?.giftDelay || 4.0,
        FULL_ACTION: config.keepnet?.fullAction || "quit",
        WHITELIST: config.keepnet?.tags || ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
        BLACKLIST: [],
        TAGS: config.keepnet?.tags || ["green", "yellow", "blue", "purple", "pink"]
      },
      NOTIFICATION: {
        EMAIL: "email@example.com",
        PASSWORD: "password",
        SMTP_SERVER: "smtp.gmail.com",
        MIAO_CODE: "example",
        DISCORD_WEBHOOK_URL: ""
      },
      PAUSE: {
        DELAY: 1800,
        DURATION: config.pause?.duration || 600
      },
      PROFILE: {}
    };
  }

  private updateRF4SConfig(yamlConfig: RF4SYamlConfig): void {
    // Update RF4S service configuration
    rf4sService.updateConfig('script', {
      enabled: yamlConfig.SCRIPT.SMTP_VERIFICATION,
      randomCast: yamlConfig.SCRIPT.RANDOM_ROD_SELECTION,
      randomCastProbability: yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY,
      alarmSound: yamlConfig.SCRIPT.ALARM_SOUND,
      screenshotTags: yamlConfig.SCRIPT.SCREENSHOT_TAGS
    });

    rf4sService.updateConfig('detection', {
      spoolConfidence: yamlConfig.SCRIPT.SPOOL_CONFIDENCE,
      imageVerification: yamlConfig.SCRIPT.IMAGE_VERIFICATION,
      snagDetection: yamlConfig.SCRIPT.SNAG_DETECTION
    });

    rf4sService.updateConfig('automation', {
      castDelayMin: yamlConfig.PAUSE.DELAY / 1000,
      castDelayMax: (yamlConfig.PAUSE.DELAY + yamlConfig.PAUSE.DURATION) / 1000
    });
  }
}
