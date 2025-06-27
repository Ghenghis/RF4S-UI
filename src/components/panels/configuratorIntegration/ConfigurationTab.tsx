
import React from 'react';
import { Card } from '../../ui/card';
import { Settings } from 'lucide-react';

interface ConfigurationTabProps {
  configData: any;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({ configData }) => {
  return (
    <div className="space-y-4 mt-4">
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="font-semibold mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Current Configuration
        </h3>
        
        {configData && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Version:</span>
                <span className="ml-2">{configData.VERSION}</span>
              </div>
              <div>
                <span className="text-gray-400">Spool Confidence:</span>
                <span className="ml-2">{configData.SCRIPT?.SPOOL_CONFIDENCE}</span>
              </div>
              <div>
                <span className="text-gray-400">Friction Brake:</span>
                <span className="ml-2">{configData.FRICTION_BRAKE?.INITIAL}</span>
              </div>
              <div>
                <span className="text-gray-400">Keepnet Capacity:</span>
                <span className="ml-2">{configData.KEEPNET?.CAPACITY}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ConfigurationTab;
