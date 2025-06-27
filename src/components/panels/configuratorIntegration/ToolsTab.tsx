
import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Database, RefreshCw } from 'lucide-react';

interface ToolsTabProps {
  isLoading: boolean;
  onCreateBackup: () => void;
  onReloadConfiguration: () => void;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  isLoading,
  onCreateBackup,
  onReloadConfiguration
}) => {
  return (
    <div className="space-y-4 mt-4">
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="font-semibold mb-3 flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Configuration Tools
        </h3>
        
        <div className="space-y-3">
          <Button
            onClick={onCreateBackup}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Database className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          
          <Button
            onClick={onReloadConfiguration}
            disabled={isLoading}
            variant="outline"
            className="w-full border-gray-600 hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ToolsTab;
