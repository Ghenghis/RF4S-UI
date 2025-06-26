
import React, { useState } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';

const ExpandedFishingProfilesPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { profiles } = config;
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<'spin' | 'float' | 'bottom' | 'pirk' | 'telescopic'>('bottom');

  const profileTypes = [
    { id: 'bottom', name: 'Bottom Fishing', color: 'bg-brown-600' },
    { id: 'spin', name: 'Spin Fishing', color: 'bg-blue-600' },
    { id: 'float', name: 'Float Fishing', color: 'bg-green-600' },
    { id: 'pirk', name: 'Pirk Fishing', color: 'bg-purple-600' },
    { id: 'telescopic', name: 'Telescopic', color: 'bg-orange-600' }
  ];

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

  const addNewProfile = () => {
    if (newProfileName.trim()) {
      const newProfileId = newProfileName.toLowerCase().replace(/\s+/g, '-');
      const updatedProfiles = {
        ...profiles.profiles,
        [newProfileId]: {
          name: newProfileName,
          technique: selectedTechnique,
          enabled: true,
          autoSwitch: false,
          settings: {}
        }
      };
      updateConfig('profiles', { profiles: updatedProfiles });
      setNewProfileName('');
    }
  };

  const deleteProfile = (profileId: string) => {
    const updatedProfiles = { ...profiles.profiles };
    delete updatedProfiles[profileId];
    updateConfig('profiles', { profiles: updatedProfiles });
    
    if (profiles.active === profileId) {
      const remainingProfiles = Object.keys(updatedProfiles);
      if (remainingProfiles.length > 0) {
        updateConfig('profiles', { active: remainingProfiles[0] });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Profile Display */}
      <div className="text-center p-3 bg-gray-800 rounded border">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Currently Active</h4>
        <div className="text-lg font-bold text-orange-400">
          {profiles.profiles[profiles.active]?.name || 'None'}
        </div>
        <div className="text-xs text-gray-400 capitalize">
          {profiles.profiles[profiles.active]?.technique || 'N/A'}
        </div>
      </div>

      {/* Profile Management */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white">All Profiles</h4>
        
        {Object.entries(profiles.profiles).map(([id, profile]) => (
          <div
            key={id}
            className={`p-3 rounded border transition-all ${
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
                <div className="font-medium text-white text-sm flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    profileTypes.find(t => t.id === profile.technique)?.color || 'bg-gray-500'
                  }`} />
                  {profile.name}
                </div>
                <div className="text-xs text-gray-400 capitalize">{profile.technique}</div>
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingProfile(editingProfile === id ? null : id)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deleteProfile(id)}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
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

            {editingProfile === id && (
              <div className="mt-2 pt-2 border-t border-gray-600 space-y-2">
                <div className="text-xs text-gray-300">Profile Settings</div>
                <CustomSlider
                  label="Sensitivity"
                  value={profile.settings.sensitivity || 0.8}
                  onChange={(value) => {
                    const updatedProfiles = {
                      ...profiles.profiles,
                      [id]: {
                        ...profile,
                        settings: { ...profile.settings, sensitivity: value }
                      }
                    };
                    updateConfig('profiles', { profiles: updatedProfiles });
                  }}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                />
                <CustomSlider
                  label="Wait Time"
                  value={profile.settings.waitTime || 5}
                  onChange={(value) => {
                    const updatedProfiles = {
                      ...profiles.profiles,
                      [id]: {
                        ...profile,
                        settings: { ...profile.settings, waitTime: value }
                      }
                    };
                    updateConfig('profiles', { profiles: updatedProfiles });
                  }}
                  min={1}
                  max={60}
                  step={1}
                  unit="s"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Profile */}
      <div className="p-3 border border-dashed border-gray-600 rounded space-y-2">
        <h5 className="text-xs font-medium text-gray-300">Add New Profile</h5>
        <input
          type="text"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          placeholder="Profile name..."
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
        />
        <select
          value={selectedTechnique}
          onChange={(e) => setSelectedTechnique(e.target.value as any)}
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
        >
          {profileTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        <button
          onClick={addNewProfile}
          className="w-full p-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors text-xs flex items-center justify-center"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Profile
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="p-2 bg-green-600 hover:bg-green-700 rounded text-white text-xs flex items-center justify-center">
          <Play className="h-3 w-3 mr-1" />
          Start Active
        </button>
        <button className="p-2 bg-red-600 hover:bg-red-700 rounded text-white text-xs flex items-center justify-center">
          <Pause className="h-3 w-3 mr-1" />
          Stop All
        </button>
      </div>
    </div>
  );
};

export default ExpandedFishingProfilesPanel;
