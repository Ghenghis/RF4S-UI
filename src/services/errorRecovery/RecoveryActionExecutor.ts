
import { EventManager } from '../../core/EventManager';
import { RF4SIntegrationService } from '../RF4SIntegrationService';
import { SystemMonitorService } from '../SystemMonitorService';
import { rf4sService } from '../../rf4s/services/rf4sService';
import { RecoveryAction, ErrorRecord } from './types';

export class RecoveryActionExecutor {
  static async executeRecoveryAction(action: RecoveryAction, errorRecord: ErrorRecord): Promise<boolean> {
    console.log('Executing recovery action:', action.type, action.description);
    
    try {
      switch (action.type) {
        case 'restart_service':
          return await this.restartService(errorRecord.type);
        
        case 'reset_config':
          return this.resetConfiguration();
        
        case 'clear_cache':
          return this.clearSystemCache();
        
        case 'reduce_load':
          return this.reduceSystemLoad();
        
        case 'notify_user':
          return this.notifyUser(errorRecord);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Recovery action failed:', action.type, error);
      return false;
    }
  }

  private static async restartService(errorType: string): Promise<boolean> {
    console.log('Restarting service for error type:', errorType);
    
    if (errorType === 'connection_lost') {
      // Restart RF4S integration
      await RF4SIntegrationService.initialize();
      return true;
    }
    
    if (errorType === 'detection_failure') {
      // Restart system monitoring
      SystemMonitorService.stop();
      SystemMonitorService.start();
      return true;
    }
    
    return false;
  }

  private static resetConfiguration(): boolean {
    console.log('Resetting configuration to defaults');
    rf4sService.resetConfig();
    return true;
  }

  private static clearSystemCache(): boolean {
    console.log('Clearing system cache');
    return true;
  }

  private static reduceSystemLoad(): boolean {
    console.log('Reducing system load');
    EventManager.emit('system.reduce_load', {
      reason: 'Error recovery',
      timestamp: new Date()
    }, 'ErrorRecoveryService');
    return true;
  }

  private static notifyUser(errorRecord: ErrorRecord): boolean {
    console.log('Notifying user of error:', errorRecord.message);
    
    EventManager.emit('user.notification', {
      type: 'error',
      title: 'System Error Detected',
      message: `${errorRecord.type}: ${errorRecord.message}`,
      severity: errorRecord.severity,
      timestamp: errorRecord.timestamp
    }, 'ErrorRecoveryService');
    
    return true;
  }
}
