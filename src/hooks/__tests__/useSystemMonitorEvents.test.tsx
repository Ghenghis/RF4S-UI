
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemMonitorEvents } from '../useSystemMonitorEvents';
import { mockEventManager } from '../../test/mocks/serviceMocks';

// Mock the EventManager and dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: mockEventManager
}));

vi.mock('../useUIEventSubscriptions', () => ({
  useUIEventSubscriptions: vi.fn((panelName, handlers) => ({
    emitUIAction: vi.fn()
  }))
}));

describe('useSystemMonitorEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default system metrics', () => {
    const { result } = renderHook(() => useSystemMonitorEvents());
    
    expect(result.current.systemMetrics).toEqual({
      cpuUsage: 0,
      memoryUsage: 0,
      fps: 0,
      temperature: 0
    });
    
    expect(result.current.connectionStatus).toEqual({
      connected: false,
      lastUpdate: null
    });
  });

  it('should update system metrics when resource update is received', () => {
    const { result } = renderHook(() => useSystemMonitorEvents());
    
    // Simulate receiving system resource update
    act(() => {
      const mockData = {
        cpuUsage: 75,
        memoryUsage: 256,
        fps: 60,
        temperature: 65
      };
      
      // Simulate the event handler being called
      const handlers = vi.mocked(require('../useUIEventSubscriptions').useUIEventSubscriptions).mock.calls[0][1];
      handlers.handleSystemResourceUpdate(mockData);
    });

    expect(result.current.systemMetrics.cpuUsage).toBe(75);
    expect(result.current.systemMetrics.memoryUsage).toBe(256);
    expect(result.current.systemMetrics.fps).toBe(60);
    expect(result.current.systemMetrics.temperature).toBe(65);
    expect(result.current.connectionStatus.connected).toBe(true);
  });

  it('should update connection status on backend health update', () => {
    const { result } = renderHook(() => useSystemMonitorEvents());
    
    act(() => {
      const mockHealthData = {
        integrationStatus: 'connected'
      };
      
      const handlers = vi.mocked(require('../useUIEventSubscriptions').useUIEventSubscriptions).mock.calls[0][1];
      handlers.handleBackendHealthUpdate(mockHealthData);
    });

    expect(result.current.connectionStatus.connected).toBe(true);
    expect(result.current.connectionStatus.lastUpdate).toBeInstanceOf(Date);
  });

  it('should handle service errors by updating connection status', () => {
    const { result } = renderHook(() => useSystemMonitorEvents());
    
    act(() => {
      const mockErrorData = {
        service: 'SystemMonitor',
        error: 'Connection lost'
      };
      
      const handlers = vi.mocked(require('../useUIEventSubscriptions').useUIEventSubscriptions).mock.calls[0][1];
      handlers.handleServiceError(mockErrorData);
    });

    expect(result.current.connectionStatus.connected).toBe(false);
  });

  it('should provide utility functions', () => {
    const { result } = renderHook(() => useSystemMonitorEvents());
    
    expect(typeof result.current.requestSystemUpdate).toBe('function');
    expect(typeof result.current.reportUIError).toBe('function');
  });
});
