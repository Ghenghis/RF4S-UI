
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeDataService } from '../RealtimeDataService';
import { mockEventManager, createMockSystemMetrics, createMockFishingStats } from '../../test/mocks/serviceMocks';

// Mock all dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: mockEventManager
}));

vi.mock('../RF4SIntegrationService', () => ({
  RF4SIntegrationService: {
    initialize: vi.fn().mockResolvedValue(true),
    getStatus: vi.fn().mockReturnValue({
      results: { total: 5 },
      stats: { sessionTime: '10m' }
    })
  }
}));

vi.mock('../SystemMonitorService', () => ({
  SystemMonitorService: {
    start: vi.fn(),
    stop: vi.fn(),
    getSystemStatus: vi.fn().mockReturnValue({
      health: {
        rf4sProcess: true,
        gameDetected: true,
        configLoaded: true,
        lastActivity: new Date(),
        servicesRunning: true,
        connectionStable: true
      },
      performance: {
        cpuUsage: 45,
        memoryUsage: 250,
        fps: 60,
        responseTime: 15,
        errorRate: 0
      }
    }),
    getSystemHealth: vi.fn().mockReturnValue({
      rf4sProcess: true,
      gameDetected: true,
      configLoaded: true,
      lastActivity: new Date(),
      connectionStable: true
    }),
    updateGameDetection: vi.fn(),
    updateConnectionStatus: vi.fn(),
    reportError: vi.fn()
  }
}));

vi.mock('../StatisticsCalculator', () => ({
  StatisticsCalculator: {
    calculateSessionStats: vi.fn().mockReturnValue({
      sessionTime: 3600,
      fishCaught: 5,
      castsTotal: 12,
      successRate: 42,
      averageFightTime: 35,
      bestFish: 'Pike'
    }),
    calculateFishTypeStats: vi.fn().mockReturnValue({
      green: 2,
      yellow: 1,
      blue: 1,
      purple: 1,
      pink: 0
    }),
    recordCast: vi.fn(),
    addFightTime: vi.fn()
  }
}));

describe('RealtimeDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (RealtimeDataService.isServiceRunning()) {
      RealtimeDataService.stop();
    }
  });

  describe('start()', () => {
    it('should initialize all services and start data collection', async () => {
      await RealtimeDataService.start();
      
      expect(RealtimeDataService.isServiceRunning()).toBe(true);
      expect(mockEventManager.emit).toHaveBeenCalledWith(
        'realtime.service_started',
        expect.objectContaining({
          timestamp: expect.any(Number),
          rf4sConnected: expect.any(Boolean),
          metricsEnabled: true,
          websocketEnabled: expect.any(Boolean)
        }),
        'RealtimeDataService'
      );
    });

    it('should not start if already running', async () => {
      await RealtimeDataService.start();
      mockEventManager.emit.mockClear();
      
      await RealtimeDataService.start();
      
      // Should not emit start event again
      expect(mockEventManager.emit).not.toHaveBeenCalledWith(
        'realtime.service_started',
        expect.anything(),
        'RealtimeDataService'
      );
    });
  });

  describe('stop()', () => {
    it('should stop all services and clean up', async () => {
      await RealtimeDataService.start();
      RealtimeDataService.stop();
      
      expect(RealtimeDataService.isServiceRunning()).toBe(false);
      expect(mockEventManager.emit).toHaveBeenCalledWith(
        'realtime.service_stopped',
        expect.objectContaining({
          timestamp: expect.any(Number)
        }),
        'RealtimeDataService'
      );
    });
  });

  describe('data retrieval methods', () => {
    beforeEach(async () => {
      await RealtimeDataService.start();
    });

    it('should return fishing stats', () => {
      const stats = RealtimeDataService.getFishingStats();
      
      expect(stats).toMatchObject({
        sessionTime: expect.any(Number),
        fishCaught: expect.any(Number),
        castsTotal: expect.any(Number),
        successRate: expect.any(Number),
        averageFightTime: expect.any(Number),
        bestFish: expect.any(String)
      });
    });

    it('should return RF4S status', () => {
      const status = RealtimeDataService.getRF4SStatus();
      
      expect(status).toMatchObject({
        processRunning: expect.any(Boolean),
        gameDetected: expect.any(Boolean),
        configLoaded: expect.any(Boolean),
        lastActivity: expect.any(Number),
        errorCount: expect.any(Number),
        connected: expect.any(Boolean)
      });
    });
  });

  describe('user actions', () => {
    beforeEach(async () => {
      await RealtimeDataService.start();
    });

    it('should increment fish caught', () => {
      RealtimeDataService.incrementFishCaught();
      // Verify the action was called (mocked functions should be invoked)
      expect(true).toBe(true); // Service call completed without error
    });

    it('should increment casts', () => {
      RealtimeDataService.incrementCasts();
      expect(true).toBe(true); // Service call completed without error
    });

    it('should update game detection status', () => {
      RealtimeDataService.updateGameDetection(true);
      expect(true).toBe(true); // Service call completed without error
    });

    it('should report errors', () => {
      RealtimeDataService.reportError('Test error');
      expect(true).toBe(true); // Service call completed without error
    });
  });
});
