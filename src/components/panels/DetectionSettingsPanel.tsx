
import React from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import CustomSlider from '../ui/CustomSlider';
import ToggleSwitch from '../ui/ToggleSwitch';

const DetectionSettingsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const { detection } = config;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <CustomSlider
          label="Spool Confidence"
          value={detection.spoolConfidence}
          onChange={(value) => updateConfig('detection', { spoolConfidence: value })}
          min={0.1}
          max={1.0}
          step={0.01}
        />
        
        <CustomSlider
          label="Fish Bite"
          value={detection.fishBite}
          onChange={(value) => updateConfig('detection', { fishBite: value })}
          min={0.1}
          max={1.0}
          step={0.01}
        />
        
        <CustomSlider
          label="Rod Tip"
          value={detection.rodTip}
          onChange={(value) => updateConfig('detection', { rodTip: value })}
          min={0.1}
          max={1.0}
          step={0.01}
        />
        
        <CustomSlider
          label="OCR Confidence"
          value={detection.ocrConfidence}
          onChange={(value) => updateConfig('detection', { ocrConfidence: value })}
          min={0.1}
          max={1.0}
          step={0.01}
        />
      </div>

      <div className="pt-4 border-t border-gray-700 space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Detection Features</h4>
        
        <ToggleSwitch
          checked={detection.snagDetection}
          onChange={(checked) => updateConfig('detection', { snagDetection: checked })}
          label="Snag Detection"
          description="Automatically detect line snags"
        />
        
        <ToggleSwitch
          checked={detection.imageVerification}
          onChange={(checked) => updateConfig('detection', { imageVerification: checked })}
          label="Image Verification"
          description="Use image analysis for verification"
        />
      </div>
    </div>
  );
};

export default DetectionSettingsPanel;
