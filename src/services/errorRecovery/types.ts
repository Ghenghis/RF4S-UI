
export interface ErrorPattern {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryActions: RecoveryAction[];
}

export interface RecoveryAction {
  type: 'restart_service' | 'reset_config' | 'clear_cache' | 'reduce_load' | 'notify_user';
  description: string;
  autoExecute: boolean;
}

export interface ErrorRecord {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recovered: boolean;
  recoveryActions: string[];
}

export interface SystemErrorEvent {
  error: string;
  timestamp: Date;
}
