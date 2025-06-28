
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import ConfiguratorIntegrationPanel from '../panels/ConfiguratorIntegrationPanel';
import { useConfiguratorIntegration } from '../../hooks/useConfiguratorIntegration';

// Mock the hook
vi.mock('../../hooks/useConfiguratorIntegration');

const mockUseConfiguratorIntegration = vi.mocked(useConfiguratorIntegration);

describe('ConfiguratorIntegrationPanel', () => {
  const mockHookReturn = {
    serverStatus: {
      server: {
        running: true,
        port: 3001,
        host: 'localhost'
      },
      webServer: {
        running: true,
        port: 8080
      },
      htmlServer: {
        running: true,
        port: 3002
      },
      endpoints: ['GET:/api/config', 'POST:/api/config']
    },
    isLoading: false,
    configData: {
      VERSION: '1.0.0',
      SCRIPT: { SPOOL_CONFIDENCE: 0.8 },
      FRICTION_BRAKE: { INITIAL: 50 },
      KEEPNET: { CAPACITY: 100 }
    },
    loadServerStatus: vi.fn(),
    loadConfigData: vi.fn(),
    handleStartServer: vi.fn(),
    handleStopServer: vi.fn(),
    handleOpenConfigurator: vi.fn(),
    handleCreateBackup: vi.fn(),
    handleOpenHTMLConfigurator: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfiguratorIntegration.mockReturnValue(mockHookReturn);
  });

  it('should render configurator integration panel', () => {
    render(<ConfiguratorIntegrationPanel />);
    
    expect(screen.getByText('Configurator Integration')).toBeInTheDocument();
  });

  it('should display server status correctly', () => {
    render(<ConfiguratorIntegrationPanel />);
    
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('localhost:3001')).toBeInTheDocument();
    expect(screen.getByText('Port 8080')).toBeInTheDocument();
    expect(screen.getByText('Port 3002')).toBeInTheDocument();
  });

  it('should show stop server button when server is running', () => {
    render(<ConfiguratorIntegrationPanel />);
    
    expect(screen.getByText('Stop Server')).toBeInTheDocument();
    expect(screen.getByText('Open Configurator')).toBeInTheDocument();
  });

  it('should show start server button when server is stopped', () => {
    mockUseConfiguratorIntegration.mockReturnValue({
      ...mockHookReturn,
      serverStatus: {
        ...mockHookReturn.serverStatus!,
        server: { ...mockHookReturn.serverStatus!.server, running: false }
      }
    });

    render(<ConfiguratorIntegrationPanel />);
    
    expect(screen.getByText('Start Server')).toBeInTheDocument();
    expect(screen.queryByText('Stop Server')).not.toBeInTheDocument();
  });

  it('should handle start server button click', async () => {
    mockUseConfiguratorIntegration.mockReturnValue({
      ...mockHookReturn,
      serverStatus: {
        ...mockHookReturn.serverStatus!,
        server: { ...mockHookReturn.serverStatus!.server, running: false }
      }
    });

    render(<ConfiguratorIntegrationPanel />);
    
    const startButton = screen.getByText('Start Server');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockHookReturn.handleStartServer).toHaveBeenCalled();
    });
  });

  it('should handle stop server button click', async () => {
    render(<ConfiguratorIntegrationPanel />);
    
    const stopButton = screen.getByText('Stop Server');
    fireEvent.click(stopButton);
    
    await waitFor(() => {
      expect(mockHookReturn.handleStopServer).toHaveBeenCalled();
    });
  });

  it('should handle open configurator button click', async () => {
    render(<ConfiguratorIntegrationPanel />);
    
    const openButton = screen.getByText('Open Configurator');
    fireEvent.click(openButton);
    
    await waitFor(() => {
      expect(mockHookReturn.handleOpenConfigurator).toHaveBeenCalled();
    });
  });

  it('should handle open HTML configurator button click', async () => {
    render(<ConfiguratorIntegrationPanel />);
    
    const openHTMLButton = screen.getByText('Open HTML Configurator');
    fireEvent.click(openHTMLButton);
    
    await waitFor(() => {
      expect(mockHookReturn.handleOpenHTMLConfigurator).toHaveBeenCalled();
    });
  });

  it('should display configuration data in configuration tab', () => {
    render(<ConfiguratorIntegrationPanel />);
    
    // Click on Configuration tab
    const configTab = screen.getByText('Configuration');
    fireEvent.click(configTab);
    
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('0.8')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should handle create backup in tools tab', async () => {
    render(<ConfiguratorIntegrationPanel />);
    
    // Click on Tools tab
    const toolsTab = screen.getByText('Tools');
    fireEvent.click(toolsTab);
    
    const createBackupButton = screen.getByText('Create Backup');
    fireEvent.click(createBackupButton);
    
    await waitFor(() => {
      expect(mockHookReturn.handleCreateBackup).toHaveBeenCalled();
    });
  });

  it('should handle refresh button click', async () => {
    render(<ConfiguratorIntegrationPanel />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockHookReturn.loadServerStatus).toHaveBeenCalled();
    });
  });

  it('should display loading state correctly', () => {
    mockUseConfiguratorIntegration.mockReturnValue({
      ...mockHookReturn,
      isLoading: true
    });

    render(<ConfiguratorIntegrationPanel />);
    
    const buttons = screen.getAllByRole('button');
    const disabledButtons = buttons.filter(button => button.hasAttribute('disabled'));
    
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('should display API endpoints correctly', () => {
    render(<ConfiguratorIntegrationPanel />);
    
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('/api/config')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
  });

  it('should handle null server status gracefully', () => {
    mockUseConfiguratorIntegration.mockReturnValue({
      ...mockHookReturn,
      serverStatus: null
    });

    render(<ConfiguratorIntegrationPanel />);
    
    expect(screen.getByText('Configurator Integration')).toBeInTheDocument();
    // Should not crash and should still render the panel structure
  });
});
