
export interface ProcessInfo {
  pid: number;
  name: string;
  path: string;
  status: 'running' | 'stopped' | 'suspended' | 'unknown';
  cpuUsage: number;
  memoryUsage: number;
  startTime: Date;
}

export interface ProcessCommand {
  type: 'start' | 'stop' | 'kill' | 'suspend' | 'resume' | 'send_signal';
  target?: string;
  args?: string[];
  signal?: string;
}

export interface IPCMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface ProcessMetrics {
  cpu: number;
  memory: number;
  handles: number;
  threads: number;
  uptime: number;
}
