
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import ToggleSwitch from '../ui/ToggleSwitch';

const FishingProfilesPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { profiles } = config;

  const handleProfileSwitch = (profileId: string) => {
    updateConfig('profiles', { active: profileId });
  };

  const toggleAutoSwitch = (profileId: string) => {
    const updatedProfiles = {
      ...profiles.profiles,
      [profileId]: {
        ...profiles.profiles[profileId],
        autoSwitch: !profiles.profiles[profileId].autoSwitch,
      },
    };
    updateConfig('profiles', { profiles: updatedProfiles });
  };

  const toggleProfileEnabled = (profileId: string) => {
    const updatedProfiles = {
      ...profiles.profiles,
      [profileId]: {
        ...profiles.profiles[profileId],
        enabled: !profiles.profiles[profileId].enabled,
      },
    };
    updateConfig('profiles', { profiles: updatedProfiles });
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Active Profile</h4>
        <div className="text-lg font-semibold text-orange-400">
          {profiles.profiles[profiles.active]?.name || 'None'}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(profiles.profiles).map(([id, profile]) => (
          <div
            key={id}
            className={`p-3 rounded-lg border transition-all ${
              profiles.active === id
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => handleProfileSwitch(id)}
                className="text-left flex-1"
              >
                <div className="font-medium text-white">{profile.name}</div>
                <div className="text-xs text-gray-400 capitalize">{profile.technique}</div>
              </button>
            </div>
            
            <div className="space-y-2">
              <ToggleSwitch
                checked={profile.enabled}
                onChange={() => toggleProfileEnabled(id)}
                label="Enabled"
                size="sm"
              />
              <ToggleSwitch
                checked={profile.autoSwitch}
                onChange={() => toggleAutoSwitch(id)}
                label="Auto Switch"
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>

      <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
        Add New Profile
      </button>
    </div>
  );
};

export default FishingProfilesPanel;
