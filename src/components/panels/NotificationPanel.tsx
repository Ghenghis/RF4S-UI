
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

const NotificationPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();

  const handleNotificationToggle = (type: string, enabled: boolean) => {
    updateConfig('system', {
      ...config.system,
      [`${type}NotificationsEnabled`]: enabled
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleNotificationToggle('email', val)}
            label="Enable email alerts"
            size="sm"
          />
          <Input
            placeholder="your@email.com"
            className="bg-gray-700 border-gray-600 text-white text-xs h-7"
          />
          <div className="space-y-2">
            <ToggleSwitch
              checked={true}
              onChange={() => {}}
              label="Fish caught alerts"
              size="sm"
            />
            <ToggleSwitch
              checked={false}
              onChange={() => {}}
              label="Session end alerts"
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            Discord Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={false}
            onChange={(val) => handleNotificationToggle('discord', val)}
            label="Enable Discord webhooks"
            size="sm"
          />
          <Input
            placeholder="Discord webhook URL"
            className="bg-gray-700 border-gray-600 text-white text-xs h-7"
          />
          <ToggleSwitch
            checked={false}
            onChange={() => {}}
            label="Send screenshots"
            size="sm"
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-green-500" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleSwitch
            checked={true}
            onChange={(val) => handleNotificationToggle('push', val)}
            label="Browser notifications"
            size="sm"
          />
          <ToggleSwitch
            checked={false}
            onChange={() => {}}
            label="Sound alerts"
            size="sm"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-green-400 border-green-400">
          2 Active
        </Badge>
        <span className="text-gray-400">Notifications ready</span>
      </div>
    </div>
  );
};

export default NotificationPanel;
