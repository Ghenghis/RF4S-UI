
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Network, Wifi, Server, Globe, Activity, Shield } from 'lucide-react';

const NetworkStatusPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

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

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-green-500" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Internet</div>
              <div className="text-green-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Connected
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">RF4 Servers</div>
              <div className="text-green-400 flex items-center gap-1">
                <Server className="w-3 h-3" />
                Online
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Ping</div>
              <div className="text-blue-400 font-mono">23ms</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Bandwidth</div>
              <div className="text-yellow-400">156 Mbps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Network Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleNetworkToggle('Monitoring', val)}
            label="Monitor connection stability"
            size="sm"
          />
          <CustomSlider
            label="Check Interval"
            value={30}
            onChange={(val) => handleNetworkSettingChange('CheckInterval', val)}
            min={5}
            max={300}
            unit="s"
          />
          <ToggleSwitch
            checked={false}
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
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleNetworkToggle('VPN', val)}
            label="VPN detection"
            size="sm"
          />
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleNetworkToggle('Proxy', val)}
            label="Use proxy for requests"
            size="sm"
          />
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>External IP:</span>
              <span className="text-blue-400 font-mono">203.0.113.45</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span className="text-green-400">US East</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          Stable
        </Badge>
        <span className="text-gray-400">All systems operational</span>
      </div>
    </div>
  );
};

export default NetworkStatusPanel;
