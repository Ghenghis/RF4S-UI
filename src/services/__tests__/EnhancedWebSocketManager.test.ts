
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedWebSocketManager } from '../realtime/EnhancedWebSocketManager';

// Mock WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocket.CONNECTING,
};

global.WebSocket = vi.fn(() => mockWebSocket) as any;

describe('EnhancedWebSocketManager', () => {
  let manager: EnhancedWebSocketManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new EnhancedWebSocketManager('ws://localhost:8080');
  });

  it('should create manager with correct URL', () => {
    expect(manager).toBeDefined();
  });

  it('should attempt to connect', async () => {
    const connectPromise = manager.connect();
    
    // Simulate successful connection
    mockWebSocket.readyState = WebSocket.OPEN;
    const mockEvent = { type: 'open' } as Event;
    const openHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'open'
    )?.[1];
    
    if (openHandler) {
      openHandler(mockEvent);
    }

    const result = await connectPromise;
    expect(result).toBe(true);
  });

  it('should handle connection errors', async () => {
    const connectPromise = manager.connect();
    
    // Simulate connection error
    const mockError = new Event('error');
    const errorHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];
    
    if (errorHandler) {
      errorHandler(mockError);
    }

    const result = await connectPromise;
    expect(result).toBe(false);
  });

  it('should send messages when connected', () => {
    mockWebSocket.readyState = WebSocket.OPEN;
    const message = { type: 'test', data: 'hello' };
    
    const result = manager.sendMessage(message);
    
    expect(result).toBe(true);
    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
  });

  it('should not send messages when disconnected', () => {
    mockWebSocket.readyState = WebSocket.CLOSED;
    const message = { type: 'test', data: 'hello' };
    
    const result = manager.sendMessage(message);
    
    expect(result).toBe(false);
    expect(mockWebSocket.send).not.toHaveBeenCalled();
  });

  it('should return connection status', () => {
    mockWebSocket.readyState = WebSocket.OPEN;
    expect(manager.isConnected()).toBe(true);
    
    mockWebSocket.readyState = WebSocket.CLOSED;
    expect(manager.isConnected()).toBe(false);
  });

  it('should provide connection statistics', () => {
    const stats = manager.getConnectionStats();
    
    expect(stats).toHaveProperty('connected');
    expect(stats).toHaveProperty('reconnectAttempts');
    expect(stats).toHaveProperty('messagesReceived');
    expect(stats).toHaveProperty('messagesSent');
    expect(typeof stats.connected).toBe('boolean');
    expect(typeof stats.reconnectAttempts).toBe('number');
  });

  it('should disconnect cleanly', () => {
    manager.disconnect();
    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});
