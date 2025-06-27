import { RF4SYamlConfig } from '../../types/config';
import { rf4sService } from '../../rf4s/services/rf4sService';
import { createRichLogger } from '../../rf4s/utils';
import { RF4SConfigDefaults } from '../../rf4s/config/defaults';

export interface ConfigConversionResult {
  success: boolean;
  data?: any;
  errors: string[];
}

export interface ConfigValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidValues: string[];
  warnings: string[];
}

class RF4SConfigBridgeImpl {
  private logger = createRichLogger('RF4SConfigBridge');

  loadConfigToDict(): ConfigConversionResult {
    try {
      const rf4sConfig = rf4sService.getConfig();
      const yamlConfig = this.convertRF4SToYaml(rf4sConfig);
      
      return {
        success: true,
        data: yamlConfig,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to load config to dict:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  saveDictToConfig(yamlConfig: RF4SYamlConfig): ConfigConversionResult {
    try {
      // Validate the configuration first
      const validation = this.validateConfigData(yamlConfig);
      if (!validation.isValid) {
        return {
          success: false,
          errors: [...validation.missingFields, ...validation.invalidValues]
        };
      }

      // Convert YAML config to RF4S format and save
      const rf4sConfig = this.convertYamlToRF4S(yamlConfig);
      this.applyConfigToRF4S(rf4sConfig);
      
      this.logger.info('Configuration successfully saved to RF4S');
      return {
        success: true,
        data: { message: 'Configuration saved successfully' },
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to save dict to config:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  validateConfigData(yamlConfig: RF4SYamlConfig): ConfigValidationResult {
    const missingFields: string[] = [];
    const invalidValues: string[] = [];
    const warnings: string[] = [];

    // Check required top-level sections
    if (!yamlConfig.VERSION) missingFields.push('VERSION');
    if (!yamlConfig.SCRIPT) missingFields.push('SCRIPT');
    if (!yamlConfig.KEY) missingFields.push('KEY');
    if (!yamlConfig.FRICTION_BRAKE) missingFields.push('FRICTION_BRAKE');

    // Validate SCRIPT section
    if (yamlConfig.SCRIPT) {
      if (typeof yamlConfig.SCRIPT.SPOOL_CONFIDENCE !== 'number') {
        missingFields.push('SCRIPT.SPOOL_CONFIDENCE');
      } else if (yamlConfig.SCRIPT.SPOOL_CONFIDENCE < 0.1 || yamlConfig.SCRIPT.SPOOL_CONFIDENCE > 1.0) {
        invalidValues.push('SCRIPT.SPOOL_CONFIDENCE must be between 0.1 and 1.0');
      } else if (yamlConfig.SCRIPT.SPOOL_CONFIDENCE < 0.95) {
        warnings.push('SCRIPT.SPOOL_CONFIDENCE below 0.95 may result in missed detections');
      }

      if (typeof yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY !== 'number') {
        missingFields.push('SCRIPT.RANDOM_CAST_PROBABILITY');
      } else if (yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY < 0 || yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY > 1) {
        invalidValues.push('SCRIPT.RANDOM_CAST_PROBABILITY must be between 0 and 1');
      }
    }

    // Validate FRICTION_BRAKE section
    if (yamlConfig.FRICTION_BRAKE) {
      if (typeof yamlConfig.FRICTION_BRAKE.INITIAL !== 'number') {
        missingFields.push('FRICTION_BRAKE.INITIAL');
      } else if (yamlConfig.FRICTION_BRAKE.INITIAL < 1 || yamlConfig.FRICTION_BRAKE.INITIAL > 100) {
        invalidValues.push('FRICTION_BRAKE.INITIAL must be between 1 and 100');
      }

      if (typeof yamlConfig.FRICTION_BRAKE.MAX !== 'number') {
        missingFields.push('FRICTION_BRAKE.MAX');
      } else if (yamlConfig.FRICTION_BRAKE.MAX < yamlConfig.FRICTION_BRAKE.INITIAL) {
        invalidValues.push('FRICTION_BRAKE.MAX must be greater than or equal to INITIAL');
      }
    }

    // Validate KEEPNET section
    if (yamlConfig.KEEPNET) {
      if (typeof yamlConfig.KEEPNET.CAPACITY !== 'number') {
        missingFields.push('KEEPNET.CAPACITY');
      } else if (yamlConfig.KEEPNET.CAPACITY < 1) {
        invalidValues.push('KEEPNET.CAPACITY must be greater than 0');
      }

      const validActions = ['quit', 'alarm', 'continue'];
      if (!validActions.includes(yamlConfig.KEEPNET.FULL_ACTION)) {
        invalidValues.push(`KEEPNET.FULL_ACTION must be one of: ${validActions.join(', ')}`);
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidValues.length === 0,
      missingFields,
      invalidValues,
      warnings
    };
  }

  private convertRF4SToYaml(rf4sConfig: any): RF4SYamlConfig {
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: rf4sConfig.script?.enabled || false,
        IMAGE_VERIFICATION: rf4sConfig.detection?.imageVerification || true,
        SNAG_DETECTION: rf4sConfig.detection?.snagDetection || true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: rf4sConfig.script?.randomCast || false,
        SPOOL_CONFIDENCE: rf4sConfig.detection?.spoolConfidence || 0.98,
        SPOD_ROD_RECAST_DELAY: 1800,
        LURE_CHANGE_DELAY: 1800,
        ALARM_SOUND: rf4sConfig.script?.alarmSound || "./static/sound/guitar.wav",
        RANDOM_CAST_PROBABILITY: rf4sConfig.script?.randomCastProbability || 0.25,
        SCREENSHOT_TAGS: rf4sConfig.script?.screenshotTags || ["green", "yellow", "blue", "purple", "pink"]
      },
      KEY: {
        TEA: -1,
        CARROT: -1,
        BOTTOM_RODS: rf4sConfig.key?.bottomRods || [1, 2, 3],
        COFFEE: 4,
        DIGGING_TOOL: 5,
        ALCOHOL: 6,
        MAIN_ROD: 1,
        SPOD_ROD: 7,
        QUIT: rf4sConfig.key?.quit || "CTRL-C"
      },
      STAT: {
        ENERGY_THRESHOLD: 0.74,
        HUNGER_THRESHOLD: 0.5,
        COMFORT_THRESHOLD: 0.51,
        TEA_DELAY: 300,
        COFFEE_LIMIT: rf4sConfig.stat?.coffeeLimit || 20,
        COFFEE_PER_DRINK: rf4sConfig.stat?.coffeePerDrink || 1,
        ALCOHOL_DELAY: 900,
        ALCOHOL_PER_DRINK: rf4sConfig.stat?.alcoholPerDrink || 1
      },
      FRICTION_BRAKE: {
        INITIAL: rf4sConfig.frictionBrake?.initial || 29,
        MAX: 30,
        START_DELAY: 2.0,
        INCREASE_DELAY: 1.0,
        SENSITIVITY: "medium"
      },
      KEEPNET: {
        CAPACITY: rf4sConfig.keepnet?.capacity || 100,
        FISH_DELAY: rf4sConfig.keepnet?.fishDelay || 0.0,
        GIFT_DELAY: rf4sConfig.keepnet?.giftDelay || 4.0,
        FULL_ACTION: rf4sConfig.keepnet?.fullAction || "quit",
        WHITELIST: ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
        BLACKLIST: [],
        TAGS: rf4sConfig.keepnet?.tags || ["green", "yellow", "blue", "purple", "pink"]
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
        DURATION: rf4sConfig.pause?.duration || 600
      },
      PROFILE: {}
    };
  }

  private convertYamlToRF4S(yamlConfig: RF4SYamlConfig): any {
    return {
      script: {
        enabled: yamlConfig.SCRIPT.SMTP_VERIFICATION,
        randomCast: yamlConfig.SCRIPT.RANDOM_ROD_SELECTION,
        randomCastProbability: yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY,
        alarmSound: yamlConfig.SCRIPT.ALARM_SOUND,
        screenshotTags: yamlConfig.SCRIPT.SCREENSHOT_TAGS
      },
      detection: {
        spoolConfidence: yamlConfig.SCRIPT.SPOOL_CONFIDENCE,
        imageVerification: yamlConfig.SCRIPT.IMAGE_VERIFICATION,
        snagDetection: yamlConfig.SCRIPT.SNAG_DETECTION
      },
      automation: {
        castDelayMin: yamlConfig.PAUSE.DELAY / 1000,
        castDelayMax: (yamlConfig.PAUSE.DELAY + yamlConfig.PAUSE.DURATION) / 1000
      },
      key: {
        bottomRods: yamlConfig.KEY.BOTTOM_RODS,
        quit: yamlConfig.KEY.QUIT
      },
      stat: {
        coffeeLimit: yamlConfig.STAT.COFFEE_LIMIT,
        coffeePerDrink: yamlConfig.STAT.COFFEE_PER_DRINK,
        alcoholPerDrink: yamlConfig.STAT.ALCOHOL_PER_DRINK
      },
      frictionBrake: {
        initial: yamlConfig.FRICTION_BRAKE.INITIAL
      },
      keepnet: {
        capacity: yamlConfig.KEEPNET.CAPACITY,
        fishDelay: yamlConfig.KEEPNET.FISH_DELAY,
        giftDelay: yamlConfig.KEEPNET.GIFT_DELAY,
        fullAction: yamlConfig.KEEPNET.FULL_ACTION,
        tags: yamlConfig.KEEPNET.TAGS
      },
      pause: {
        duration: yamlConfig.PAUSE.DURATION
      }
    };
  }

  private applyConfigToRF4S(rf4sConfig: any): void {
    // Apply configuration sections to RF4S service with proper typing
    const validSections: (keyof RF4SConfigDefaults)[] = ['script', 'detection', 'automation', 'equipment', 'system'];
    
    Object.keys(rf4sConfig).forEach(section => {
      const typedSection = section as keyof RF4SConfigDefaults;
      if (validSections.includes(typedSection)) {
        rf4sService.updateConfig(typedSection, rf4sConfig[section]);
      }
    });
  }

  createBackup(description: string = 'Auto backup'): ConfigConversionResult {
    try {
      const currentConfig = this.loadConfigToDict();
      if (!currentConfig.success) {
        return currentConfig;
      }

      // Store backup in localStorage for now
      const backupId = `backup_${Date.now()}`;
      const backup = {
        id: backupId,
        description,
        timestamp: new Date().toISOString(),
        config: currentConfig.data
      };

      const existingBackups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      existingBackups.unshift(backup);
      
      // Keep only last 10 backups
      const trimmedBackups = existingBackups.slice(0, 10);
      localStorage.setItem('rf4s_config_backups', JSON.stringify(trimmedBackups));

      this.logger.info(`Configuration backup created: ${description}`);
      return {
        success: true,
        data: { backupId, description },
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to create backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  restoreBackup(backupId: string): ConfigConversionResult {
    try {
      const backups = JSON.parse(localStorage.getItem('rf4s_config_backups') || '[]');
      const backup = backups.find((b: any) => b.id === backupId);
      
      if (!backup) {
        return {
          success: false,
          errors: [`Backup not found: ${backupId}`]
        };
      }

      const restoreResult = this.saveDictToConfig(backup.config);
      if (restoreResult.success) {
        this.logger.info(`Configuration restored from backup: ${backup.description}`);
      }
      
      return restoreResult;
    } catch (error) {
      this.logger.error('Failed to restore backup:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export const RF4SConfigBridge = new RF4SConfigBridgeImpl();
