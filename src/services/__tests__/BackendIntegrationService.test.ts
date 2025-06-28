
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackendIntegrationService } from '../BackendIntegrationService';
import { EventManager } from '../../core/EventManager';

// Mock EventManager
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

describe('BackendIntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await BackendIntegrationService.initialize();
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'backend.integration_initialized',
      expect.any(Object),
      'BackendIntegrationService'
    );
  });

  it('should get integration status', () => {
    const status = BackendIntegrationService.getIntegrationStatus();
    
    expect(status).toHaveProperty('integrationStatus');
    expect(status).toHaveProperty('lastUpdate');
    expect(['connected', 'disconnected', 'connecting', 'error']).toContain(status.integrationStatus);
  });

  it('should get connection status', () => {
    const connections = BackendIntegrationService.getConnectionStatus();
    
    expect(typeof connections).toBe('object');
  });

  it('should check if service is healthy', () => {
    const isHealthy = BackendIntegrationService.isHealthy();
    
    expect(typeof isHealthy).toBe('boolean');
  });

  it('should send requests', async () => {
    const result = await BackendIntegrationService.sendRequest('/test', 'GET');
    
    expect(result).toHaveProperty('success');
  });

  it('should handle service destruction', () => {
    BackendIntegrationService.destroy();
    
    const status = BackendIntegrationService.getIntegrationStatus();
    expect(status.integrationStatus).toBe('disconnected');
  });
});
