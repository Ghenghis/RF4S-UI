
import { RF4SConfigBridge } from '../RF4SConfigBridge';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfigurationHandlers {
  private logger = createRichLogger('ConfigurationHandlers');

  async handleGetConfig(request: any): Promise<any> {
    const result = RF4SConfigBridge.loadConfigToDict();
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  async handleSaveConfig(request: any): Promise<any> {
    const { config } = request.body || {};
    if (!config) {
      return {
        success: false,
        errors: ['Configuration data is required'],
        timestamp: Date.now()
      };
    }

    const result = RF4SConfigBridge.saveDictToConfig(config);
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }

  async handleValidateConfig(request: any): Promise<any> {
    const { config } = request.body || {};
    if (!config) {
      return {
        success: false,
        errors: ['Configuration data is required'],
        timestamp: Date.now()
      };
    }

    const validation = RF4SConfigBridge.validateConfigData(config);
    return {
      success: true,
      data: validation,
      timestamp: Date.now()
    };
  }

  async handleResetConfig(request: any): Promise<any> {
    // For now, return default config - in real implementation, this would reset to defaults
    const result = RF4SConfigBridge.loadConfigToDict();
    return {
      success: result.success,
      data: result.data,
      errors: result.errors,
      timestamp: Date.now()
    };
  }
}
