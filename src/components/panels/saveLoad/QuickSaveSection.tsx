
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Save, Upload } from 'lucide-react';

interface QuickSaveSectionProps {
  newSaveName: string;
  onSaveNameChange: (name: string) => void;
  onSave: () => void;
  onAutoSave: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const QuickSaveSection: React.FC<QuickSaveSectionProps> = ({
  newSaveName,
  onSaveNameChange,
  onSave,
  onAutoSave,
  onImport
}) => {
  return (
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
            onChange={(e) => onSaveNameChange(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white text-xs h-7 flex-1"
          />
          <Button
            onClick={onSave}
            disabled={!newSaveName.trim()}
            className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAutoSave}
            className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 flex-1"
          >
            Auto Save
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={onImport}
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
  );
};

export default QuickSaveSection;
