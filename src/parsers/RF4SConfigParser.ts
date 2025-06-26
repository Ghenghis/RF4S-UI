import { RF4SYamlConfig } from '../types/config';
import { useConfigurationStore } from '../store/ConfigurationStore';

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

export interface RF4SConfigValidation {
  isValid: boolean;
  missingFields: string[];
  invalidValues: string[];
  recommendations: string[];
}

class RF4SConfigParserImpl {
  private readonly requiredFields = [
    'VERSION',
    'SCRIPT',
    'KEY',
    'STAT',
    'FRICTION_BRAKE',
    'KEEPNET',
    'PROFILE'
  ];

  parseYamlConfig(yamlString: string): ParseResult<RF4SYamlConfig> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Simple YAML-like parsing (in real implementation, use a YAML library)
      const config = this.parseYamlString(yamlString);
      
      const validation = this.validateConfig(config);
      
      if (!validation.isValid) {
        errors.push(...validation.missingFields);
        errors.push(...validation.invalidValues);
      }
      
      warnings.push(...validation.recommendations);

      return {
        success: validation.isValid,
        data: validation.isValid ? config : undefined,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Failed to parse YAML: ${error}`);
      return { success: false, errors, warnings };
    }
  }

  validateConfig(config: any): RF4SConfigValidation {
    const missingFields: string[] = [];
    const invalidValues: string[] = [];
    const recommendations: string[] = [];

    // Check required fields
    this.requiredFields.forEach(field => {
      if (!config[field]) {
        missingFields.push(`Missing required field: ${field}`);
      }
    });

    // Validate SCRIPT section
    if (config.SCRIPT) {
      if (typeof config.SCRIPT.SPOOL_CONFIDENCE !== 'number' || 
          config.SCRIPT.SPOOL_CONFIDENCE < 0 || 
          config.SCRIPT.SPOOL_CONFIDENCE > 1) {
        invalidValues.push('SCRIPT.SPOOL_CONFIDENCE must be between 0 and 1');
      }

      if (config.SCRIPT.SPOOL_CONFIDENCE < 0.8) {
        recommendations.push('SPOOL_CONFIDENCE below 0.8 may cause false positives');
      }

      if (config.SCRIPT.RANDOM_CAST_PROBABILITY < 0 || config.SCRIPT.RANDOM_CAST_PROBABILITY > 1) {
        invalidValues.push('SCRIPT.RANDOM_CAST_PROBABILITY must be between 0 and 1');
      }
    }

    // Validate KEEPNET section
    if (config.KEEPNET) {
      if (typeof config.KEEPNET.CAPACITY !== 'number' || config.KEEPNET.CAPACITY <= 0) {
        invalidValues.push('KEEPNET.CAPACITY must be greater than 0');
      }
    }

    // Validate FRICTION_BRAKE section
    if (config.FRICTION_BRAKE) {
      if (config.FRICTION_BRAKE.INITIAL > config.FRICTION_BRAKE.MAX) {
        invalidValues.push('FRICTION_BRAKE.INITIAL cannot be greater than MAX');
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidValues.length === 0,
      missingFields,
      invalidValues,
      recommendations
    };
  }

  convertToUIFormat(rf4sConfig: RF4SYamlConfig): any {
    return {
      script: {
        enabled: true,
        mode: 'auto' as const,
        sensitivity: rf4sConfig.SCRIPT.SPOOL_CONFIDENCE,
        delay: rf4sConfig.SCRIPT.SPOD_ROD_RECAST_DELAY / 1000,
        randomCast: rf4sConfig.SCRIPT.RANDOM_CAST_PROBABILITY > 0,
        randomCastProbability: rf4sConfig.SCRIPT.RANDOM_CAST_PROBABILITY,
        screenshotTags: rf4sConfig.SCRIPT.SCREENSHOT_TAGS,
        alarmSound: rf4sConfig.SCRIPT.ALARM_SOUND
      },
      equipment: {
        mainRod: `Rod ${rf4sConfig.KEY.MAIN_ROD}`,
        spodRod: `Rod ${rf4sConfig.KEY.SPOD_ROD}`,
        rodType: 'Spinning',
        reelDrag: rf4sConfig.FRICTION_BRAKE.INITIAL,
        lineTest: 10.0,
        hookSize: 6,
        leaderLength: 100,
        sinkerWeight: 20,
        floatSize: 15
      },
      detection: {
        spoolConfidence: rf4sConfig.SCRIPT.SPOOL_CONFIDENCE,
        fishBite: 0.85,
        rodTip: 0.7,
        ocrConfidence: 0.8,
        snagDetection: rf4sConfig.SCRIPT.SNAG_DETECTION,
        imageVerification: rf4sConfig.SCRIPT.IMAGE_VERIFICATION
      }
    };
  }

  convertFromUIFormat(uiConfig: any): Partial<RF4SYamlConfig> {
    return {
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: true,
        IMAGE_VERIFICATION: uiConfig.detection?.imageVerification ?? true,
        SNAG_DETECTION: uiConfig.detection?.snagDetection ?? true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: true,
        SPOOL_CONFIDENCE: uiConfig.detection?.spoolConfidence ?? 0.97,
        SPOD_ROD_RECAST_DELAY: (uiConfig.script?.delay ?? 1) * 1000,
        LURE_CHANGE_DELAY: 1800,
        ALARM_SOUND: uiConfig.script?.alarmSound ?? "./static/sound/guitar.wav",
        RANDOM_CAST_PROBABILITY: uiConfig.script?.randomCastProbability ?? 0.25,
        SCREENSHOT_TAGS: uiConfig.script?.screenshotTags ?? ["green", "yellow", "blue", "purple", "pink"]
      },
      FRICTION_BRAKE: {
        INITIAL: uiConfig.equipment?.reelDrag ?? 29,
        MAX: 30,
        START_DELAY: 2.0,
        INCREASE_DELAY: 1.0,
        SENSITIVITY: "medium"
      }
    };
  }

  private parseYamlString(yamlString: string): any {
    // Simplified YAML parsing - in production, use a proper YAML library
    const lines = yamlString.split('\n');
    const result: any = {};
    let currentSection: any = result;
    let sectionStack: any[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      if (trimmed.endsWith(':')) {
        const key = trimmed.slice(0, -1);
        currentSection[key] = {};
        sectionStack.push(currentSection);
        currentSection = currentSection[key];
      } else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        currentSection[key.trim()] = this.parseValue(value);
      }
    }
    
    return result;
  }

  private parseValue(value: string): any {
    // Remove quotes
    value = value.replace(/^["']|["']$/g, '');
    
    // Parse numbers
    if (/^\d+\.?\d*$/.test(value)) {
      return parseFloat(value);
    }
    
    // Parse booleans
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      return value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
    }
    
    return value;
  }
}

export const RF4SConfigParser = new RF4SConfigParserImpl();
