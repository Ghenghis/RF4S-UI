
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Monitor } from 'lucide-react';

interface SyncStatusSectionProps {
  isHealthy: boolean;
  syncMetrics: any;
  onForceSync: () => void;
}

const SyncStatusSection: React.FC<SyncStatusSectionProps> = ({
  isHealthy,
  syncMetrics,
  onForceSync
}) => {
  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400';
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-500" />
          Sync Status
          <Badge variant="outline" className={getStatusColor(isHealthy)}>
            {isHealthy ? 'Healthy' : 'Issues'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-300">Last Sync</span>
          <span className="text-blue-400">
            {syncMetrics.lastSyncTime ? 
              new Date(syncMetrics.lastSyncTime).toLocaleTimeString() : 
              'Never'
            }
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-300">Latency</span>
          <span className="text-yellow-400">{syncMetrics.latency || 0}ms</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-300">Missed Syncs</span>
          <span className={syncMetrics.missedSyncs > 0 ? 'text-red-400' : 'text-green-400'}>
            {syncMetrics.missedSyncs || 0}
          </span>
        </div>
        <Button
          onClick={onForceSync}
          className="w-full h-6 text-xs bg-blue-600 hover:bg-blue-700"
        >
          Force Sync
        </Button>
      </CardContent>
    </Card>
  );
};

export default SyncStatusSection;
