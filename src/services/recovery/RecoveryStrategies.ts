
import { EventManager } from '../../core/EventManager';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { ErrorContext, RecoveryStrategy } from './ErrorContext';

export class RecoveryStrategies {
  static getDefaultStrategies(): RecoveryStrategy[] {
    return [
      {
        name: 'ServiceRestart',
        applicable: (context) => context.errorType.includes('service') && context.severity !== 'low',
        execute: async (context) => {
          console.log(`Attempting service restart for ${context.serviceName}`);
          try {
            await ServiceOrchestrator.restartAllServices();
            return true;
          } catch (error) {
            console.error('Service restart failed:', error);
            return false;
          }
        },
        cooldownPeriod: 30000, // 30 seconds
        maxAttempts: 2
      },
      {
        name: 'ConfigurationReset',
        applicable: (context) => context.errorType.includes('config') || context.errorType.includes('validation'),
        execute: async (context) => {
          console.log(`Attempting configuration reset for ${context.serviceName}`);
          EventManager.emit('config.reset_requested', {
            serviceName: context.serviceName,
            reason: 'Error recovery'
          }, 'EnhancedErrorHandler');
          return true;
        },
        cooldownPeriod: 60000, // 1 minute
        maxAttempts: 1
      },
      {
        name: 'CacheClearing',
        applicable: (context) => context.errorType.includes('memory') || context.errorType.includes('cache'),
        execute: async (context) => {
          console.log(`Clearing caches for ${context.serviceName}`);
          EventManager.emit('system.clear_cache', {
            serviceName: context.serviceName
          }, 'EnhancedErrorHandler');
          return true;
        },
        cooldownPeriod: 15000, // 15 seconds
        maxAttempts: 3
      },
      {
        name: 'GracefulDegradation',
        applicable: (context) => context.severity === 'critical',
        execute: async (context) => {
          console.log(`Enabling graceful degradation mode for ${context.serviceName}`);
          EventManager.emit('system.degradation_mode', {
            serviceName: context.serviceName,
            level: 'graceful'
          }, 'EnhancedErrorHandler');
          return true;
        },
        cooldownPeriod: 120000, // 2 minutes
        maxAttempts: 1
      }
    ];
  }

  static getRecommendedActions(context: ErrorContext): string[] {
    const actions = [];
    
    switch (context.errorType) {
      case 'service_error':
        actions.push('Restart the application');
        actions.push('Check system resources');
        break;
      case 'configuration_error':
        actions.push('Reset configuration to defaults');
        actions.push('Verify configuration files');
        break;
      case 'connection_error':
        actions.push('Check network connectivity');
        actions.push('Verify RF4S game is running');
        break;
      case 'memory_error':
        actions.push('Close other applications');
        actions.push('Restart the system');
        break;
      default:
        actions.push('Restart the application');
        actions.push('Check console logs for details');
    }
    
    return actions;
  }
}
