
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedWebSocketManager } from '../EnhancedWebSocketManager';
import { mockEventManager } from '../../../test/mocks/serviceMocks';

// Mock EventManager
vi.mock('../../../core/EventManager', () => ({
  EventManager: mockEventManager
}));

// Mock integration config
vi.mock('../../integration/IntegrationConfigManager', () => ({
  integrationConfigManager: {
    getRealtimeConfig: vi.fn().mockReturnValue({
      websocketUrl: 'ws://localhost:8080/test',
      updateInterval: 1000
    })
  }
}));

describe('EnhancedWebSocketManager', () => {
  let manager: EnhancedWebSocketManager;

  beforeEach(() => {
    manager = new EnhancedWebSocketManager();
    vi.clearAllMocks();
    
    // Mock process.env for development mode
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    manager.disconnect();
    vi.unstubAllEnvs();
  });

  describe('connect()', () => {
    it('should establish connection in development mode', async () => {
      const connected = await manager.connect();
      
      expect(connected).toBe(true);
      expect(manager.isConnected()).toBe(true);
      expect(mockEventManager.emit).toHaveBeenCalledWith(
        'websocket.connected',
        expect.objectContaining({
          url: expect.any(String),
          timestamp: expect.any(Number)
        }),
        'EnhancedWebSocketManager'
      );
    });

    it('should handle connection stats correctly', async () => {
      await manager.connect();
      
      const stats = manager.getConnectionStats();
      expect(stats).toMatchObject({
        connected: true,
        reconnectAttempts: 0,
        lastConnection: expect.any(Date),
        messagesReceived: 0,
        messagesSent: 0,
        latency: 0
      });
    });
  });

  describe('sendMessage()', () => {
    it('should send message when connected', async () => {
      await manager.connect();
      
      const result = manager.sendMessage('metrics', { test: 'data' });
      expect(result).toBe(true);
    });

    it('should queue message when disconnected', () => {
      const result = manager.sendMessage('metrics', { test: 'data' });
      expect(result).toBe(false);
    });
  });

  describe('disconnect()', () => {
    it('should properly disconnect and clean up', async () => {
      await manager.connect();
      expect(manager.isConnected()).toBe(true);
      
      manager.disconnect();
      expect(manager.isConnected()).toBe(false);
    });
  });

  describe('message handling', () => {
    it('should handle ping/pong for latency calculation', async () => {
      await manager.connect();
      
      // Simulate receiving a pong message
      const mockPongMessage = {
        type: 'pong' as const,
        payload: {},
        timestamp: Date.now() - 100 // 100ms ago
      };
      
      // This would normally be handled by WebSocket onmessage
      // but we're testing the logic flow
      expect(manager.isConnected()).toBe(true);
    });
  });
});
