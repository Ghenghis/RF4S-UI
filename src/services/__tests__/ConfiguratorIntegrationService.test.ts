
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfiguratorIntegrationService } from '../ConfiguratorIntegrationService';
import { EventManager } from '../../core/EventManager';
import { ServiceRegistry } from '../../core/ServiceRegistry';

// Mock dependencies
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

vi.mock('../../core/ServiceRegistry', () => ({
  ServiceRegistry: {
    register: vi.fn(),
    updateStatus: vi.fn(),
    isServiceRegistered: vi.fn().mockReturnValue(true)
  }
}));

vi.mock('../integration/IntegrationConfigManager', () => ({
  IntegrationConfigManager: vi.fn().mockImplementation(() => ({
    loadConfiguration: vi.fn().mockResolvedValue({
      success: true,
      data: { VERSION: '1.0.0', SCRIPT: { SPOOL_CONFIDENCE: 0.8 } }
    }),
    createBackup: vi.fn().mockResolvedValue({
      success: true,
      data: { backupId: 'backup-123', timestamp: Date.now() }
    })
  }))
}));

describe('ConfiguratorIntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    ConfiguratorIntegrationService.destroy();
  });

  it('should initialize successfully', async () => {
    const result = await ConfiguratorIntegrationService.initialize();
    
    expect(result).toBe(true);
    expect(ServiceRegistry.register).toHaveBeenCalledWith(
      'ConfiguratorIntegrationService',
      expect.any(Object),
      ['BackendIntegrationService'],
      expect.objectContaining({
        type: 'integration',
        priority: 'medium'
      })
    );
    expect(EventManager.emit).toHaveBeenCalledWith(
      'configurator.service_initialized',
      expect.objectContaining({
        config: expect.any(Object),
        timestamp: expect.any(Number)
      }),
      'ConfiguratorIntegrationService'
    );
  });

  it('should not initialize twice', async () => {
    await ConfiguratorIntegrationService.initialize();
    const result = await ConfiguratorIntegrationService.initialize();
    
    expect(result).toBe(true);
    // Should only register once
    expect(ServiceRegistry.register).toHaveBeenCalledTimes(1);
  });

  it('should start configurator successfully', async () => {
    await ConfiguratorIntegrationService.initialize();
    
    const result = await ConfiguratorIntegrationService.startConfigurator();
    
    expect(result).toBe(true);
    expect(EventManager.emit).toHaveBeenCalledWith(
      'configurator.server_started',
      expect.objectContaining({
        host: 'localhost',
        port: 3001,
        timestamp: expect.any(Number)
      }),
      'ConfiguratorIntegrationService'
    );
  });

  it('should stop configurator successfully', async () => {
    await ConfiguratorIntegrationService.initialize();
    await ConfiguratorIntegrationService.startConfigurator();
    
    const result = await ConfiguratorIntegrationService.stopConfigurator();
    
    expect(result).toBe(true);
    expect(EventManager.emit).toHaveBeenCalledWith(
      'configurator.server_stopped',
      expect.objectContaining({
        timestamp: expect.any(Number)
      }),
      'ConfiguratorIntegrationService'
    );
  });

  it('should load configuration data', async () => {
    await ConfiguratorIntegrationService.initialize();
    
    const result = await ConfiguratorIntegrationService.loadConfiguration();
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('VERSION', '1.0.0');
    expect(result.data).toHaveProperty('SCRIPT');
  });

  it('should create backup successfully', async () => {
    await ConfiguratorIntegrationService.initialize();
    
    const result = await ConfiguratorIntegrationService.createBackup('Test backup');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('backupId');
    expect(result.data).toHaveProperty('timestamp');
  });

  it('should open configurator when running', async () => {
    await ConfiguratorIntegrationService.initialize();
    await ConfiguratorIntegrationService.startConfigurator();
    
    const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    
    ConfiguratorIntegrationService.openConfigurator();
    
    expect(mockOpen).toHaveBeenCalledWith(
      'http://localhost:3001',
      '_blank',
      'width=1200,height=800'
    );
    
    mockOpen.mockRestore();
  });

  it('should throw error when opening configurator while not running', () => {
    expect(() => {
      ConfiguratorIntegrationService.openConfigurator();
    }).toThrow('Configurator is not running');
  });

  it('should return service status', async () => {
    await ConfiguratorIntegrationService.initialize();
    
    const status = ConfiguratorIntegrationService.getStatus();
    
    expect(status).toHaveProperty('running');
    expect(status).toHaveProperty('config');
    expect(status).toHaveProperty('initialized', true);
    expect(status).toHaveProperty('services');
  });

  it('should update configuration', async () => {
    await ConfiguratorIntegrationService.initialize();
    
    const newConfig = { port: 4001, host: '0.0.0.0' };
    ConfiguratorIntegrationService.updateConfiguration(newConfig);
    
    const status = ConfiguratorIntegrationService.getStatus();
    expect(status.config.port).toBe(4001);
    expect(status.config.host).toBe('0.0.0.0');
    
    expect(EventManager.emit).toHaveBeenCalledWith(
      'configurator.config_updated',
      expect.objectContaining({
        oldConfig: expect.any(Object),
        newConfig: expect.any(Object),
        timestamp: expect.any(Number)
      }),
      'ConfiguratorIntegrationService'
    );
  });

  it('should restart configurator', async () => {
    await ConfiguratorIntegrationService.initialize();
    await ConfiguratorIntegrationService.startConfigurator();
    
    const result = await ConfiguratorIntegrationService.restart();
    
    expect(result).toBe(true);
    // Should emit both stop and start events
    expect(EventManager.emit).toHaveBeenCalledWith(
      'configurator.server_stopped',
      expect.any(Object),
      'ConfiguratorIntegrationService'
    );
    expect(EventManager.emit).toHaveBeenCalledWith(
      'configurator.server_started',
      expect.any(Object),
      'ConfiguratorIntegrationService'
    );
  });

  it('should report healthy status when initialized and running', async () => {
    await ConfiguratorIntegrationService.initialize();
    await ConfiguratorIntegrationService.startConfigurator();
    
    expect(ConfiguratorIntegrationService.isHealthy()).toBe(true);
  });

  it('should report unhealthy status when not initialized', () => {
    expect(ConfiguratorIntegrationService.isHealthy()).toBe(false);
  });

  it('should handle shutdown properly', async () => {
    await ConfiguratorIntegrationService.initialize();
    await ConfiguratorIntegrationService.startConfigurator();
    
    await ConfiguratorIntegrationService.shutdown();
    
    expect(ServiceRegistry.updateStatus).toHaveBeenCalledWith(
      'ConfiguratorIntegrationService',
      'stopped'
    );
  });
});
