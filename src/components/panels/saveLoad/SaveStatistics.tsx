
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

interface SaveStatisticsProps {
  saveSlots: any[];
}

const SaveStatistics: React.FC<SaveStatisticsProps> = ({ saveSlots }) => {
  return (
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
  );
};

export default SaveStatistics;
