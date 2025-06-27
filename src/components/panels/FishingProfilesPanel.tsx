
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import ToggleSwitch from '../ui/ToggleSwitch';
import { Target, MapPin, Settings } from 'lucide-react';

const FishingProfilesPanel: React.FC = () => {
  const { 
    fishingProfiles, 
    activeFishingProfile, 
    setActiveFishingProfile, 
    updateFishingProfile 
  } = useRF4SStore();

  const handleProfileSwitch = (profileId: string) => {
    setActiveFishingProfile(profileId);
  };

  const toggleProfileActive = (profileId: string) => {
    const profile = fishingProfiles.find(p => p.id === profileId);
    if (profile) {
      updateFishingProfile(profileId, { active: !profile.active });
    }
  };

  const activeProfile = fishingProfiles.find(p => p.id === activeFishingProfile);

  return (
    <div className="space-y-2">
      {/* Active Profile Display */}
      <div className="text-center bg-gray-700/30 border border-gray-600 rounded p-2">
        <h4 className="text-xs font-medium text-gray-300 mb-1">Active Profile</h4>
        <div className="text-xs font-semibold text-orange-400">
          {activeProfile?.name || 'None'}
        </div>
        {activeProfile && (
          <div className="text-xs text-gray-400 mt-1">
            {activeProfile.technique} • {activeProfile.location}
          </div>
        )}
      </div>

      {/* Profile List */}
      <div className="space-y-1">
        {fishingProfiles.map((profile) => (
          <div
            key={profile.id}
            className={`p-2 rounded border transition-all ${
              activeFishingProfile === profile.id
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <button
              onClick={() => handleProfileSwitch(profile.id)}
              className="text-left w-full mb-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-white text-xs">{profile.name}</div>
                <div className={`text-xs px-1 rounded ${
                  profile.active ? 'text-green-400 bg-green-400/10' : 'text-gray-500'
                }`}>
                  {profile.successRate}%
                </div>
              </div>
              <div className="text-xs text-gray-400 capitalize flex items-center space-x-2">
                <span>{profile.technique}</span>
                <span>•</span>
                <span>{profile.rodType}</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.location}</span>
              </div>
            </button>
            
            <div className="flex items-center justify-between">
              <ToggleSwitch
                checked={profile.active}
                onChange={() => toggleProfileActive(profile.id)}
                label="Active"
                size="sm"
              />
              <div className="text-xs text-gray-400 flex items-center space-x-1">
                <Settings className="w-3 h-3" />
                <span>Cast: {profile.settings.castDistance}m</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Profile Button */}
      <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors text-xs">
        + Add New Profile
      </button>
    </div>
  );
};

export default FishingProfilesPanel;
