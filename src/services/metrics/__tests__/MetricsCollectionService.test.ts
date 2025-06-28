
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MetricsCollectionService } from '../MetricsCollectionService';
import { mockEventManager } from '../../../test/mocks/serviceMocks';

// Mock the EventManager
vi.mock('../../../core/EventManager', () => ({
  EventManager: mockEventManager
}));

// Mock the integration config manager
vi.mock('../../integration/IntegrationConfigManager', () => ({
  integrationConfigManager: {
    getMonitoringConfig: vi.fn().mockReturnValue({
      metricsInterval: 1000,
      alertThresholds: {
        cpu: 80,
        memory: 400,
        fps: 30,
        latency: 100
      }
    })
  }
}));

describe('MetricsCollectionService', () => {
  let service: MetricsCollectionService;

  beforeEach(() => {
    service = new MetricsCollectionService();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  describe('start()', () => {
    it('should start metrics collection', () => {
      service.start();
      
      expect(mockEventManager.emit).toHaveBeenCalledWith(
        'metrics.collection_started',
        expect.objectContaining({
          interval: 1000,
          thresholds: expect.objectContaining({
            cpu: 80,
            memory: 400,
            fps: 30,
            latency: 100
          })
        }),
        'MetricsCollectionService'
      );
    });

    it('should not start if already collecting', () => {
      service.start();
      mockEventManager.emit.mockClear();
      
      service.start();
      
      expect(mockEventManager.emit).not.toHaveBeenCalled();
    });

    it('should collect metrics at specified intervals', () => {
      service.start();
      
      // Fast-forward time to trigger metric collection
      vi.advanceTimersByTime(1000);
      
      expect(mockEventManager.emit).toHaveBeenCalledWith(
        'metrics.snapshot_collected',
        expect.objectContaining({
          timestamp: expect.any(Number),
          systemMetrics: expect.objectContaining({
            cpuUsage: expect.any(Number),
            memoryUsage: expect.any(Number),
            fps: expect.any(Number)
          })
        }),
        'MetricsCollectionService'
      );
    });
  });

  describe('stop()', () => {
    it('should stop metrics collection', () => {
      service.start();
      service.stop();
      
      mockEventManager.emit.mockClear();
      vi.advanceTimersByTime(1000);
      
      expect(mockEventManager.emit).not.toHaveBeenCalledWith(
        'metrics.snapshot_collected',
        expect.anything(),
        'MetricsCollectionService'
      );
    });
  });

  describe('getLatestMetrics()', () => {
    it('should return null when no metrics collected', () => {
      const latest = service.getLatestMetrics();
      expect(latest).toBeNull();
    });

    it('should return latest metrics after collection', () => {
      service.start();
      vi.advanceTimersByTime(1000);
      
      const latest = service.getLatestMetrics();
      expect(latest).toMatchObject({
        timestamp: expect.any(Number),
        systemMetrics: expect.objectContaining({
          cpuUsage: expect.any(Number),
          memoryUsage: expect.any(Number)
        })
      });
    });
  });

  describe('getMetricsHistory()', () => {
    it('should return filtered metrics within time range', () => {
      service.start();
      
      // Collect multiple metrics
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
      
      const history = service.getMetricsHistory(1); // Last 1 minute
      expect(history.length).toBeGreaterThan(0);
      
      // All entries should be within the last minute
      const cutoff = Date.now() - (1 * 60 * 1000);
      history.forEach(metric => {
        expect(metric.timestamp).toBeGreaterThan(cutoff);
      });
    });
  });

  describe('alert thresholds', () => {
    it('should trigger alerts when thresholds are exceeded', () => {
      // Mock high CPU usage
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // Will result in high CPU
      
      service.start();
      vi.advanceTimersByTime(1000);
      
      expect(mockEventManager.emit).toHaveBeenCalledWith(
        'metrics.alert_triggered',
        expect.objectContaining({
          alerts: expect.arrayContaining([
            expect.objectContaining({
              type: 'cpu',
              value: expect.any(Number),
              threshold: 80
            })
          ])
        }),
        'MetricsCollectionService'
      );
    });
  });
});
