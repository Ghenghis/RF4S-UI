
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SystemMonitorService } from '../SystemMonitorService';
import { EventManager } from '../../core/EventManager';
import { RF4SBridgeInterface } from '../RF4SBridgeInterface';
import { RF4SDetectionService } from '../RF4SDetectionService';

// Mock dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(() => 'mock-subscription-id'),
    unsubscribe: vi.fn()
  }
}));

vi.mock('../RF4SBridgeInterface', () => ({
  RF4SBridgeInterface: {
    getConnection: vi.fn().mockReturnValue({
      status: 'connected',
      lastPing: Date.now()
    })
  }
}));

vi.mock('../RF4SDetectionService', () => ({
  RF4SDetectionService: {
    isGameDetected: vi.fn().mockReturnValue(true)
  }
}));

describe('SystemMonitorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    SystemMonitorService.stop();
    vi.useRealTimers();
  });

  it('should start monitoring successfully', () => {
    SystemMonitorService.start();
    
    // Fast-forward time to trigger monitoring
    vi.advanceTimersByTime(2000);
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'system.health_updated',
      expect.any(Object),
      'SystemMonitorService'
    );
  });

  it('should stop monitoring', () => {
    SystemMonitorService.start();
    SystemMonitorService.stop();
    
    // Clear previous calls
    vi.mocked(EventManager.emit).mockClear();
    
    // Fast-forward time - should not emit any more events
    vi.advanceTimersByTime(5000);
    
    expect(EventManager.emit).not.toHaveBeenCalled();
  });

  it('should emit performance metrics', () => {
    SystemMonitorService.start();
    
    // Fast-forward time to trigger performance updates
    vi.advanceTimersByTime(2000);
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'system.performance_updated',
      expect.objectContaining({
        cpuUsage: expect.any(Number),
        memoryUsage: expect.any(Number),
        fps: expect.any(Number),
        responseTime: expect.any(Number),
        errorRate: expect.any(Number)
      }),
      'SystemMonitorService'
    );
  });

  it('should return system health status', () => {
    const health = SystemMonitorService.getSystemHealth();
    
    expect(health).toHaveProperty('rf4sProcess');
    expect(health).toHaveProperty('gameDetected');
    expect(health).toHaveProperty('configLoaded');
    expect(health).toHaveProperty('servicesRunning');
    expect(health).toHaveProperty('connectionStable');
    expect(health).toHaveProperty('lastActivity');
  });

  it('should return performance metrics', () => {
    const performance = SystemMonitorService.getPerformanceMetrics();
    
    expect(performance).toHaveProperty('cpuUsage');
    expect(performance).toHaveProperty('memoryUsage');
    expect(performance).toHaveProperty('fps');
    expect(performance).toHaveProperty('responseTime');
    expect(performance).toHaveProperty('errorRate');
  });

  it('should return complete system status', () => {
    const status = SystemMonitorService.getSystemStatus();
    
    expect(status).toHaveProperty('health');
    expect(status).toHaveProperty('performance');
    expect(status.health).toHaveProperty('rf4sProcess');
    expect(status.performance).toHaveProperty('cpuUsage');
  });

  it('should report errors and increment error count', () => {
    const initialMetrics = SystemMonitorService.getPerformanceMetrics();
    const initialErrorRate = initialMetrics.errorRate;
    
    SystemMonitorService.reportError('Test error');
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'system.error',
      expect.objectContaining({
        error: 'Test error',
        timestamp: expect.any(Date)
      }),
      'SystemMonitorService'
    );
  });

  it('should update connection status', () => {
    SystemMonitorService.updateConnectionStatus(true);
    
    const health = SystemMonitorService.getSystemHealth();
    expect(health.connectionStable).toBe(true);
    expect(health.rf4sProcess).toBe(true);
  });

  it('should update game detection status', () => {
    SystemMonitorService.updateGameDetection(true);
    
    const health = SystemMonitorService.getSystemHealth();
    expect(health.gameDetected).toBe(true);
  });

  it('should handle RF4S connection events', () => {
    SystemMonitorService.start();
    
    // Simulate RF4S connected event
    const subscribeCall = vi.mocked(EventManager.subscribe).mock.calls.find(
      call => call[0] === 'rf4s.connected'
    );
    
    expect(subscribeCall).toBeDefined();
    if (subscribeCall) {
      const handler = subscribeCall[1];
      handler({});
      
      const health = SystemMonitorService.getSystemHealth();
      expect(health.rf4sProcess).toBe(true);
      expect(health.connectionStable).toBe(true);
    }
  });

  it('should handle RF4S disconnection events', () => {
    SystemMonitorService.start();
    
    // Simulate RF4S disconnected event
    const subscribeCall = vi.mocked(EventManager.subscribe).mock.calls.find(
      call => call[0] === 'rf4s.disconnected'
    );
    
    expect(subscribeCall).toBeDefined();
    if (subscribeCall) {
      const handler = subscribeCall[1];
      handler({});
      
      const health = SystemMonitorService.getSystemHealth();
      expect(health.rf4sProcess).toBe(false);
      expect(health.connectionStable).toBe(false);
    }
  });

  it('should handle game detection events', () => {
    SystemMonitorService.start();
    
    // Simulate game detected event
    const subscribeCall = vi.mocked(EventManager.subscribe).mock.calls.find(
      call => call[0] === 'game.detected'
    );
    
    expect(subscribeCall).toBeDefined();
    if (subscribeCall) {
      const handler = subscribeCall[1];
      handler({});
      
      const health = SystemMonitorService.getSystemHealth();
      expect(health.gameDetected).toBe(true);
    }
  });
});
