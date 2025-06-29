
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

export class RF4SEventEmitter {
  private logger = createRichLogger('RF4SEventEmitter');

  emitConnectionEvents(): void {
    this.logger.info('Setting up RF4S event emission...');
    
    // Emit initial connection status
    EventManager.emit('rf4s.service_initialized', {
      timestamp: Date.now(),
      version: '1.0.0'
    }, 'RF4SEventEmitter');
  }

  emitGameStateEvent(gameState: any): void {
    EventManager.emit('rf4s.game_state_changed', {
      gameState,
      timestamp: Date.now()
    }, 'RF4SEventEmitter');
  }

  emitFishingEvent(eventType: string, data: any): void {
    EventManager.emit(`rf4s.fishing_${eventType}`, {
      ...data,
      timestamp: Date.now()
    }, 'RF4SEventEmitter');
  }

  emitErrorEvent(error: string): void {
    EventManager.emit('rf4s.error', {
      error,
      timestamp: Date.now()
    }, 'RF4SEventEmitter');
  }

  emitStatusEvent(status: any): void {
    EventManager.emit('rf4s.status_updated', {
      status,
      timestamp: Date.now()
    }, 'RF4SEventEmitter');
  }
}
