
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
    
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('connectedServices');
    expect(status).toHaveProperty('lastUpdate');
    expect(['connected', 'disconnected', 'connecting', 'error']).toContain(status.status);
  });

  it('should handle connection state changes', async () => {
    await BackendIntegrationService.updateConnectionState('connected');
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'backend.connection_state_changed',
      expect.objectContaining({
        status: 'connected'
      }),
      'BackendIntegrationService'
    );
  });

  it('should manage service connections', () => {
    BackendIntegrationService.registerService('TestService', { endpoint: '/test' });
    
    const services = BackendIntegrationService.getConnectedServices();
    expect(services).toContain('TestService');
  });

  it('should handle service health checks', async () => {
    const healthStatus = await BackendIntegrationService.checkHealth();
    
    expect(healthStatus).toHaveProperty('overall');
    expect(healthStatus).toHaveProperty('services');
    expect(['healthy', 'unhealthy', 'degraded']).toContain(healthStatus.overall);
  });

  it('should emit health updates', async () => {
    await BackendIntegrationService.checkHealth();
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'backend.health_updated',
      expect.any(Object),
      'BackendIntegrationService'
    );
  });
});
