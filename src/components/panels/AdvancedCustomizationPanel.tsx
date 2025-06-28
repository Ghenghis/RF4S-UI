
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Palette, Layout, Monitor, Settings, Save } from 'lucide-react';

const AdvancedCustomizationPanel: React.FC = () => {
  const [theme, setTheme] = useState('dark');
  const [panelOpacity, setPanelOpacity] = useState([85]);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [panelSpacing, setPanelSpacing] = useState([8]);
  const [borderRadius, setBorderRadius] = useState([6]);

  const themes = [
    { id: 'dark', name: 'Dark Ocean', color: 'bg-gray-800' },
    { id: 'blue', name: 'Deep Blue', color: 'bg-blue-800' },
    { id: 'green', name: 'Forest Lake', color: 'bg-green-800' },
    { id: 'purple', name: 'Twilight', color: 'bg-purple-800' },
  ];

  const handleSaveCustomization = () => {
    const customization = {
      theme,
      panelOpacity: panelOpacity[0],
      animationsEnabled,
      compactMode,
      touchMode,
      panelSpacing: panelSpacing[0],
      borderRadius: borderRadius[0]
    };
    
    console.log('Saving customization:', customization);
    // Here you would save to local storage or backend
  };

  return (
    <div className="space-y-4 max-w-md">
      {/* Theme Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4 text-pink-400" />
            Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-2 rounded border-2 transition-all ${
                  theme === t.id ? 'border-pink-400' : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className={`w-full h-6 rounded ${t.color} mb-1`}></div>
                <p className="text-xs text-white">{t.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Layout className="h-4 w-4 text-blue-400" />
            Layout Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="compact-mode" className="text-white text-sm">Compact Mode</Label>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="touch-mode" className="text-white text-sm">Touch Mode</Label>
            <Switch
              id="touch-mode"
              checked={touchMode}
              onCheckedChange={setTouchMode}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white text-sm">Panel Spacing: {panelSpacing[0]}px</Label>
            <Slider
              value={panelSpacing}
              onValueChange={setPanelSpacing}
              max={20}
              min={0}
              step={2}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Effects */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Monitor className="h-4 w-4 text-green-400" />
            Visual Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white text-sm">Panel Opacity: {panelOpacity[0]}%</Label>
            <Slider
              value={panelOpacity}
              onValueChange={setPanelOpacity}
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white text-sm">Border Radius: {borderRadius[0]}px</Label>
            <Slider
              value={borderRadius}
              onValueChange={setBorderRadius}
              max={20}
              min={0}
              step={2}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="text-white text-sm">Animations</Label>
            <Switch
              id="animations"
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSaveCustomization}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Customization
      </Button>
    </div>
  );
};

export default AdvancedCustomizationPanel;
