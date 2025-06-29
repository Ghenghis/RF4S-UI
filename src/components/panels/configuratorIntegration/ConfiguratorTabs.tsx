
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import ServerStatusTab from './ServerStatusTab';
import ConfigurationTab from './ConfigurationTab';
import ToolsTab from './ToolsTab';

interface ServerStatus {
  server: {
    running: boolean;
    port: number;
    host: string;
  };
  webServer: {
    running: boolean;
    port: number;
  };
  htmlServer: {
    running: boolean;
    port: number;
  };
  endpoints: string[];
}

interface ConfiguratorTabsProps {
  serverStatus: ServerStatus | null;
  isLoading: boolean;
  configData: any;
  onStartServer: () => void;
  onStopServer: () => void;
  onOpenConfigurator: () => void;
  onOpenHTMLConfigurator: () => void;
  onCreateBackup: () => void;
  onReloadConfiguration: () => void;
}

const ConfiguratorTabs: React.FC<ConfiguratorTabsProps> = ({
  serverStatus,
  isLoading,
  configData,
  onStartServer,
  onStopServer,
  onOpenConfigurator,
  onOpenHTMLConfigurator,
  onCreateBackup,
  onReloadConfiguration
}) => {
  return (
    <Tabs defaultValue="server" className="h-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-800">
        <TabsTrigger value="server">Server Status</TabsTrigger>
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>

      <TabsContent value="server">
        <ServerStatusTab
          serverStatus={serverStatus}
          isLoading={isLoading}
          onStartServer={onStartServer}
          onStopServer={onStopServer}
          onOpenConfigurator={onOpenConfigurator}
          onOpenHTMLConfigurator={onOpenHTMLConfigurator}
        />
      </TabsContent>

      <TabsContent value="config">
        <ConfigurationTab configData={configData} />
      </TabsContent>

      <TabsContent value="tools">
        <ToolsTab
          isLoading={isLoading}
          onCreateBackup={onCreateBackup}
          onReloadConfiguration={onReloadConfiguration}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ConfiguratorTabs;
