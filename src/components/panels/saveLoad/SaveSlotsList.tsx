
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Download, Trash2, FileText } from 'lucide-react';

interface SaveSlot {
  id: string;
  name: string;
  data: {
    version: string;
    timestamp: string;
    gameState: {
      currentSession?: {
        total?: number;
      };
    };
  };
  lastModified: string;
}

interface SaveSlotsListProps {
  saveSlots: SaveSlot[];
  selectedSlot: string;
  onLoad: (slotId: string) => void;
  onExport: (slotId: string) => void;
  onDelete: (slotId: string) => void;
}

const SaveSlotsList: React.FC<SaveSlotsListProps> = ({
  saveSlots,
  selectedSlot,
  onLoad,
  onExport,
  onDelete
}) => {
  return (
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
                    onClick={() => onLoad(slot.id)}
                    className="h-5 px-2 text-xs bg-green-600 hover:bg-green-700 flex-1"
                  >
                    Load
                  </Button>
                  <Button
                    onClick={() => onExport(slot.id)}
                    className="h-5 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onDelete(slot.id)}
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
  );
};

export default SaveSlotsList;
