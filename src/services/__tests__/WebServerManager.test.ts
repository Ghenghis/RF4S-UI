
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebServerManager } from '../backend/WebServerManager';
import { RF4SWebServer } from '../backend/RF4SWebServer';
import { EventManager } from '../../core/EventManager';

// Mock dependencies
vi.mock('../backend/RF4SWebServer', () => ({
  RF4SWebServer: {
    start: vi.fn(),
    stop: vi.fn(),
    isServerRunning: vi.fn().mockReturnValue(true),
    getPort: vi.fn().mockReturnValue(8080),
    getConfig: vi.fn().mockResolvedValue({
      success: true,
      data: { VERSION: '1.0.0' }
    }),
    saveConfig: vi.fn().mockResolvedValue({
      success: true
    }),
    getProfiles: vi.fn().mockResolvedValue({
      success: true,
      data: []
    }),
    validateConfig: vi.fn().mockResolvedValue({
      success: true,
      valid: true
    })
  }
}));

vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(() => 'mock-subscription-id'),
    unsubscribe: vi.fn()
  }
}));

vi.mock('../backend/RF4SConfigBridge', () => ({
  RF4SConfigBridge: {
    createBackup: vi.fn().mockResolvedValue({
      success: true,
      data: { backupId: 'backup-123' }
    }),
    restoreBackup: vi.fn().mockResolvedValue({
      success: true
    })
  }
}));

describe('WebServerManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    WebServerManager.shutdown();
  });

  it('should initialize successfully', async () => {
    const result = await WebServerManager.initialize();
    
    expect(result).toBe(true);
    expect(RF4SWebServer.start).toHaveBeenCalled();
    expect(EventManager.subscribe).toHaveBeenCalledWith(
      'rf4s.web_server.request',
      expect.any(Function)
    );
  });

  it('should return server status', async () => {
    await WebServerManager.initialize();
    
    const status = WebServerManager.getStatus();
    
    expect(status).toHaveProperty('isRunning', true);
    expect(status).toHaveProperty('port', 8080);
    expect(status).toHaveProperty('uptime');
    expect(status).toHaveProperty('requestCount');
    expect(status).toHaveProperty('lastActivity');
  });

  it('should handle get config requests', async () => {
    await WebServerManager.initialize();
    
    const result = await WebServerManager.handleGetConfig();
    
    expect(RF4SWebServer.getConfig).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should handle save config requests', async () => {
    await WebServerManager.initialize();
    
    const config = { VERSION: '2.0.0' };
    const result = await WebServerManager.handleSaveConfig(config);
    
    expect(RF4SWebServer.saveConfig).toHaveBeenCalledWith(config);
    expect(result.success).toBe(true);
  });

  it('should handle get profiles requests', async () => {
    await WebServerManager.initialize();
    
    const result = await WebServerManager.handleGetProfiles();
    
    expect(RF4SWebServer.getProfiles).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should handle validate config requests', async () => {
    await WebServerManager.initialize();
    
    const config = { VERSION: '1.0.0' };
    const result = await WebServerManager.handleValidateConfig(config);
    
    expect(RF4SWebServer.validateConfig).toHaveBeenCalledWith(config);
    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('should handle create backup requests', async () => {
    await WebServerManager.initialize();
    
    const result = await WebServerManager.handleCreateBackup('Test backup');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('backupId', 'backup-123');
  });

  it('should increment request count on API calls', async () => {
    await WebServerManager.initialize();
    
    const initialStatus = WebServerManager.getStatus();
    const initialCount = initialStatus.requestCount;
    
    await WebServerManager.handleGetConfig();
    await WebServerManager.handleGetProfiles();
    
    const finalStatus = WebServerManager.getStatus();
    expect(finalStatus.requestCount).toBe(initialCount + 2);
    expect(finalStatus.lastActivity).toBeTruthy();
  });

  it('should handle web server request events', async () => {
    await WebServerManager.initialize();
    
    // Simulate a web server request event
    const subscribeCall = vi.mocked(EventManager.subscribe).mock.calls.find(
      call => call[0] === 'rf4s.web_server.request'
    );
    
    expect(subscribeCall).toBeDefined();
    if (subscribeCall) {
      const handler = subscribeCall[1];
      handler({ type: 'status' });
      
      expect(EventManager.emit).toHaveBeenCalledWith(
        'rf4s.web_server.status_response',
        expect.any(Object),
        'WebServerManager'
      );
    }
  });

  it('should shutdown cleanly', async () => {
    await WebServerManager.initialize();
    
    WebServerManager.shutdown();
    
    expect(RF4SWebServer.stop).toHaveBeenCalled();
    
    const status = WebServerManager.getStatus();
    expect(status.uptime).toBe(0);
    expect(status.requestCount).toBe(0);
    expect(status.lastActivity).toBeNull();
  });

  it('should report running status correctly', async () => {
    await WebServerManager.initialize();
    
    expect(WebServerManager.isRunning()).toBe(true);
    
    vi.mocked(RF4SWebServer.isServerRunning).mockReturnValue(false);
    expect(WebServerManager.isRunning()).toBe(false);
  });
});
