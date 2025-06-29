
import { vi, expect } from 'vitest';
import { SystemMetrics, FishingStats, RF4SStatus } from '../types/metrics';

export const createTestSystemMetrics = (overrides: Partial<SystemMetrics> = {}): SystemMetrics => ({
  cpuUsage: 45,
  memoryUsage: 256,
  fps: 60,
  diskUsage: 35,
  networkLatency: 12,
  lastUpdate: Date.now(),
  ...overrides
});

export const createTestFishingStats = (overrides: Partial<FishingStats> = {}): FishingStats => ({
  sessionTime: 3600,
  fishCaught: 15,
  castsTotal: 30,
  successRate: 50,
  averageFightTime: 42,
  bestFish: 'Bass',
  greenFish: 8,
  yellowFish: 4,
  blueFish: 2,
  purpleFish: 1,
  pinkFish: 0,
  totalCasts: 30,
  successfulCasts: 15,
  averageWeight: 2.1,
  ...overrides
});

export const createTestRF4SStatus = (overrides: Partial<RF4SStatus> = {}): RF4SStatus => ({
  processRunning: true,
  gameDetected: true,
  configLoaded: true,
  lastActivity: Date.now(),
  errorCount: 0,
  processId: 1234,
  warningCount: 0,
  errors: [],
  connected: true,
  ...overrides
});

export const simulateDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const createMockEvent = (type: string, data: any) => ({
  type,
  data,
  timestamp: Date.now(),
  source: 'test'
});

export const expectEventToBeEmitted = (mockEmit: any, eventType: string) => {
  expect(mockEmit).toHaveBeenCalledWith(
    eventType,
    expect.any(Object),
    expect.any(String)
  );
};

export const getLastEmittedEvent = (mockEmit: any, eventType: string) => {
  const calls = mockEmit.mock.calls;
  const matchingCall = calls.reverse().find((call: any[]) => call[0] === eventType);
  return matchingCall ? matchingCall[1] : null;
};
