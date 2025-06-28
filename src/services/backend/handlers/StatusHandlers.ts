
import { RF4SWebServer } from '../RF4SWebServer';
import { createRichLogger } from '../../../rf4s/utils';

export class StatusHandlers {
  private logger = createRichLogger('StatusHandlers');

  async handleGetStatus(request: any, isRunning: boolean, config: any): Promise<any> {
    return {
      success: true,
      data: {
        server: {
          running: isRunning,
          port: config.port,
          host: config.host
        },
        webServer: {
          running: RF4SWebServer.isServerRunning(),
          port: RF4SWebServer.getPort()
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
      },
      timestamp: Date.now()
    };
  }

  async handleHealthCheck(request: any): Promise<any> {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: Date.now(),
        services: {
          configBridge: 'active',
          webServer: RF4SWebServer.isServerRunning() ? 'active' : 'inactive'
        }
      }
    };
  }
}
