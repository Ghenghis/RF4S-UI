import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { SaveLoadService } from '../../services/SaveLoadService';
import { Save, Download, Upload, Trash2, FileText } from 'lucide-react';

const SaveLoadPanel: React.FC = () => {
  const [saveSlots, setSaveSlots] = useState<any[]>([]);
  const [newSaveName, setNewSaveName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  useEffect(() => {
    loadSaveSlots();
  }, []);

  const loadSaveSlots = () => {
    const slots = SaveLoadService.getSaveSlots();
    setSaveSlots(slots);
  };

  const handleSave = async () => {
    if (!newSaveName.trim()) return;
    
    const success = await SaveLoadService.saveSession(newSaveName);
    if (success) {
      setNewSaveName('');
      loadSaveSlots();
    }
  };

  const handleLoad = async (slotId: string) => {
    const success = await SaveLoadService.loadSession(slotId);
    if (success) {
      setSelectedSlot(slotId);
    }
  };

  const handleDelete = (slotId: string) => {
    if (confirm('Are you sure you want to delete this save?')) {
      SaveLoadService.deleteSaveSlot(slotId);
      loadSaveSlots();
    }
  };

  const handleExport = (slotId: string) => {
    const exportData = SaveLoadService.exportSave(slotId);
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rf4s-save-${slotId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = SaveLoadService.importSave(content, file.name);
      if (success) {
        loadSaveSlots();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      {/* Quick Save */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-blue-500" />
            Quick Save
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Save name..."
              value={newSaveName}
              onChange={(e) => setNewSaveName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white text-xs h-7 flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={!newSaveName.trim()}
              className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSave()}
              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 flex-1"
            >
              Auto Save
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <span className="h-6 px-2 text-xs bg-purple-600 hover:bg-purple-700 rounded flex items-center cursor-pointer">
                <Upload className="w-3 h-3 mr-1" />
                Import
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Slots */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            Save Slots ({saveSlots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {saveSlots.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">
                No saves found
              </div>
            ) : (
              saveSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-2 bg-gray-700 rounded border ${
                    selectedSlot === slot.id ? 'border-blue-500' : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white truncate">
                      {slot.name}
                    </span>
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                      v{slot.data.version}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    {new Date(slot.lastModified).toLocaleString()}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    Fish: {slot.data.gameState.currentSession?.total || 0} | 
                    Session: {Math.floor((Date.now() - new Date(slot.data.timestamp).getTime()) / 60000)}m ago
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleLoad(slot.id)}
                      className="h-5 px-2 text-xs bg-green-600 hover:bg-green-700 flex-1"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => handleExport(slot.id)}
                      className="h-5 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(slot.id)}
                      className="h-5 px-2 text-xs bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Statistics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-3">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Saves:</span>
              <span className="text-white">{saveSlots.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Storage Used:</span>
              <span className="text-yellow-400">
                {Math.round(JSON.stringify(saveSlots).length / 1024)}KB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Auto-save:</span>
              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaveLoadPanel;
