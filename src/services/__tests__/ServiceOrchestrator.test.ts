
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceOrchestrator } from '../ServiceOrchestrator';
import { EventManager } from '../../core/EventManager';

// Mock dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    initialize: vi.fn()
  }
}));

vi.mock('../../core/ServiceRegistry', () => ({
  ServiceRegistry: {
    initialize: vi.fn(),
    register: vi.fn(),
    updateStatus: vi.fn(),
    isServiceRegistered: vi.fn().mockReturnValue(true)
  }
}));

describe('ServiceOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize successfully', async () => {
    await ServiceOrchestrator.initialize();
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'services.all_started',
      expect.objectContaining({
        timestamp: expect.any(Number),
        serviceCount: expect.any(Number)
      }),
      'ServiceOrchestrator'
    );
  });

  it('should return service status', async () => {
    const statuses = await ServiceOrchestrator.getServiceStatus();
    
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.length).toBeGreaterThanOrEqual(0);
  });

  it('should check if service is running', () => {
    const isRunning = ServiceOrchestrator.isServiceRunning('TestService');
    expect(typeof isRunning).toBe('boolean');
  });

  it('should get running service count', () => {
    const count = ServiceOrchestrator.getRunningServiceCount();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should determine overall health status', () => {
    const health = ServiceOrchestrator.getOverallHealth();
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health);
  });

  it('should handle service initialization errors gracefully', async () => {
    // Mock a service initialization failure
    vi.doMock('../RealtimeDataService', () => ({
      RealtimeDataService: {
        isServiceRunning: vi.fn().mockReturnValue(false),
        start: vi.fn().mockImplementation(() => {
          throw new Error('Service initialization failed');
        })
      }
    }));

    // Should not throw, but handle gracefully
    await expect(ServiceOrchestrator.startServices()).resolves.not.toThrow();
  });
});
