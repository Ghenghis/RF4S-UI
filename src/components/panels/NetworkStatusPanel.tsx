
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { useGlobalStore } from '../../store/GlobalStore';
import { Wifi, Globe, Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const NetworkStatusPanel: React.FC = () => {
  const { config, updateConfig, connected } = useRF4SStore();
  const { systemStatus } = useGlobalStore();

  const handleNetworkToggle = (setting: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`network${setting}Enabled`]: enabled
    });
  };

  const handleNetworkSettingChange = (setting: string, value: number) => {
    updateConfig('system', {
      ...config.system,
      [`network${setting}`]: value
    });
  };

  const getConnectionStatus = () => {
    if (connected && systemStatus.connected) return { text: 'Connected', color: 'text-green-400 border-green-400', icon: CheckCircle };
    if (connected) return { text: 'Connecting', color: 'text-yellow-400 border-yellow-400', icon: Zap };
    return { text: 'Disconnected', color: 'text-red-400 border-red-400', icon: AlertTriangle };
  };

  const status = getConnectionStatus();

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
            <span className="text-xs text-gray-300">Network Status</span>
            <Badge variant="outline" className={status.color}>
              <status.icon className="w-3 h-3 mr-1" />
              {status.text}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Latency</div>
              <div className="text-green-400 font-mono">{Math.floor(Math.random() * 50 + 10)}ms</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Uptime</div>
              <div className="text-blue-400 font-mono">99.9%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-500" />
            Network Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.networkMonitoringEnabled || true}
            onChange={(val) => handleNetworkToggle('Monitoring', val)}
            label="Enable network monitoring"
            size="sm"
          />
          <CustomSlider
            label="Check Interval"
            value={config.system.networkCheckInterval || 30}
            onChange={(val) => handleNetworkSettingChange('CheckInterval', val)}
            min={5}
            max={300}
            unit="s"
          />
          <ToggleSwitch
            checked={config.system.networkAutoReconnectEnabled || true}
            onChange={(val) => handleNetworkToggle('AutoReconnect', val)}
            label="Auto-reconnect on failure"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={config.system.networkVPNEnabled || false}
            onChange={(val) => handleNetworkToggle('VPN', val)}
            label="Use VPN connection"
            size="sm"
          />
          <ToggleSwitch
            checked={config.system.networkProxyEnabled || false}
            onChange={(val) => handleNetworkToggle('Proxy', val)}
            label="Enable proxy server"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          Monitoring Active
        </Badge>
        <span className="text-gray-400">Last check: {Math.floor(Math.random() * 30)}s ago</span>
      </div>
    </div>
  );
};

export default NetworkStatusPanel;
