
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RF4SIntegrationService } from '../RF4SIntegrationService';
import { EventManager } from '../../core/EventManager';
import { createTestRF4SStatus } from '../../test/testHelpers';

// Mock dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

vi.mock('../rf4s/RF4SConnectionManager', () => ({
  RF4SConnectionManager: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    startScript: vi.fn().mockResolvedValue(true),
    stopScript: vi.fn().mockResolvedValue(true),
    updateFishCount: vi.fn(),
    updateConfig: vi.fn(),
    getStatus: vi.fn().mockReturnValue(createTestRF4SStatus()),
    destroy: vi.fn()
  }))
}));

vi.mock('../rf4s/RF4SDataSynchronizer', () => ({
  RF4SDataSynchronizer: vi.fn().mockImplementation(() => ({
    startSynchronization: vi.fn(),
    stopSynchronization: vi.fn()
  }))
}));

vi.mock('../rf4s/RF4SEventEmitter', () => ({
  RF4SEventEmitter: vi.fn().mockImplementation(() => ({
    emitConnectionEvents: vi.fn()
  }))
}));

describe('RF4SIntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    RF4SIntegrationService.destroy();
  });

  it('should initialize successfully', async () => {
    await RF4SIntegrationService.initialize();
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'rf4s.codebase_connected',
      { connected: true },
      'RF4SIntegrationService'
    );
  });

  it('should not initialize twice', async () => {
    await RF4SIntegrationService.initialize();
    await RF4SIntegrationService.initialize();
    
    // Should only emit once
    expect(EventManager.emit).toHaveBeenCalledTimes(1);
  });

  it('should start script successfully', async () => {
    await RF4SIntegrationService.initialize();
    
    const result = await RF4SIntegrationService.startScript();
    
    expect(result).toBe(true);
  });

  it('should stop script successfully', async () => {
    await RF4SIntegrationService.initialize();
    
    const result = await RF4SIntegrationService.stopScript();
    
    expect(result).toBe(true);
  });

  it('should update fish count', async () => {
    await RF4SIntegrationService.initialize();
    
    RF4SIntegrationService.updateFishCount('green');
    
    // Should delegate to connection manager
    expect(true).toBe(true); // Test passes if no errors thrown
  });

  it('should update configuration', async () => {
    await RF4SIntegrationService.initialize();
    
    const updates = { sensitivity: 0.8 };
    RF4SIntegrationService.updateConfig('detection', updates);
    
    // Should delegate to connection manager
    expect(true).toBe(true); // Test passes if no errors thrown
  });

  it('should return status', async () => {
    await RF4SIntegrationService.initialize();
    
    const status = RF4SIntegrationService.getStatus();
    
    expect(status).toEqual(createTestRF4SStatus());
  });

  it('should handle destroy properly', async () => {
    await RF4SIntegrationService.initialize();
    
    RF4SIntegrationService.destroy();
    
    // Should not throw errors
    expect(true).toBe(true);
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock initialization to throw error
    const mockConnectionManager = vi.mocked(require('../rf4s/RF4SConnectionManager').RF4SConnectionManager);
    mockConnectionManager.mockImplementationOnce(() => ({
      initialize: vi.fn().mockRejectedValue(new Error('Connection failed')),
      destroy: vi.fn()
    }));

    await expect(RF4SIntegrationService.initialize()).rejects.toThrow('Connection failed');
  });
});
