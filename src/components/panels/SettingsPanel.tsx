
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { useRF4SStore } from '../../stores/rf4sStore';
import { Save, RefreshCw, Download, Upload } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const { config, updateConfig } = useRF4SStore();
  const [activeTab, setActiveTab] = useState('general');

  const handleSaveSettings = () => {
    console.log('Saving settings...');
    // TODO: Implement settings save
  };

  const handleResetSettings = () => {
    console.log('Resetting settings...');
    // TODO: Implement settings reset
  };

  const handleExportSettings = () => {
    const settings = JSON.stringify(config, null, 2);
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rf4s-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            console.log('Importing settings:', settings);
            // TODO: Update store with imported settings
          } catch (error) {
            console.error('Error importing settings:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings Dashboard</h2>
        <div className="flex space-x-2">
          <Button onClick={handleSaveSettings} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button onClick={handleResetSettings} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button onClick={handleExportSettings} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button onClick={handleImportSettings} size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3">Script Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="script-enabled">Enable Script</Label>
                <Switch
                  id="script-enabled"
                  checked={config.script.enabled}
                  onCheckedChange={(checked) => 
                    updateConfig('script', { enabled: checked })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Script Mode</Label>
                <select 
                  value={config.script.mode}
                  onChange={(e) => updateConfig('script', { mode: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                >
                  <option value="auto">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="assistance">Assistance</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Sensitivity: {config.script.sensitivity}</Label>
                <Slider
                  value={[config.script.sensitivity]}
                  onValueChange={([value]) => updateConfig('script', { sensitivity: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Delay (seconds)</Label>
                <Input
                  type="number"
                  value={config.script.delay}
                  onChange={(e) => updateConfig('script', { delay: parseFloat(e.target.value) })}
                  min="0"
                  step="0.1"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="detection" className="space-y-4 mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3">Detection Confidence Levels</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Spool Confidence: {config.detection.spoolConfidence}</Label>
                <Slider
                  value={[config.detection.spoolConfidence]}
                  onValueChange={([value]) => updateConfig('detection', { spoolConfidence: value })}
                  max={1}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label>Fish Bite: {config.detection.fishBite}</Label>
                <Slider
                  value={[config.detection.fishBite]}
                  onValueChange={([value]) => updateConfig('detection', { fishBite: value })}
                  max={1}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label>Rod Tip: {config.detection.rodTip}</Label>
                <Slider
                  value={[config.detection.rodTip]}
                  onValueChange={([value]) => updateConfig('detection', { rodTip: value })}
                  max={1}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="snag-detection">Snag Detection</Label>
                <Switch
                  id="snag-detection"
                  checked={config.detection.snagDetection}
                  onCheckedChange={(checked) => 
                    updateConfig('detection', { snagDetection: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="image-verification">Image Verification</Label>
                <Switch
                  id="image-verification"
                  checked={config.detection.imageVerification}
                  onCheckedChange={(checked) => 
                    updateConfig('detection', { imageVerification: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4 mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3">Automation Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bottom-enabled">Bottom Fishing</Label>
                <Switch
                  id="bottom-enabled"
                  checked={config.automation.bottomEnabled}
                  onCheckedChange={(checked) => 
                    updateConfig('automation', { bottomEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Bottom Wait Time (seconds)</Label>
                <Input
                  type="number"
                  value={config.automation.bottomWaitTime}
                  onChange={(e) => updateConfig('automation', { bottomWaitTime: parseInt(e.target.value) })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="spin-enabled">Spin Fishing</Label>
                <Switch
                  id="spin-enabled"
                  checked={config.automation.spinEnabled}
                  onCheckedChange={(checked) => 
                    updateConfig('automation', { spinEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Spin Retrieve Speed: {config.automation.spinRetrieveSpeed}%</Label>
                <Slider
                  value={[config.automation.spinRetrieveSpeed]}
                  onValueChange={([value]) => updateConfig('automation', { spinRetrieveSpeed: value })}
                  max={100}
                  min={0}
                  step={5}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3">Advanced Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cast Delay Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min (seconds)</Label>
                    <Input
                      type="number"
                      value={config.automation.castDelayMin}
                      onChange={(e) => updateConfig('automation', { castDelayMin: parseFloat(e.target.value) })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max (seconds)</Label>
                    <Input
                      type="number"
                      value={config.automation.castDelayMax}
                      onChange={(e) => updateConfig('automation', { castDelayMax: parseFloat(e.target.value) })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>OCR Confidence: {config.detection.ocrConfidence}</Label>
                <Slider
                  value={[config.detection.ocrConfidence]}
                  onValueChange={([value]) => updateConfig('detection', { ocrConfidence: value })}
                  max={1}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pirk-enabled">Pirk Fishing</Label>
                <Switch
                  id="pirk-enabled"
                  checked={config.automation.pirkEnabled}
                  onCheckedChange={(checked) => 
                    updateConfig('automation', { pirkEnabled: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
