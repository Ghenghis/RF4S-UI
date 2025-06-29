
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';
import { IntegrationStatusManager } from './IntegrationStatusManager';

export class IntegrationEventManager {
  private logger = createRichLogger('IntegrationEventManager');
  private statusManager: IntegrationStatusManager;

  constructor(statusManager: IntegrationStatusManager) {
    this.statusManager = statusManager;
  }

  setupEventListeners(): void {
    EventManager.subscribe('configurator.server.started', () => {
      this.statusManager.updateStatus();
      this.logger.info('Configurator server started - updating status');
    });

    EventManager.subscribe('configurator.server.stopped', () => {
      this.statusManager.updateStatus();
      this.logger.info('Configurator server stopped - updating status');
    });

    EventManager.subscribe('rf4s.web_server.started', () => {
      this.statusManager.updateStatus();
      this.logger.info('RF4S web server started - updating status');
    });

    EventManager.subscribe('rf4s.web_server.stopped', () => {
      this.statusManager.updateStatus();
      this.logger.info('RF4S web server stopped - updating status');
    });

    EventManager.subscribe('html_configurator.server.started', () => {
      this.statusManager.updateStatus();
      this.logger.info('HTML configurator server started - updating status');
    });

    EventManager.subscribe('html_configurator.server.stopped', () => {
      this.statusManager.updateStatus();
      this.logger.info('HTML configurator server stopped - updating status');
    });
  }
}
