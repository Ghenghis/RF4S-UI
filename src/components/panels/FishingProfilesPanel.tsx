
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Fish, Settings, Play, Pause, RotateCcw } from 'lucide-react';

const FishingProfilesPanel: React.FC = () => {
  const { config, updateConfig, scriptRunning } = useRF4SStore();

  const profiles = [
    { id: 'bottom', name: 'Bottom Fishing', technique: 'bottom', active: true },
    { id: 'spin', name: 'Spin Fishing', technique: 'spin', active: false },
    { id: 'float', name: 'Float Fishing', technique: 'float', active: false },
    { id: 'telescopic', name: 'Telescopic', technique: 'telescopic', active: false }
  ];

  const handleProfileSwitch = (profileId: string) => {
    updateConfig('profiles', {
      ...config.profiles,
      active: profileId
    });
  };

  const handleProfileToggle = (profileId: string, enabled: boolean) => {
    updateConfig('profiles', {
      ...config.profiles,
      profiles: {
        ...config.profiles.profiles,
        [profileId]: {
          ...config.profiles.profiles[profileId],
          enabled
        }
      }
    });
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Fish className="w-4 h-4 text-blue-500" />
            Active Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Current Technique</span>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {config.profiles?.active || 'Bottom'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={scriptRunning ? "destructive" : "default"}
              className="flex-1 text-xs h-7"
            >
              {scriptRunning ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
              {scriptRunning ? 'Pause' : 'Start'}
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-green-500" />
            Available Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="p-2 bg-gray-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{profile.name}</span>
                <Badge 
                  variant="outline" 
                  className={profile.active ? "text-green-400 border-green-400" : "text-gray-400 border-gray-400"}
                >
                  {profile.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <ToggleSwitch
                  checked={config.profiles?.profiles?.[profile.id]?.enabled || false}
                  onChange={(val) => handleProfileToggle(profile.id, val)}
                  label="Enabled"
                  size="sm"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-6"
                  onClick={() => handleProfileSwitch(profile.id)}
                  disabled={profile.active}
                >
                  Switch
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Quick Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CustomSlider
            label="Cast Power"
            value={config.profiles?.profiles?.[config.profiles?.active || 'bottom']?.settings?.castPower || 5}
            onChange={(val) => {
              const activeProfile = config.profiles?.active || 'bottom';
              updateConfig('profiles', {
                ...config.profiles,
                profiles: {
                  ...config.profiles.profiles,
                  [activeProfile]: {
                    ...config.profiles.profiles[activeProfile],
                    settings: {
                      ...config.profiles.profiles[activeProfile]?.settings,
                      castPower: val
                    }
                  }
                }
              });
            }}
            min={1}
            max={10}
            unit=""
          />
          <ToggleSwitch
            checked={config.profiles?.profiles?.[config.profiles?.active || 'bottom']?.autoSwitch || false}
            onChange={(val) => {
              const activeProfile = config.profiles?.active || 'bottom';
              updateConfig('profiles', {
                ...config.profiles,
                profiles: {
                  ...config.profiles.profiles,
                  [activeProfile]: {
                    ...config.profiles.profiles[activeProfile],
                    autoSwitch: val
                  }
                }
              });
            }}
            label="Auto-switch when conditions change"
            size="sm"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FishingProfilesPanel;
