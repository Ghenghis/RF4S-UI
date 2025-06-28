
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HTMLConfiguratorServer } from '../backend/HTMLConfiguratorServer';
import { EventManager } from '../../core/EventManager';
import { ConfiguratorServer } from '../backend/ConfiguratorServer';

// Mock dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

vi.mock('../backend/ConfiguratorServer', () => ({
  ConfiguratorServer: {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    isRunning: vi.fn().mockReturnValue(true)
  }
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
});

describe('HTMLConfiguratorServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    try {
      await HTMLConfiguratorServer.stop();
    } catch {
      // Ignore errors during cleanup
    }
  });

  it('should start server successfully', async () => {
    await HTMLConfiguratorServer.start();
    
    expect(ConfiguratorServer.start).toHaveBeenCalled();
    expect(EventManager.emit).toHaveBeenCalledWith(
      'html_configurator.server.started',
      expect.objectContaining({
        port: 3002,
        host: 'localhost',
        staticPath: './docs'
      }),
      'HTMLConfiguratorServer'
    );
    expect(HTMLConfiguratorServer.isServerRunning()).toBe(true);
  });

  it('should not start if already running', async () => {
    await HTMLConfiguratorServer.start();
    
    // Clear previous calls
    vi.mocked(ConfiguratorServer.start).mockClear();
    
    await HTMLConfiguratorServer.start();
    
    // Should not call start again
    expect(ConfiguratorServer.start).not.toHaveBeenCalled();
  });

  it('should stop server successfully', async () => {
    await HTMLConfiguratorServer.start();
    await HTMLConfiguratorServer.stop();
    
    expect(ConfiguratorServer.stop).toHaveBeenCalled();
    expect(EventManager.emit).toHaveBeenCalledWith(
      'html_configurator.server.stopped',
      {},
      'HTMLConfiguratorServer'
    );
    expect(HTMLConfiguratorServer.isServerRunning()).toBe(false);
  });

  it('should not stop if not running', async () => {
    await HTMLConfiguratorServer.stop();
    
    // Should not call stop if not running
    expect(ConfiguratorServer.stop).not.toHaveBeenCalled();
  });

  it('should open configurator when server is running', async () => {
    await HTMLConfiguratorServer.start();
    
    HTMLConfiguratorServer.openConfigurator();
    
    expect(window.open).toHaveBeenCalledWith(
      'http://localhost:3002/rf4s_complete_configurator.html',
      '_blank',
      'width=1200,height=800'
    );
  });

  it('should throw error when opening configurator while server not running', () => {
    expect(() => {
      HTMLConfiguratorServer.openConfigurator();
    }).toThrow('HTML configurator server is not running');
  });

  it('should return server configuration', () => {
    const config = HTMLConfiguratorServer.getConfig();
    
    expect(config).toEqual({
      port: 3002,
      host: 'localhost',
      staticPath: './docs'
    });
  });

  it('should update server configuration', () => {
    const updates = {
      port: 4002,
      host: '0.0.0.0'
    };
    
    HTMLConfiguratorServer.updateConfig(updates);
    
    const config = HTMLConfiguratorServer.getConfig();
    expect(config.port).toBe(4002);
    expect(config.host).toBe('0.0.0.0');
    expect(config.staticPath).toBe('./docs'); // Should remain unchanged
  });

  it('should handle start server errors', async () => {
    vi.mocked(ConfiguratorServer.start).mockRejectedValueOnce(new Error('Start failed'));
    
    await expect(HTMLConfiguratorServer.start()).rejects.toThrow('Start failed');
    expect(HTMLConfiguratorServer.isServerRunning()).toBe(false);
  });

  it('should handle stop server errors', async () => {
    await HTMLConfiguratorServer.start();
    
    vi.mocked(ConfiguratorServer.stop).mockRejectedValueOnce(new Error('Stop failed'));
    
    await expect(HTMLConfiguratorServer.stop()).rejects.toThrow('Stop failed');
  });

  it('should report correct running status', async () => {
    expect(HTMLConfiguratorServer.isServerRunning()).toBe(false);
    
    await HTMLConfiguratorServer.start();
    expect(HTMLConfiguratorServer.isServerRunning()).toBe(true);
    
    await HTMLConfiguratorServer.stop();
    expect(HTMLConfiguratorServer.isServerRunning()).toBe(false);
  });
});
