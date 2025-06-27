import { RF4SYamlConfig } from '../../types/config';
import { rf4sService } from '../../rf4s/services/rf4sService';
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class RF4SWebServerImpl {
  private logger = createRichLogger('RF4SWebServer');
  private isRunning = false;
  private port = 8080;

  start(): void {
    if (this.isRunning) {
      this.logger.warning('Web server already running');
      return;
    }

    this.isRunning = true;
    this.logger.info(`RF4S Web Server started on port ${this.port}`);
    
    EventManager.emit('rf4s.web_server.started', { port: this.port }, 'RF4SWebServer');
  }

  stop(): void {
    if (!this.isRunning) {
      this.logger.warning('Web server not running');
      return;
    }

    this.isRunning = false;
    this.logger.info('RF4S Web Server stopped');
    
    EventManager.emit('rf4s.web_server.stopped', {}, 'RF4SWebServer');
  }

  // API Endpoints
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

  async saveConfig(config: RF4SYamlConfig): Promise<APIResponse> {
    try {
      // Validate configuration first
      const validationResponse = await this.validateConfig(config);
      
      if (!validationResponse.success || !validationResponse.data?.isValid) {
        const errors = validationResponse.data?.errors || ['Validation failed'];
        return {
          success: false,
          error: `Configuration validation failed: ${errors.join(', ')}`,
          timestamp: Date.now()
        };
      }

      // Convert and save configuration
      this.updateRF4SConfig(config);
      
      this.logger.info('Configuration saved successfully');
      EventManager.emit('rf4s.config.saved', { config }, 'RF4SWebServer');

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

  async getProfiles(): Promise<APIResponse<any[]>> {
    try {
      const config = rf4sService.getConfig();
      const profiles = Object.keys(config).filter(key => key.startsWith('profile_')).map(key => ({
        id: key,
        name: key.replace('profile_', ''),
        data: config[key as keyof typeof config]
      }));

      return {
        success: true,
        data: profiles,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
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

  isServerRunning(): boolean {
    return this.isRunning;
  }

  getPort(): number {
    return this.port;
  }
}

export const RF4SWebServer = new RF4SWebServerImpl();
