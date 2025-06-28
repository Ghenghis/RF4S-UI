
import { EventManager } from '../../core/EventManager';
import { SystemMetrics, FishingStats, RF4SStatus } from '../../types/metrics';

export class DataBroadcaster {
  broadcastMetrics(data: {
    systemMetrics: SystemMetrics;
    fishingStats: FishingStats;
    rf4sStatus: RF4SStatus;
    detectionConfig: any;
    timestamp: number;
    sessionTime: number;
    websocketConnected: boolean;
  }): void {
    EventManager.emit('realtime.metrics_updated', data, 'RealtimeDataService');
    EventManager.emit('system.resources_updated', data.systemMetrics, 'RealtimeDataService');
    EventManager.emit('fishing.stats_updated', data.fishingStats, 'RealtimeDataService');
    EventManager.emit('rf4s.status_updated', data.rf4sStatus, 'RealtimeDataService');
  }
}
