
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGlobalStore } from '../../store/GlobalStore';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Wifi, Globe, Server, Activity, Signal, AlertCircle } from 'lucide-react';

interface NetworkMetrics {
  latency: number;
  bandwidth: number;
  packetsLost: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdate: Date;
}

const NetworkStatusPanel: React.FC = () => {
  const { systemStatus } = useGlobalStore();
  const { connected } = useRF4SStore();
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    latency: 0,
    bandwidth: 0,
    packetsLost: 0,
    connectionQuality: 'good',
    lastUpdate: new Date()
  });

  useEffect(() => {
    // Simulate network metrics updates
    const interval = setInterval(() => {
      setNetworkMetrics({
        latency: 15 + Math.random() * 10,
        bandwidth: 50 + Math.random() * 30,
        packetsLost: Math.random() * 2,
        connectionQuality: connected ? 'good' : 'fair',
        lastUpdate: new Date()
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [connected]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-400 border-green-400';
      case 'good':
        return 'text-blue-400 border-blue-400';
      case 'fair':
        return 'text-yellow-400 border-yellow-400';
      case 'poor':
        return 'text-red-400 border-red-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const getSignalStrength = () => {
    if (networkMetrics.latency < 20) return 'Strong';
    if (networkMetrics.latency < 50) return 'Good';
    if (networkMetrics.latency < 100) return 'Fair';
    return 'Weak';
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-500" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Overall Status</span>
            <Badge variant="outline" className={connected ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Connection Quality</span>
            <Badge variant="outline" className={getQualityColor(networkMetrics.connectionQuality)}>
              {networkMetrics.connectionQuality}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Signal Strength</span>
            <span className="text-white font-mono text-xs">{getSignalStrength()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            Network Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Latency</div>
              <div className="text-blue-400 font-mono">{networkMetrics.latency.toFixed(1)}ms</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Bandwidth</div>
              <div className="text-green-400 font-mono">{networkMetrics.bandwidth.toFixed(1)} Mbps</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Packet Loss</div>
              <div className="text-yellow-400 font-mono">{networkMetrics.packetsLost.toFixed(2)}%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Uptime</div>
              <div className="text-purple-400 font-mono">{Math.floor((systemStatus.runtime || 0) / 60)}min</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-500" />
            Server Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">API Server</span>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Online
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Game Bridge</span>
            <Badge variant="outline" className={connected ? "text-green-400 border-green-400" : "text-yellow-400 border-yellow-400"}>
              {connected ? 'Active' : 'Standby'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Config Sync</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Synced
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-500" />
            Traffic Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Data Sent</span>
            <span className="text-white font-mono">{(Math.random() * 1000).toFixed(0)} KB</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Data Received</span>
            <span className="text-white font-mono">{(Math.random() * 2000).toFixed(0)} KB</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Requests/min</span>
            <span className="text-white font-mono">{Math.floor(Math.random() * 20) + 5}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Signal className="w-3 h-3 text-green-400" />
          <span className="text-gray-400">Network monitoring active</span>
        </div>
        <span className="text-gray-400">
          Updated {Math.floor((Date.now() - networkMetrics.lastUpdate.getTime()) / 1000)}s ago
        </span>
      </div>
    </div>
  );
};

export default NetworkStatusPanel;
