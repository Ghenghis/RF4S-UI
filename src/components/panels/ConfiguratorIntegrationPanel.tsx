
import React from 'react';
import { useConfiguratorIntegration } from '../../hooks/useConfiguratorIntegration';
import ConfiguratorIntegrationHeader from './configuratorIntegration/ConfiguratorIntegrationHeader';
import ConfiguratorTabs from './configuratorIntegration/ConfiguratorTabs';

const ConfiguratorIntegrationPanel: React.FC = () => {
  const {
    serverStatus,
    isLoading,
    configData,
    loadServerStatus,
    loadConfigData,
    handleStartServer,
    handleStopServer,
    handleOpenConfigurator,
    handleCreateBackup,
    handleOpenHTMLConfigurator
  } = useConfiguratorIntegration();

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <ConfiguratorIntegrationHeader onRefresh={loadServerStatus} />

      <ConfiguratorTabs
        serverStatus={serverStatus}
        isLoading={isLoading}
        configData={configData}
        onStartServer={handleStartServer}
        onStopServer={handleStopServer}
        onOpenConfigurator={handleOpenConfigurator}
        onOpenHTMLConfigurator={handleOpenHTMLConfigurator}
        onCreateBackup={handleCreateBackup}
        onReloadConfiguration={loadConfigData}
      />
    </div>
  );
};

export default ConfiguratorIntegrationPanel;
