
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ConfiguratorIntegrationService } from '../../services/ConfiguratorIntegrationService';
import { HTMLConfiguratorServer } from '../../services/backend/HTMLConfiguratorServer';
import { useToast } from '../ui/use-toast';
import ConfiguratorIntegrationHeader from './configuratorIntegration/ConfiguratorIntegrationHeader';
import ServerStatusTab from './configuratorIntegration/ServerStatusTab';
import ConfigurationTab from './configuratorIntegration/ConfigurationTab';
import ToolsTab from './configuratorIntegration/ToolsTab';

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

const ConfiguratorIntegrationPanel: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configData, setConfigData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadServerStatus();
    loadConfigData();
  }, []);

  const loadServerStatus = async () => {
    try {
      const status = await ConfiguratorIntegrationService.getStatus();
      const htmlConfig = HTMLConfiguratorServer.getConfig();
      
      setServerStatus({
        server: {
          running: status.services.configuratorServer,
          port: 3001,
          host: 'localhost'
        },
        webServer: {
          running: status.services.webServer,
          port: 8080
        },
        htmlServer: {
          running: status.services.htmlServer,
          port: htmlConfig.port
        },
        endpoints: [
          'GET:/api/config',
          'POST:/api/config',
          'GET:/api/profiles',
          'GET:/api/status'
        ]
      });
    } catch (error) {
      console.error('Failed to load server status:', error);
      toast({
        title: "Error",
        description: "Failed to load server status",
        variant: "destructive"
      });
    }
  };

  const loadConfigData = async () => {
    try {
      const result = await ConfiguratorIntegrationService.loadConfiguration();
      if (result.success) {
        setConfigData(result.data);
      }
    } catch (error) {
      console.error('Failed to load config data:', error);
    }
  };

  const handleStartServer = async () => {
    setIsLoading(true);
    try {
      await ConfiguratorIntegrationService.initialize();
      await loadServerStatus();
      toast({
        title: "Success",
        description: "Configurator server started successfully"
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      toast({
        title: "Error",
        description: "Failed to start configurator server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopServer = async () => {
    setIsLoading(true);
    try {
      await ConfiguratorIntegrationService.shutdown();
      await loadServerStatus();
      toast({
        title: "Success",
        description: "Configurator server stopped successfully"
      });
    } catch (error) {
      console.error('Failed to stop server:', error);
      toast({
        title: "Error",
        description: "Failed to stop configurator server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfigurator = () => {
    try {
      ConfiguratorIntegrationService.openConfigurator();
      toast({
        title: "Success",
        description: "Configurator opened successfully"
      });
    } catch (error) {
      console.error('Failed to open configurator:', error);
      toast({
        title: "Error",
        description: "Failed to open configurator",
        variant: "destructive"
      });
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const result = await ConfiguratorIntegrationService.createBackup('Manual backup from panel');
      if (result.success) {
        toast({
          title: "Success",
          description: "Configuration backup created successfully"
        });
      } else {
        throw new Error(result.errors.join(', '));
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenHTMLConfigurator = async () => {
    try {
      await ConfiguratorIntegrationService.openHTMLConfigurator();
      toast({
        title: "Success",
        description: "HTML Configurator opened successfully"
      });
    } catch (error) {
      console.error('Failed to open HTML configurator:', error);
      toast({
        title: "Error",
        description: "Failed to open HTML configurator",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <ConfiguratorIntegrationHeader onRefresh={loadServerStatus} />

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
            onStartServer={handleStartServer}
            onStopServer={handleStopServer}
            onOpenConfigurator={handleOpenConfigurator}
            onOpenHTMLConfigurator={handleOpenHTMLConfigurator}
          />
        </TabsContent>

        <TabsContent value="config">
          <ConfigurationTab configData={configData} />
        </TabsContent>

        <TabsContent value="tools">
          <ToolsTab
            isLoading={isLoading}
            onCreateBackup={handleCreateBackup}
            onReloadConfiguration={loadConfigData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguratorIntegrationPanel;
