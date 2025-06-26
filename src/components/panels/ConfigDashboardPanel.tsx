
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { useConfigManager } from '../../hooks/useConfigManager';
import { 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  TestTube, 
  Bot, 
  History,
  Settings,
  Gamepad2,
  Zap,
  Database,
  Bell,
  Pause,
  Fish
} from 'lucide-react';

const ConfigDashboardPanel: React.FC = () => {
  const {
    config,
    versions,
    currentVersionId,
    hasUnsavedChanges,
    isTestMode,
    testResults,
    updateConfig,
    saveVersion,
    revertToVersion,
    testConfiguration,
    aiOptimizeConfig,
    exportConfig,
    importConfig
  } = useConfigManager();
  
  const [activeTab, setActiveTab] = useState('script');
  const [saveDescription, setSaveDescription] = useState('');

  const handleSave = () => {
    if (saveDescription.trim()) {
      saveVersion(saveDescription);
      setSaveDescription('');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importConfig(file);
      }
    };
    input.click();
  };

  const renderScriptSettings = () => (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Script Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="smtp-verification" className="text-white">SMTP Verification</Label>
              <Switch
                id="smtp-verification"
                checked={config.SCRIPT.SMTP_VERIFICATION}
                onCheckedChange={(checked) => updateConfig('SCRIPT.SMTP_VERIFICATION', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="image-verification" className="text-white">Image Verification</Label>
              <Switch
                id="image-verification"
                checked={config.SCRIPT.IMAGE_VERIFICATION}
                onCheckedChange={(checked) => updateConfig('SCRIPT.IMAGE_VERIFICATION', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="snag-detection" className="text-white">Snag Detection</Label>
              <Switch
                id="snag-detection"
                checked={config.SCRIPT.SNAG_DETECTION}
                onCheckedChange={(checked) => updateConfig('SCRIPT.SNAG_DETECTION', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="spooling-detection" className="text-white">Spooling Detection</Label>
              <Switch
                id="spooling-detection"
                checked={config.SCRIPT.SPOOLING_DETECTION}
                onCheckedChange={(checked) => updateConfig('SCRIPT.SPOOLING_DETECTION', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Spool Confidence: {config.SCRIPT.SPOOL_CONFIDENCE}</Label>
            <Slider
              value={[config.SCRIPT.SPOOL_CONFIDENCE]}
              onValueChange={([value]) => updateConfig('SCRIPT.SPOOL_CONFIDENCE', value)}
              max={1}
              min={0.5}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Random Cast Probability: {config.SCRIPT.RANDOM_CAST_PROBABILITY}</Label>
            <Slider
              value={[config.SCRIPT.RANDOM_CAST_PROBABILITY]}
              onValueChange={([value]) => updateConfig('SCRIPT.RANDOM_CAST_PROBABILITY', value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Spod Rod Recast Delay (seconds)</Label>
            <Input
              type="number"
              value={config.SCRIPT.SPOD_ROD_RECAST_DELAY}
              onChange={(e) => updateConfig('SCRIPT.SPOD_ROD_RECAST_DELAY', parseInt(e.target.value))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderKeyBindings = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Gamepad2 className="h-5 w-5 mr-2" />
          Key Bindings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(config.KEY).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label className="text-white">{key.replace('_', ' ')}</Label>
              <Input
                value={Array.isArray(value) ? value.join(', ') : value.toString()}
                onChange={(e) => {
                  const newValue = key === 'BOTTOM_RODS' ? 
                    e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)) :
                    isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value);
                  updateConfig(`KEY.${key}`, newValue);
                }}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderProfiles = () => (
    <div className="space-y-4">
      {Object.entries(config.PROFILE).map(([profileName, profile]) => (
        <Card key={profileName} className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Fish className="h-5 w-5 mr-2" />
              {profileName} Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Cast Power Level</Label>
                <Slider
                  value={[profile.CAST_POWER_LEVEL]}
                  onValueChange={([value]) => updateConfig(`PROFILE.${profileName}.CAST_POWER_LEVEL`, value)}
                  max={10}
                  min={1}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Cast Delay</Label>
                <Input
                  type="number"
                  value={profile.CAST_DELAY}
                  onChange={(e) => updateConfig(`PROFILE.${profileName}.CAST_DELAY`, parseFloat(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            {/* Profile-specific settings */}
            {profile.FLOAT_SENSITIVITY && (
              <div className="space-y-2">
                <Label className="text-white">Float Sensitivity: {profile.FLOAT_SENSITIVITY}</Label>
                <Slider
                  value={[profile.FLOAT_SENSITIVITY]}
                  onValueChange={([value]) => updateConfig(`PROFILE.${profileName}.FLOAT_SENSITIVITY`, value)}
                  max={1}
                  min={0.1}
                  step={0.01}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderVersionHistory = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <History className="h-5 w-5 mr-2" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">{version.description}</span>
                  {version.aiOptimized && <Badge className="bg-purple-600">AI</Badge>}
                  {version.id === currentVersionId && <Badge className="bg-green-600">Current</Badge>}
                </div>
                <div className="text-xs text-gray-400">
                  {version.timestamp.toLocaleString()} - {version.user}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => revertToVersion(version.id)}
                disabled={version.id === currentVersionId}
              >
                Revert
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Config Dashboard
          </h2>
          <p className="text-sm text-gray-400">
            Edit, test, and manage RF4S configuration
            {hasUnsavedChanges && <Badge className="ml-2 bg-yellow-600">Unsaved Changes</Badge>}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={testConfiguration} disabled={isTestMode} className="bg-blue-600 hover:bg-blue-700">
            <TestTube className="h-4 w-4 mr-1" />
            {isTestMode ? 'Testing...' : 'Test Config'}
          </Button>
          
          <Button onClick={aiOptimizeConfig} className="bg-purple-600 hover:bg-purple-700">
            <Bot className="h-4 w-4 mr-1" />
            AI Optimize
          </Button>
          
          <Button onClick={exportConfig} variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button onClick={handleImport} variant="outline">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>

      {/* Save Controls */}
      {hasUnsavedChanges && (
        <Card className="mb-4 bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Describe your changes..."
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                className="flex-1 bg-gray-700 border-gray-600 text-white"
              />
              <Button onClick={handleSave} disabled={!saveDescription.trim()} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-1" />
                Save Version
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card className="mb-4 bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TestTube className="h-4 w-4 text-green-400" />
              <span className="text-white font-medium">Test Results</span>
            </div>
            {testResults.suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="text-sm text-gray-300">• {suggestion}</div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="friction">Friction</TabsTrigger>
          <TabsTrigger value="keepnet">Keepnet</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="mt-4">
          {renderScriptSettings()}
        </TabsContent>

        <TabsContent value="keys" className="mt-4">
          {renderKeyBindings()}
        </TabsContent>

        <TabsContent value="profiles" className="mt-4">
          {renderProfiles()}
        </TabsContent>

        <TabsContent value="friction" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Friction Brake Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Initial: {config.FRICTION_BRAKE.INITIAL}</Label>
                  <Slider
                    value={[config.FRICTION_BRAKE.INITIAL]}
                    onValueChange={([value]) => updateConfig('FRICTION_BRAKE.INITIAL', value)}
                    max={50}
                    min={0}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Max: {config.FRICTION_BRAKE.MAX}</Label>
                  <Slider
                    value={[config.FRICTION_BRAKE.MAX]}
                    onValueChange={([value]) => updateConfig('FRICTION_BRAKE.MAX', value)}
                    max={50}
                    min={0}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keepnet" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Keepnet Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Capacity: {config.KEEPNET.CAPACITY}</Label>
                <Slider
                  value={[config.KEEPNET.CAPACITY]}
                  onValueChange={([value]) => updateConfig('KEEPNET.CAPACITY', value)}
                  max={200}
                  min={50}
                  step={10}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Whitelist Fish (comma separated)</Label>
                <Input
                  value={config.KEEPNET.WHITELIST.join(', ')}
                  onChange={(e) => updateConfig('KEEPNET.WHITELIST', e.target.value.split(',').map(s => s.trim()))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {renderVersionHistory()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigDashboardPanel;
