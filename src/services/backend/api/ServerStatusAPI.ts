
import { RF4SWebServer } from '../RF4SWebServer';
import { ConfiguratorServer } from '../ConfiguratorServer';
import { HTMLConfiguratorServer } from '../HTMLConfiguratorServer';
import { createRichLogger } from '../../../rf4s/utils';
import { APIResponse } from '../types';

export class ServerStatusAPI {
  private logger = createRichLogger('ServerStatusAPI');

  async getServerStatus(): Promise<APIResponse> {
    try {
      const status = {
        server: {
          running: RF4SWebServer.isServerRunning(),
          port: RF4SWebServer.getPort()
        },
        configuratorServer: {
          running: ConfiguratorServer.isServerRunning(),
          port: ConfiguratorServer.getConfig().port
        },
        htmlServer: {
          running: HTMLConfiguratorServer.isServerRunning(),
          port: HTMLConfiguratorServer.getConfig().port
        },
        endpoints: [
          'GET:/api/config',
          'POST:/api/config',
          'POST:/api/config/validate',
          'POST:/api/config/reset',
          'POST:/api/backup/create',
          'POST:/api/backup/restore',
          'GET:/api/backup/list',
          'GET:/api/profiles',
          'POST:/api/profiles',
          'DELETE:/api/profiles/:id',
          'GET:/api/status',
          'GET:/health'
        ]
      };

      return {
        success: true,
        data: status,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get server status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async getHealthStatus(): Promise<APIResponse> {
    try {
      const health = {
        status: 'healthy',
        timestamp: Date.now(),
        services: {
          webServer: RF4SWebServer.isServerRunning() ? 'active' : 'inactive',
          configuratorServer: ConfiguratorServer.isServerRunning() ? 'active' : 'inactive',
          htmlServer: HTMLConfiguratorServer.isServerRunning() ? 'active' : 'inactive'
        }
      };

      return {
        success: true,
        data: health,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Failed to get health status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }
}
