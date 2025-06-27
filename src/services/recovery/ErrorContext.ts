
export interface ErrorContext {
  serviceName: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  stackTrace?: string;
  userAction?: string;
  systemState: any;
}

export interface RecoveryStrategy {
  name: string;
  applicable: (context: ErrorContext) => boolean;
  execute: (context: ErrorContext) => Promise<boolean>;
  cooldownPeriod: number;
  maxAttempts: number;
}

export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
