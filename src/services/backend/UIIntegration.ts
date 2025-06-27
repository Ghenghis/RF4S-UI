
import { EventManager } from '../../core/EventManager';

export class UIIntegration {
  // Public methods for UI integration
  requestFishingStats(): void {
    EventManager.emit('ui.panel_request', { type: 'fishing_stats' }, 'UI');
  }

  requestSystemStatus(): void {
    EventManager.emit('ui.panel_request', { type: 'system_status' }, 'UI');
  }

  requestValidationStatus(): void {
    EventManager.emit('ui.panel_request', { type: 'validation_status' }, 'UI');
  }
}
