
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/utils';
import LiveMetricsDashboard from '../LiveMetricsDashboard';
import { mockEventManager } from '../../../test/mocks/serviceMocks';

// Mock the EventManager
vi.mock('../../../core/EventManager', () => ({
  EventManager: mockEventManager
}));

// Mock the services
vi.mock('../../../services/metrics/MetricsCollectionService', () => ({
  metricsCollectionService: {
    start: vi.fn(),
    stop: vi.fn()
  }
}));

vi.mock('../../../services/realtime/EnhancedWebSocketManager', () => ({
  enhancedWebSocketManager: {
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
    getConnectionStats: vi.fn().mockReturnValue({
      connected: true,
      latency: 15,
      messagesReceived: 10
    })
  }
}));

describe('LiveMetricsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with connection status', async () => {
    render(<LiveMetricsDashboard />);
    
    expect(screen.getByText('Real-Time Connection')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('should render metric cards', async () => {
    render(<LiveMetricsDashboard />);
    
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('FPS')).toBeInTheDocument();
    expect(screen.getByText('Latency')).toBeInTheDocument();
  });

  it('should update metrics when events are received', async () => {
    render(<LiveMetricsDashboard />);
    
    // Simulate metrics update event
    const mockMetricsData = {
      timestamp: Date.now(),
      systemMetrics: {
        cpuUsage: 75,
        memoryUsage: 300,
        fps: 55,
        networkLatency: 20
      }
    };

    // Get the handler that was registered
    const metricsHandler = mockEventManager.subscribe.mock.calls.find(
      call => call[0] === 'metrics.snapshot_collected'
    )?.[1];

    if (metricsHandler) {
      metricsHandler(mockMetricsData);
    }

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('300MB')).toBeInTheDocument();
    });
  });

  it('should display alerts when thresholds are exceeded', async () => {
    render(<LiveMetricsDashboard />);
    
    // Simulate alert event
    const mockAlertData = {
      alerts: [
        { type: 'cpu', value: 85, threshold: 80 },
        { type: 'memory', value: 450, threshold: 400 }
      ]
    };

    const alertHandler = mockEventManager.subscribe.mock.calls.find(
      call => call[0] === 'metrics.alert_triggered'
    )?.[1];

    if (alertHandler) {
      alertHandler(mockAlertData);
    }

    await waitFor(() => {
      expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
      expect(screen.getByText(/CPU.*85.*exceeds threshold of 80/)).toBeInTheDocument();
    });
  });

  it('should show disconnected state when WebSocket is not connected', async () => {
    // Mock disconnected state
    vi.doMock('../../../services/realtime/EnhancedWebSocketManager', () => ({
      enhancedWebSocketManager: {
        connect: vi.fn().mockResolvedValue(false),
        disconnect: vi.fn(),
        getConnectionStats: vi.fn().mockReturnValue({
          connected: false,
          latency: 0,
          messagesReceived: 0
        })
      }
    }));

    render(<LiveMetricsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });
});
