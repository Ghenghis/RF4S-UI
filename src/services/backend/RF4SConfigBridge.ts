
import { RF4SYamlConfig } from '../../types/config';
import { rf4sService } from '../../rf4s/services/rf4sService';
import { createRichLogger } from '../../rf4s/utils';
import { ConfigConverter } from './config/ConfigConverter';
import { ConfigValidator, ConfigValidationResult } from './config/ConfigValidator';
import { ConfigBackupManager, ConfigConversionResult } from './config/ConfigBackupManager';

class RF4SConfigBridgeImpl {
  private logger = createRichLogger('RF4SConfigBridge');
  private converter = new ConfigConverter();
  private validator = new ConfigValidator();
  private backupManager = new ConfigBackupManager();

  loadConfigToDict(): ConfigConversionResult {
    try {
      const rf4sConfig = rf4sService.getConfig();
      const yamlConfig = this.converter.convertRF4SToYaml(rf4sConfig);
      
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
      const validation = this.validator.validateConfigData(yamlConfig);
      if (!validation.isValid) {
        return {
          success: false,
          errors: [...validation.missingFields, ...validation.invalidValues]
        };
      }

      // Convert YAML config to RF4S format and save
      const rf4sConfig = this.converter.convertYamlToRF4S(yamlConfig);
      this.converter.applyConfigToRF4S(rf4sConfig);
      
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
    return this.validator.validateConfigData(yamlConfig);
  }

  createBackup(description: string = 'Auto backup'): ConfigConversionResult {
    try {
      const currentConfig = this.loadConfigToDict();
      if (!currentConfig.success) {
        return currentConfig;
      }

      return this.backupManager.createBackup(currentConfig.data, description);
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
      const restoreResult = this.backupManager.restoreBackup(backupId);
      if (restoreResult.success && restoreResult.data) {
        const saveResult = this.saveDictToConfig(restoreResult.data);
        if (saveResult.success) {
          this.logger.info(`Configuration restored from backup: ${backupId}`);
        }
        return saveResult;
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
export type { ConfigConversionResult, ConfigValidationResult };
