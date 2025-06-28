
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { EventManager } from '../../core/EventManager';
import ConfiguratorIntegrationPanel from '../panels/ConfiguratorIntegrationPanel';
import { useConfiguratorIntegration } from '../../hooks/useConfiguratorIntegration';

// Mock the hook and EventManager
vi.mock('../../hooks/useConfiguratorIntegration');
vi.mock('../../core/EventManager', () => ({
  EventManager: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  }
}));

const mockUseConfiguratorIntegration = vi.mocked(useConfiguratorIntegration);

describe('Integration Flow Tests', () => {
  const createMockHookReturn = (overrides = {}) => ({
    serverStatus: {
      server: { running: false, port: 3001, host: 'localhost' },
      webServer: { running: false, port: 8080 },
      htmlServer: { running: false, port: 3002 },
      endpoints: []
    },
    isLoading: false,
    configData: null,
    loadServerStatus: vi.fn(),
    loadConfigData: vi.fn(),
    handleStartServer: vi.fn(),
    handleStopServer: vi.fn(),
    handleOpenConfigurator: vi.fn(),
    handleCreateBackup: vi.fn(),
    handleOpenHTMLConfigurator: vi.fn(),
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete server startup flow', async () => {
    const mockStartServer = vi.fn().mockImplementation(async () => {
      // Simulate server startup by updating the mock return
      mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
        serverStatus: {
          server: { running: true, port: 3001, host: 'localhost' },
          webServer: { running: true, port: 8080 },
          htmlServer: { running: true, port: 3002 },
          endpoints: ['GET:/api/config', 'POST:/api/config']
        },
        handleStartServer: mockStartServer
      }));
    });

    // Start with servers stopped
    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      handleStartServer: mockStartServer
    }));

    const { rerender } = render(<ConfiguratorIntegrationPanel />);
    
    // Should show start button initially
    expect(screen.getByText('Start Server')).toBeInTheDocument();
    expect(screen.getByText('Stopped')).toBeInTheDocument();
    
    // Click start server
    fireEvent.click(screen.getByText('Start Server'));
    
    await waitFor(() => {
      expect(mockStartServer).toHaveBeenCalled();
    });

    // Re-render with updated state
    rerender(<ConfiguratorIntegrationPanel />);
    
    // Should now show running state and open buttons
    expect(screen.getByText('Stop Server')).toBeInTheDocument();
    expect(screen.getByText('Open Configurator')).toBeInTheDocument();
    expect(screen.getByText('Open HTML Configurator')).toBeInTheDocument();
  });

  it('should handle server shutdown flow', async () => {
    const mockStopServer = vi.fn().mockImplementation(async () => {
      // Simulate server shutdown
      mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
        handleStopServer: mockStopServer
      }));
    });

    // Start with servers running
    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      serverStatus: {
        server: { running: true, port: 3001, host: 'localhost' },
        webServer: { running: true, port: 8080 },
        htmlServer: { running: true, port: 3002 },
        endpoints: ['GET:/api/config']
      },
      handleStopServer: mockStopServer
    }));

    const { rerender } = render(<ConfiguratorIntegrationPanel />);
    
    // Should show stop button and open buttons
    expect(screen.getByText('Stop Server')).toBeInTheDocument();
    expect(screen.getByText('Open Configurator')).toBeInTheDocument();
    
    // Click stop server
    fireEvent.click(screen.getByText('Stop Server'));
    
    await waitFor(() => {
      expect(mockStopServer).toHaveBeenCalled();
    });

    // Re-render with updated state
    rerender(<ConfiguratorIntegrationPanel />);
    
    // Should now show start button
    expect(screen.getByText('Start Server')).toBeInTheDocument();
    expect(screen.queryByText('Open Configurator')).not.toBeInTheDocument();
  });

  it('should handle configuration loading and backup creation flow', async () => {
    const mockLoadConfig = vi.fn();
    const mockCreateBackup = vi.fn();

    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      configData: {
        VERSION: '1.0.0',
        SCRIPT: { SPOOL_CONFIDENCE: 0.8 }
      },
      loadConfigData: mockLoadConfig,
      handleCreateBackup: mockCreateBackup
    }));

    render(<ConfiguratorIntegrationPanel />);
    
    // Navigate to Tools tab
    fireEvent.click(screen.getByText('Tools'));
    
    // Click create backup
    fireEvent.click(screen.getByText('Create Backup'));
    
    await waitFor(() => {
      expect(mockCreateBackup).toHaveBeenCalled();
    });

    // Click reload configuration
    fireEvent.click(screen.getByText('Reload Configuration'));
    
    await waitFor(() => {
      expect(mockLoadConfig).toHaveBeenCalled();
    });
  });

  it('should handle error states gracefully', async () => {
    const mockStartServer = vi.fn().mockRejectedValue(new Error('Start failed'));

    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      handleStartServer: mockStartServer,
      isLoading: false
    }));

    render(<ConfiguratorIntegrationPanel />);
    
    fireEvent.click(screen.getByText('Start Server'));
    
    await waitFor(() => {
      expect(mockStartServer).toHaveBeenCalled();
    });

    // Component should still be rendered and functional
    expect(screen.getByText('Configurator Integration')).toBeInTheDocument();
  });

  it('should handle loading states during operations', async () => {
    let isLoading = false;
    const mockStartServer = vi.fn().mockImplementation(async () => {
      isLoading = true;
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      isLoading = false;
    });

    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      isLoading,
      handleStartServer: mockStartServer
    }));

    const { rerender } = render(<ConfiguratorIntegrationPanel />);
    
    const startButton = screen.getByText('Start Server');
    expect(startButton).not.toBeDisabled();
    
    fireEvent.click(startButton);
    
    // Update mock to reflect loading state
    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      isLoading: true,
      handleStartServer: mockStartServer
    }));
    
    rerender(<ConfiguratorIntegrationPanel />);
    
    // Buttons should be disabled during loading
    const buttons = screen.getAllByRole('button');
    const disabledButtons = buttons.filter(button => button.hasAttribute('disabled'));
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('should handle tab switching correctly', () => {
    mockUseConfiguratorIntegration.mockReturnValue(createMockHookReturn({
      configData: {
        VERSION: '1.0.0',
        SCRIPT: { SPOOL_CONFIDENCE: 0.8 }
      }
    }));

    render(<ConfiguratorIntegrationPanel />);
    
    // Should start on Server Status tab
    expect(screen.getByText('Server Status')).toBeInTheDocument();
    
    // Switch to Configuration tab
    fireEvent.click(screen.getByText('Configuration'));
    expect(screen.getByText('Current Configuration')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    
    // Switch to Tools tab
    fireEvent.click(screen.getByText('Tools'));
    expect(screen.getByText('Configuration Tools')).toBeInTheDocument();
    expect(screen.getByText('Create Backup')).toBeInTheDocument();
  });
});
