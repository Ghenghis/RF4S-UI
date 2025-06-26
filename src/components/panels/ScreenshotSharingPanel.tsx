
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Camera, Share2, Download, Copy, Settings, Image } from 'lucide-react';

const ScreenshotSharingPanel: React.FC = () => {
  const [includeSettings, setIncludeSettings] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [description, setDescription] = useState('');
  const [shareTitle, setShareTitle] = useState('My RF4S Setup');

  const handleTakeScreenshot = () => {
    console.log('Taking enhanced screenshot...');
    // Future: Capture with overlays and settings
  };

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}...`);
    // Future: Share to various platforms
  };

  return (
    <div className="space-y-4">
      {/* Screenshot Options */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-400" />
            Screenshot Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-settings" className="text-white">Include Settings Overlay</Label>
            <Switch
              id="include-settings"
              checked={includeSettings}
              onCheckedChange={setIncludeSettings}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-stats" className="text-white">Include Statistics</Label>
            <Switch
              id="include-stats"
              checked={includeStats}
              onCheckedChange={setIncludeStats}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="watermark" className="text-white">RF4S Watermark</Label>
            <Switch
              id="watermark"
              checked={watermark}
              onCheckedChange={setWatermark}
            />
          </div>

          <Button onClick={handleTakeScreenshot} className="w-full bg-blue-600 hover:bg-blue-700">
            <Camera className="h-4 w-4 mr-2" />
            Take Enhanced Screenshot
          </Button>
        </CardContent>
      </Card>

      {/* Share Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-400" />
            Share Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-title" className="text-white">Setup Title</Label>
            <Input
              id="share-title"
              value={shareTitle}
              onChange={(e) => setShareTitle(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="My Amazing RF4S Setup"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white resize-none"
              placeholder="Describe your fishing setup, techniques, and tips..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => handleShare('community')} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Share to Community
            </Button>
            <Button 
              onClick={() => handleShare('discord')} 
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Share to Discord
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Screenshots */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Image className="h-5 w-5 text-yellow-400" />
            Recent Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gray-600 rounded"></div>
                  <div>
                    <p className="text-sm text-white">Setup Screenshot #{i}</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-white border-gray-600">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-white border-gray-600">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-white border-gray-600">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenshotSharingPanel;
