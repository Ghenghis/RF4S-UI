
import { ErrorPattern } from './types';

export class ErrorPatterns {
  static getDefaultPatterns(): ErrorPattern[] {
    return [
      {
        type: 'connection_lost',
        pattern: /connection.*lost|disconnected|timeout/i,
        severity: 'high',
        recoveryActions: [
          { type: 'restart_service', description: 'Restart RF4S connection', autoExecute: true },
          { type: 'notify_user', description: 'Notify user of connection issue', autoExecute: true }
        ]
      },
      {
        type: 'config_error',
        pattern: /config.*invalid|configuration.*error/i,
        severity: 'medium',
        recoveryActions: [
          { type: 'reset_config', description: 'Reset to default configuration', autoExecute: false },
          { type: 'notify_user', description: 'Notify user of config issue', autoExecute: true }
        ]
      },
      {
        type: 'performance_degradation',
        pattern: /high.*cpu|memory.*limit|performance.*poor/i,
        severity: 'medium',
        recoveryActions: [
          { type: 'reduce_load', description: 'Apply performance optimizations', autoExecute: true },
          { type: 'clear_cache', description: 'Clear system cache', autoExecute: true }
        ]
      },
      {
        type: 'detection_failure',
        pattern: /detection.*failed|no.*fish.*detected|ocr.*error/i,
        severity: 'low',
        recoveryActions: [
          { type: 'restart_service', description: 'Restart detection service', autoExecute: true }
        ]
      }
    ];
  }

  static matchErrorPattern(error: string, patterns: ErrorPattern[]): ErrorPattern | null {
    return patterns.find(pattern => pattern.pattern.test(error)) || null;
  }
}
