
import React from 'react';
import { Button } from '../../ui/button';
import { Server, RefreshCw } from 'lucide-react';

interface ConfiguratorIntegrationHeaderProps {
  onRefresh: () => void;
}

const ConfiguratorIntegrationHeader: React.FC<ConfiguratorIntegrationHeaderProps> = ({
  onRefresh
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold flex items-center">
        <Server className="h-5 w-5 mr-2" />
        Configurator Integration
      </h2>
      <Button
        onClick={onRefresh}
        size="sm"
        variant="outline"
        className="border-gray-600 hover:bg-gray-800"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
    </div>
  );
};

export default ConfiguratorIntegrationHeader;
