
import { EventManager } from '../../core/EventManager';
import { ServiceRegistry } from '../../core/ServiceRegistry';
import { createRichLogger } from '../../rf4s/utils';
import { RF4SYamlConfig } from '../../types/config';

export class ConfigurationManagementService {
  private logger = createRichLogger('ConfigurationManagementService');
  private currentConfig: RF4SYamlConfig | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.logger.info('ConfigurationManagementService: Initializing...');

    try {
      // Register with ServiceRegistry
      ServiceRegistry.register('ConfigurationManagementService', this, ['EventManager'], {
        type: 'configuration',
        priority: 'high'
      });

      // Load current configuration
      await this.loadConfiguration();

      this.isInitialized = true;
      ServiceRegistry.updateStatus('ConfigurationManagementService', 'running');

      this.logger.info('ConfigurationManagementService: Successfully initialized');

      EventManager.emit('config.service_initialized', {
        timestamp: Date.now()
      }, 'ConfigurationManagementService');

    } catch (error) {
      ServiceRegistry.updateStatus('ConfigurationManagementService', 'error');
      this.logger.error('ConfigurationManagementService: Initialization failed:', error);
      throw error;
    }
  }

  async loadConfiguration(): Promise<{ success: boolean; data?: RF4SYamlConfig; errors: string[] }> {
    try {
      const savedConfig = localStorage.getItem('rf4s_current_config');
      
      if (savedConfig) {
        this.currentConfig = JSON.parse(savedConfig);
        
        EventManager.emit('config.loaded', {
          config: this.currentConfig,
          timestamp: Date.now()
        }, 'ConfigurationManagementService');

        return {
          success: true,
          data: this.currentConfig,
          errors: []
        };
      }

      // Load default configuration if none exists
      this.currentConfig = this.createDefaultConfiguration();
      await this.saveConfiguration(this.currentConfig);

      return {
        success: true,
        data: this.currentConfig,
        errors: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to load configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  async saveConfiguration(config: RF4SYamlConfig): Promise<{ success: boolean; errors: string[] }> {
    try {
      // Validate configuration before saving
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      localStorage.setItem('rf4s_current_config', JSON.stringify(config));
      this.currentConfig = config;

      EventManager.emit('config.saved', {
        config,
        timestamp: Date.now()
      }, 'ConfigurationManagementService');

      this.logger.info('Configuration saved successfully');
      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to save configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  updateConfiguration(path: string, value: any): { success: boolean; errors: string[] } {
    if (!this.currentConfig) {
      return { success: false, errors: ['No configuration loaded'] };
    }

    try {
      const pathArray = path.split('.');
      let current: any = this.currentConfig;
      
      // Navigate to the parent object
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
          current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
      }
      
      // Set the value
      current[pathArray[pathArray.length - 1]] = value;

      EventManager.emit('config.updated', {
        path,
        value,
        config: this.currentConfig,
        timestamp: Date.now()
      }, 'ConfigurationManagementService');

      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to update configuration:', error);
      return { success: false, errors: [errorMessage] };
    }
  }

  getConfiguration(): RF4SYamlConfig | null {
    return this.currentConfig ? { ...this.currentConfig } : null;
  }

  resetConfiguration(): { success: boolean; errors: string[] } {
    try {
      this.currentConfig = this.createDefaultConfiguration();
      localStorage.setItem('rf4s_current_config', JSON.stringify(this.currentConfig));

      EventManager.emit('config.reset', {
        config: this.currentConfig,
        timestamp: Date.now()
      }, 'ConfigurationManagementService');

      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, errors: [errorMessage] };
    }
  }

  private validateConfiguration(config: RF4SYamlConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.VERSION) {
      errors.push('Configuration version is required');
    }

    if (!config.SCRIPT) {
      errors.push('Script section is required');
    }

    if (!config.KEY) {
      errors.push('Key bindings section is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private createDefaultConfiguration(): RF4SYamlConfig {
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: true,
        IMAGE_VERIFICATION: true,
        SNAG_DETECTION: true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: true,
        SPOOL_CONFIDENCE: 0.97,
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
      PROFILE: {
        SPIN: {
          MODE: "spin",
          LAUNCH_OPTIONS: "",
          CAST_POWER_LEVEL: 5.0,
          CAST_DELAY: 6.0,
          TIGHTEN_DURATION: 1.0,
          RETRIEVAL_DURATION: 1.0,
          RETRIEVAL_DELAY: 3.8,
          RETRIEVAL_TIMEOUT: 256.0,
          PRE_ACCELERATION: false,
          POST_ACCELERATION: "off",
          CTRL: false,
          SHIFT: false,
          TYPE: "normal"
        },
        BOTTOM: {
          MODE: "bottom",
          LAUNCH_OPTIONS: "",
          CAST_POWER_LEVEL: 5.0,
          CAST_DELAY: 4.0,
          POST_ACCELERATION: "off",
          CHECK_DELAY: 32.0,
          CHECK_MISS_LIMIT: 16,
          PUT_DOWN_DELAY: 0.0
        },
        TELESCOPIC: {
          MODE: "telescopic",
          LAUNCH_OPTIONS: "",
          CAST_POWER_LEVEL: 5.0,
          CAST_DELAY: 4.0,
          FLOAT_SENSITIVITY: 0.68,
          CHECK_DELAY: 1.0,
          PULL_DELAY: 0.5,
          DRIFT_TIMEOUT: 16.0,
          CAMERA_SHAPE: "square"
        }
      }
    };
  }

  isHealthy(): boolean {
    return this.isInitialized && this.currentConfig !== null;
  }

  destroy(): void {
    this.isInitialized = false;
    this.currentConfig = null;
    ServiceRegistry.updateStatus('ConfigurationManagementService', 'stopped');
    this.logger.info('ConfigurationManagementService: Destroyed');
  }
}

export const configurationManagementService = new ConfigurationManagementService();
