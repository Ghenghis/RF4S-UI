
import { createRichLogger } from '../rf4s/utils';
import { EventManager } from '../core/EventManager';

export interface FileWatchTarget {
  path: string;
  type: 'file' | 'directory';
  recursive?: boolean;
  debounceMs?: number;
  filters?: string[];
}

export interface FileChangeEvent {
  path: string;
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  timestamp: Date;
  size?: number;
  content?: string;
}

export interface MonitoringRule {
  id: string;
  name: string;
  targets: FileWatchTarget[];
  enabled: boolean;
  actions: FileMonitorAction[];
}

export interface FileMonitorAction {
  type: 'log' | 'parse' | 'backup' | 'notify' | 'callback';
  config: any;
}

class FileMonitorServiceImpl {
  private logger = createRichLogger('FileMonitorService');
  private watchers: Map<string, any> = new Map();
  private rules: Map<string, MonitoringRule> = new Map();
  private eventBuffer: Map<string, FileChangeEvent[]> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  addMonitoringRule(rule: MonitoringRule): void {
    this.rules.set(rule.id, rule);
    if (rule.enabled) {
      this.startWatching(rule);
    }
    this.logger.info(`Monitoring rule added: ${rule.name}`);
  }

  removeMonitoringRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    this.stopWatching(rule);
    this.rules.delete(ruleId);
    this.logger.info(`Monitoring rule removed: ${ruleId}`);
    return true;
  }

  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.enabled = true;
    this.startWatching(rule);
    this.logger.info(`Monitoring rule enabled: ${ruleId}`);
    return true;
  }

  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.enabled = false;
    this.stopWatching(rule);
    this.logger.info(`Monitoring rule disabled: ${ruleId}`);
    return true;
  }

  startWatchingPath(target: FileWatchTarget, ruleId: string): void {
    const watcherId = `${ruleId}_${target.path}`;
    
    if (this.watchers.has(watcherId)) {
      this.logger.debug(`Already watching: ${target.path}`);
      return;
    }

    try {
      // Simulate file system watcher
      const watcher = this.createWatcher(target, ruleId);
      this.watchers.set(watcherId, watcher);
      this.logger.info(`Started watching: ${target.path}`);
    } catch (error) {
      this.logger.error(`Failed to watch ${target.path}:`, error);
    }
  }

  stopWatchingPath(target: FileWatchTarget, ruleId: string): void {
    const watcherId = `${ruleId}_${target.path}`;
    const watcher = this.watchers.get(watcherId);
    
    if (watcher) {
      this.destroyWatcher(watcher);
      this.watchers.delete(watcherId);
      this.logger.info(`Stopped watching: ${target.path}`);
    }
  }

  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }

  getMonitoringStatistics(): {
    activeWatchers: number;
    totalRules: number;
    activeRules: number;
    eventsProcessed: number;
    recentEvents: FileChangeEvent[];
  } {
    const allEvents = Array.from(this.eventBuffer.values()).flat();
    const recentEvents = allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    return {
      activeWatchers: this.watchers.size,
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length,
      eventsProcessed: allEvents.length,
      recentEvents
    };
  }

  readFileContent(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate file reading
      setTimeout(() => {
        if (Math.random() > 0.1) {
          const mockContent = this.generateMockFileContent(filePath);
          resolve(mockContent);
        } else {
          reject(new Error(`Failed to read file: ${filePath}`));
        }
      }, 100 + Math.random() * 200);
    });
  }

  writeFileContent(filePath: string, content: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Simulate file writing
      setTimeout(() => {
        if (Math.random() > 0.05) {
          this.logger.info(`File written: ${filePath}`);
          resolve(true);
        } else {
          reject(new Error(`Failed to write file: ${filePath}`));
        }
      }, 50 + Math.random() * 100);
    });
  }

  backupFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      
      this.readFileContent(filePath)
        .then(content => this.writeFileContent(backupPath, content))
        .then(() => {
          this.logger.info(`File backed up: ${filePath} -> ${backupPath}`);
          resolve(backupPath);
        })
        .catch(reject);
    });
  }

  private startWatching(rule: MonitoringRule): void {
    rule.targets.forEach(target => {
      this.startWatchingPath(target, rule.id);
    });
  }

  private stopWatching(rule: MonitoringRule): void {
    rule.targets.forEach(target => {
      this.stopWatchingPath(target, rule.id);
    });
  }

  private createWatcher(target: FileWatchTarget, ruleId: string): any {
    // Simulate watcher creation and return mock watcher
    const mockWatcher = {
      target,
      ruleId,
      interval: setInterval(() => {
        // Simulate random file changes
        if (Math.random() > 0.9) {
          this.handleFileChange({
            path: target.path,
            type: ['created', 'modified', 'deleted'][Math.floor(Math.random() * 3)] as any,
            timestamp: new Date(),
            size: Math.floor(Math.random() * 10000)
          }, ruleId);
        }
      }, 2000)
    };

    return mockWatcher;
  }

  private destroyWatcher(watcher: any): void {
    if (watcher.interval) {
      clearInterval(watcher.interval);
    }
  }

  private handleFileChange(event: FileChangeEvent, ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) {
      return;
    }

    // Add to event buffer
    if (!this.eventBuffer.has(ruleId)) {
      this.eventBuffer.set(ruleId, []);
    }
    this.eventBuffer.get(ruleId)!.push(event);

    // Debounce if configured
    const target = rule.targets.find(t => t.path === event.path);
    if (target?.debounceMs) {
      const timerId = `${ruleId}_${event.path}`;
      
      if (this.debounceTimers.has(timerId)) {
        clearTimeout(this.debounceTimers.get(timerId)!);
      }

      this.debounceTimers.set(timerId, setTimeout(() => {
        this.processFileChange(event, rule);
        this.debounceTimers.delete(timerId);
      }, target.debounceMs));
    } else {
      this.processFileChange(event, rule);
    }
  }

  private processFileChange(event: FileChangeEvent, rule: MonitoringRule): void {
    this.logger.debug(`File change detected: ${event.path} (${event.type})`);

    // Execute rule actions
    rule.actions.forEach(action => {
      try {
        this.executeAction(action, event, rule);
      } catch (error) {
        this.logger.error(`Action execution failed:`, error);
      }
    });

    // Emit event
    EventManager.emit('file_monitor.change', { event, rule }, 'FileMonitorService');
  }

  private executeAction(action: FileMonitorAction, event: FileChangeEvent, rule: MonitoringRule): void {
    switch (action.type) {
      case 'log':
        this.logger.info(`[${rule.name}] ${event.type}: ${event.path}`);
        break;
        
      case 'parse':
        this.parseFileContent(event.path, action.config);
        break;
        
      case 'backup':
        this.backupFile(event.path);
        break;
        
      case 'notify':
        EventManager.emit('file_monitor.notification', { 
          message: `File ${event.type}: ${event.path}`,
          level: action.config.level || 'info'
        }, 'FileMonitorService');
        break;
        
      case 'callback':
        if (typeof action.config.callback === 'function') {
          action.config.callback(event, rule);
        }
        break;
    }
  }

  private parseFileContent(filePath: string, config: any): void {
    this.readFileContent(filePath)
      .then(content => {
        const parsed = this.parseContent(content, config);
        EventManager.emit('file_monitor.parsed', { filePath, parsed }, 'FileMonitorService');
      })
      .catch(error => {
        this.logger.error(`Failed to parse file ${filePath}:`, error);
      });
  }

  private parseContent(content: string, config: any): any {
    try {
      if (config.format === 'json') {
        return JSON.parse(content);
      } else if (config.format === 'ini') {
        return this.parseINI(content);
      } else if (config.format === 'log') {
        return this.parseLogFile(content);
      }
      return content;
    } catch (error) {
      this.logger.error('Content parsing failed:', error);
      return null;
    }
  }

  private parseINI(content: string): any {
    const result: any = {};
    const lines = content.split('\n');
    let currentSection = 'default';
    
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        result[currentSection] = {};
      } else if (line.includes('=')) {
        const [key, value] = line.split('=').map(s => s.trim());
        if (!result[currentSection]) result[currentSection] = {};
        result[currentSection][key] = value;
      }
    });
    
    return result;
  }

  private parseLogFile(content: string): any[] {
    return content.split('\n')
      .filter(line => line.trim())
      .map(line => ({
        timestamp: new Date(),
        message: line,
        level: this.extractLogLevel(line)
      }));
  }

  private extractLogLevel(line: string): string {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return levels.find(level => line.toUpperCase().includes(level)) || 'INFO';
  }

  private generateMockFileContent(filePath: string): string {
    if (filePath.endsWith('.json')) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        data: { value: Math.random() * 100 }
      }, null, 2);
    } else if (filePath.endsWith('.ini')) {
      return `[section1]\nkey1=value1\nkey2=${Math.random()}\n[section2]\nkey3=value3`;
    } else if (filePath.endsWith('.log')) {
      return `${new Date().toISOString()} INFO: Sample log entry\n${new Date().toISOString()} DEBUG: Random value: ${Math.random()}`;
    }
    return `Sample content for ${filePath}\nTimestamp: ${new Date().toISOString()}`;
  }

  private initializeDefaultRules(): void {
    const defaultRules: MonitoringRule[] = [
      {
        id: 'rf4s_config_monitor',
        name: 'RF4S Configuration Monitor',
        targets: [
          {
            path: './config/rf4s.ini',
            type: 'file',
            debounceMs: 1000
          }
        ],
        enabled: true,
        actions: [
          { type: 'log', config: {} },
          { type: 'backup', config: {} },
          { type: 'parse', config: { format: 'ini' } }
        ]
      },
      {
        id: 'rf4s_log_monitor',
        name: 'RF4S Log Monitor',
        targets: [
          {
            path: './logs/',
            type: 'directory',
            recursive: true,
            filters: ['*.log']
          }
        ],
        enabled: true,
        actions: [
          { type: 'parse', config: { format: 'log' } },
          { type: 'notify', config: { level: 'info' } }
        ]
      }
    ];

    defaultRules.forEach(rule => this.addMonitoringRule(rule));
  }
}

export const FileMonitorService = new FileMonitorServiceImpl();
