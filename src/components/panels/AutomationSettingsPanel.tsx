
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import ToggleSwitch from '../ui/ToggleSwitch';
import CustomSlider from '../ui/CustomSlider';
import { Zap, Timer, Fish, Anchor, Target } from 'lucide-react';

const AutomationSettingsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { automation } = config;

  return (
    <div className="space-y-4">
      {/* Bottom Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Fish className="h-4 w-4 text-brown-400" />
          <h4 className="text-sm font-semibold text-white">Bottom Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.bottomEnabled}
          onChange={(checked) => updateConfig('automation', { bottomEnabled: checked })}
          label="Enable Bottom Automation"
          size="sm"
        />

        {automation.bottomEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-brown-400">
            <CustomSlider
              label="Wait Time"
              value={automation.bottomWaitTime}
              onChange={(value) => updateConfig('automation', { bottomWaitTime: value })}
              min={60}
              max={600}
              step={30}
              unit="s"
            />
            
            <CustomSlider
              label="Hook Delay"
              value={automation.bottomHookDelay}
              onChange={(value) => updateConfig('automation', { bottomHookDelay: value })}
              min={0.1}
              max={3.0}
              step={0.1}
              unit="s"
            />
          </div>
        )}
      </div>

      {/* Spin Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-white">Spin Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.spinEnabled}
          onChange={(checked) => updateConfig('automation', { spinEnabled: checked })}
          label="Enable Spin Automation"
          size="sm"
        />

        {automation.spinEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-blue-400">
            <CustomSlider
              label="Retrieve Speed"
              value={automation.spinRetrieveSpeed}
              onChange={(value) => updateConfig('automation', { spinRetrieveSpeed: value })}
              min={10}
              max={100}
              step={5}
              unit="%"
            />
            
            <CustomSlider
              label="Twitch Frequency"
              value={automation.spinTwitchFrequency}
              onChange={(value) => updateConfig('automation', { spinTwitchFrequency: value })}
              min={0.5}
              max={10.0}
              step={0.5}
              unit="s"
            />
          </div>
        )}
      </div>

      {/* Float Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Anchor className="h-4 w-4 text-orange-400" />
          <h4 className="text-sm font-semibold text-white">Float Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.floatEnabled || false}
          onChange={(checked) => updateConfig('automation', { floatEnabled: checked })}
          label="Enable Float Automation"
          size="sm"
        />

        {automation.floatEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-orange-400">
            <CustomSlider
              label="Float Sensitivity"
              value={automation.floatSensitivity || 0.68}
              onChange={(value) => updateConfig('automation', { floatSensitivity: value })}
              min={0.1}
              max={1.0}
              step={0.01}
            />
            
            <CustomSlider
              label="Check Delay"
              value={automation.floatCheckDelay || 1.0}
              onChange={(value) => updateConfig('automation', { floatCheckDelay: value })}
              min={0.5}
              max={5.0}
              step={0.1}
              unit="s"
            />

            <CustomSlider
              label="Pull Delay"
              value={automation.floatPullDelay || 0.5}
              onChange={(value) => updateConfig('automation', { floatPullDelay: value })}
              min={0.1}
              max={2.0}
              step={0.1}
              unit="s"
            />

            <CustomSlider
              label="Drift Timeout"
              value={automation.floatDriftTimeout || 16.0}
              onChange={(value) => updateConfig('automation', { floatDriftTimeout: value })}
              min={5.0}
              max={60.0}
              step={1.0}
              unit="s"
            />
          </div>
        )}
      </div>

      {/* Pirk Fishing Automation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-purple-400" />
          <h4 className="text-sm font-semibold text-white">Pirk Fishing</h4>
        </div>
        
        <ToggleSwitch
          checked={automation.pirkEnabled}
          onChange={(checked) => updateConfig('automation', { pirkEnabled: checked })}
          label="Enable Pirk Automation"
          size="sm"
        />

        {automation.pirkEnabled && (
          <div className="space-y-2 pl-4 border-l-2 border-purple-400">
            <CustomSlider
              label="Pirk Duration"
              value={automation.pirkDuration || 0.5}
              onChange={(value) => updateConfig('automation', { pirkDuration: value })}
              min={0.1}
              max={3.0}
              step={0.1}
              unit="s"
            />
            
            <CustomSlider
              label="Pirk Delay"
              value={automation.pirkDelay || 2.0}
              onChange={(value) => updateConfig('automation', { pirkDelay: value })}
              min={0.5}
              max={10.0}
              step={0.5}
              unit="s"
            />

            <CustomSlider
              label="Sink Timeout"
              value={automation.pirkSinkTimeout || 60.0}
              onChange={(value) => updateConfig('automation', { pirkSinkTimeout: value })}
              min={10.0}
              max={120.0}
              step={5.0}
              unit="s"
            />
          </div>
        )}
      </div>

      {/* General Automation Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-green-400" />
          <h4 className="text-sm font-semibold text-white">Cast Settings</h4>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-300">Cast Delay Range</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-400">Min Delay</label>
                <span className="text-xs text-blue-400 font-mono">{automation.castDelayMin}s</span>
              </div>
              <CustomSlider
                label=""
                value={automation.castDelayMin}
                onChange={(value) => updateConfig('automation', { castDelayMin: value })}
                min={0.5}
                max={10.0}
                step={0.5}
                unit="s"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-400">Max Delay</label>
                <span className="text-xs text-blue-400 font-mono">{automation.castDelayMax}s</span>
              </div>
              <CustomSlider
                label=""
                value={automation.castDelayMax}
                onChange={(value) => updateConfig('automation', { castDelayMax: value })}
                min={1.0}
                max={20.0}
                step={0.5}
                unit="s"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Range: {automation.castDelayMin}s - {automation.castDelayMax}s
          </div>
        </div>

        <CustomSlider
          label="Random Cast Probability"
          value={automation.randomCastProbability || 0.25}
          onChange={(value) => updateConfig('automation', { randomCastProbability: value })}
          min={0.0}
          max={1.0}
          step={0.05}
          unit=""
        />
      </div>

      {/* Automation Status */}
      <div className="p-3 bg-gray-800 rounded border">
        <h5 className="text-xs font-medium text-gray-300 mb-2">Active Automations</h5>
        <div className="space-y-1 text-xs">
          <div className={`flex justify-between ${automation.bottomEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Bottom Fishing</span>
            <span>{automation.bottomEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className={`flex justify-between ${automation.spinEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Spin Fishing</span>
            <span>{automation.spinEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className={`flex justify-between ${automation.floatEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Float Fishing</span>
            <span>{automation.floatEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className={`flex justify-between ${automation.pirkEnabled ? 'text-green-400' : 'text-gray-500'}`}>
            <span>Pirk Fishing</span>
            <span>{automation.pirkEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationSettingsPanel;
