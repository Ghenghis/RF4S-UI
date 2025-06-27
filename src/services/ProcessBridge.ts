
import { createRichLogger } from '../rf4s/utils';
import { RF4Detector } from './process/RF4Detector';
import { ProcessCommandExecutor } from './process/ProcessCommandExecutor';
import { IPCManager } from './process/IPCManager';
import { ProcessMonitor } from './process/ProcessMonitor';
import { ProcessInfo, ProcessCommand, IPCMessage, ProcessMetrics } from './process/types';

class ProcessBridgeImpl {
  private logger = createRichLogger('ProcessBridge');
  private monitoredProcesses: Map<string, ProcessInfo> = new Map();
  
  private rf4Detector: RF4Detector;
  private commandExecutor: ProcessCommandExecutor;
  private ipcManager: IPCManager;
  private processMonitor: ProcessMonitor;

  constructor() {
    this.rf4Detector = new RF4Detector();
    this.commandExecutor = new ProcessCommandExecutor(this.monitoredProcesses);
    this.ipcManager = new IPCManager();
    this.processMonitor = new ProcessMonitor(this.monitoredProcesses);
    
    this.processMonitor.startProcessMonitoring();
    this.rf4Detector.detectRF4Process();
  }

  // RF4 specific methods
  findProcessByName(processName: string): ProcessInfo[] {
    return this.rf4Detector.findProcessByName(processName);
  }

  findProcessByPid(pid: number): ProcessInfo | null {
    return this.rf4Detector.findProcessByPid(pid);
  }

  getRF4ProcessInfo(): ProcessInfo | null {
    return this.rf4Detector.getRF4ProcessInfo();
  }

  isRF4Running(): boolean {
    return this.rf4Detector.isRF4Running();
  }

  async checkRF4Health(): Promise<boolean> {
    return this.rf4Detector.checkRF4Health();
  }

  // Command execution
  async executeCommand(command: ProcessCommand): Promise<boolean> {
    return this.commandExecutor.executeCommand(command);
  }

  // Process monitoring
  startMonitoring(processName: string): void {
    this.processMonitor.startMonitoring(processName);
  }

  stopMonitoring(processName: string): void {
    this.processMonitor.stopMonitoring(processName);
  }

  getMonitoredProcesses(): ProcessInfo[] {
    return this.processMonitor.getMonitoredProcesses();
  }

  getProcessMetrics(processName: string): ProcessMetrics | null {
    return this.processMonitor.getProcessMetrics(processName);
  }

  async checkProcessHealth(processName: string): Promise<boolean> {
    return this.processMonitor.checkProcessHealth(processName);
  }

  // IPC methods
  async establishIPCConnection(processName: string, connectionType: 'pipe' | 'socket' | 'memory'): Promise<boolean> {
    return this.ipcManager.establishIPCConnection(processName, connectionType);
  }

  async sendIPCMessage(processName: string, message: IPCMessage): Promise<boolean> {
    return this.ipcManager.sendIPCMessage(processName, message);
  }

  registerMessageHandler(messageType: string, handler: (message: IPCMessage) => void): void {
    this.ipcManager.registerMessageHandler(messageType, handler);
  }

  unregisterMessageHandler(messageType: string): void {
    this.ipcManager.unregisterMessageHandler(messageType);
  }
}

export const ProcessBridge = new ProcessBridgeImpl();

// Re-export types for convenience
export type { ProcessInfo, ProcessCommand, IPCMessage, ProcessMetrics };
