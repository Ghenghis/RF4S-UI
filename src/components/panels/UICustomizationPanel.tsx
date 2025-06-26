
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Palette, Layout, Monitor, Smartphone, Save } from 'lucide-react';

const UICustomizationPanel: React.FC = () => {
  const [theme, setTheme] = useState('dark');
  const [panelOpacity, setPanelOpacity] = useState([85]);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [touchMode, setTouchMode] = useState(false);

  const themes = [
    { id: 'dark', name: 'Dark Ocean', color: 'bg-gray-800' },
    { id: 'blue', name: 'Deep Blue', color: 'bg-blue-800' },
    { id: 'green', name: 'Forest Lake', color: 'bg-green-800' },
    { id: 'purple', name: 'Twilight', color: 'bg-purple-800' },
  ];

  return (
    <div className="space-y-4">
      {/* Theme Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-pink-400" />
            Color Themes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === t.id ? 'border-pink-400' : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className={`w-full h-8 rounded ${t.color} mb-2`}></div>
                <p className="text-sm text-white">{t.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layout className="h-5 w-5 text-blue-400" />
            Layout Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="compact-mode" className="text-white">Compact Mode</Label>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="text-white">Smooth Animations</Label>
            <Switch
              id="animations"
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Panel Opacity</Label>
            <Slider
              value={panelOpacity}
              onValueChange={setPanelOpacity}
              max={100}
              min={20}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-400">{panelOpacity[0]}% opacity</p>
          </div>
        </CardContent>
      </Card>

      {/* Device Optimization */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Monitor className="h-5 w-5 text-green-400" />
            Device Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-400" />
              <Label htmlFor="touch-mode" className="text-white">Touch-Friendly Mode</Label>
            </div>
            <Switch
              id="touch-mode"
              checked={touchMode}
              onCheckedChange={setTouchMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
              Desktop Layout
            </Button>
            <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
              Tablet Layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button className="flex-1 bg-pink-600 hover:bg-pink-700">
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
            <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UICustomizationPanel;
