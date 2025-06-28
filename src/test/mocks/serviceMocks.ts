
import { vi } from 'vitest';
import { SystemMetrics, FishingStats, RF4SStatus } from '../../types/metrics';

export const createMockSystemMetrics = (): SystemMetrics => ({
  cpuUsage: 45,
  memoryUsage: 250,
  fps: 60,
  diskUsage: 35,
  networkLatency: 15,
  lastUpdate: Date.now()
});

export const createMockFishingStats = (): FishingStats => ({
  sessionTime: 3600,
  fishCaught: 12,
  castsTotal: 25,
  successRate: 48,
  averageFightTime: 45,
  bestFish: 'Northern Pike',
  greenFish: 5,
  yellowFish: 3,
  blueFish: 2,
  purpleFish: 1,
  pinkFish: 1,
  totalCasts: 25,
  successfulCasts: 12,
  averageWeight: 2.3
});

export const createMockRF4SStatus = (): RF4SStatus => ({
  processRunning: true,
  gameDetected: true,
  configLoaded: true,
  lastActivity: Date.now(),
  errorCount: 0,
  processId: 1234,
  warningCount: 0,
  errors: [],
  connected: true
});

export const mockEventManager = {
  emit: vi.fn(),
  subscribe: vi.fn(() => 'mock-listener-id'),
  unsubscribe: vi.fn(),
  listenerCount: vi.fn(() => 0),
  removeAllListeners: vi.fn()
};

export const mockWebSocketManager = {
  connect: vi.fn().mockResolvedValue(true),
  disconnect: vi.fn(),
  sendMessage: vi.fn().mockReturnValue(true),
  isConnected: vi.fn().mockReturnValue(true),
  getConnectionStats: vi.fn().mockReturnValue({
    connected: true,
    reconnectAttempts: 0,
    lastConnection: new Date(),
    messagesReceived: 10,
    messagesSent: 5,
    latency: 15
  })
};
