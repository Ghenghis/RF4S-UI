
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/utils';
import SystemMonitorPanel from '../panels/SystemMonitorPanel';
import { useSystemMonitorEvents } from '../../hooks/useSystemMonitorEvents';

// Mock the hook
vi.mock('../../hooks/useSystemMonitorEvents');

const mockUseSystemMonitorEvents = vi.mocked(useSystemMonitorEvents);

describe('SystemMonitorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseSystemMonitorEvents.mockReturnValue({
      systemMetrics: {
        cpuUsage: 45,
        memoryUsage: 256,
        fps: 60,
        temperature: 55
      },
      connectionStatus: {
        connected: true,
        lastUpdate: new Date()
      },
      requestSystemUpdate: vi.fn(),
      reportUIError: vi.fn()
    });
  });

  it('should render system monitor panel', () => {
    render(<SystemMonitorPanel />);
    
    expect(screen.getByText('System Monitor')).toBeInTheDocument();
  });

  it('should display system metrics', () => {
    render(<SystemMonitorPanel />);
    
    expect(screen.getByText(/CPU Usage/)).toBeInTheDocument();
    expect(screen.getByText(/45%/)).toBeInTheDocument();
    expect(screen.getByText(/Memory/)).toBeInTheDocument();
    expect(screen.getByText(/256/)).toBeInTheDocument();
    expect(screen.getByText(/FPS/)).toBeInTheDocument();
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  it('should show connection status', () => {
    render(<SystemMonitorPanel />);
    
    expect(screen.getByText(/Connected/)).toBeInTheDocument();
  });

  it('should show disconnected state when not connected', () => {
    mockUseSystemMonitorEvents.mockReturnValue({
      systemMetrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        fps: 0,
        temperature: 0
      },
      connectionStatus: {
        connected: false,
        lastUpdate: null
      },
      requestSystemUpdate: vi.fn(),
      reportUIError: vi.fn()
    });

    render(<SystemMonitorPanel />);
    
    expect(screen.getByText(/Disconnected/)).toBeInTheDocument();
  });

  it('should handle high CPU usage alerts', () => {
    mockUseSystemMonitorEvents.mockReturnValue({
      systemMetrics: {
        cpuUsage: 95,
        memoryUsage: 256,
        fps: 60,
        temperature: 55
      },
      connectionStatus: {
        connected: true,
        lastUpdate: new Date()
      },
      requestSystemUpdate: vi.fn(),
      reportUIError: vi.fn()
    });

    render(<SystemMonitorPanel />);
    
    expect(screen.getByText(/95%/)).toBeInTheDocument();
    // Could add alert indicators for high usage
  });
});
