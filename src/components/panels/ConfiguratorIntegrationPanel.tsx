
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ConfiguratorServer } from '../../services/backend/ConfiguratorServer';
import { RF4SConfigBridge } from '../../services/backend/RF4SConfigBridge';
import { useToast } from '../ui/use-toast';
import { Server, Globe, Database, Settings, RefreshCw, Play, Square } from 'lucide-react';

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
      // Simulate API call - in real implementation, this would be an actual HTTP request
      const status = {
        server: {
          running: ConfiguratorServer.isServerRunning(),
          port: 3001,
          host: 'localhost'
        },
        webServer: {
          running: true,
          port: 8080
        },
        endpoints: [
          'GET:/api/config',
          'POST:/api/config',
          'GET:/api/profiles',
          'GET:/api/status'
        ]
      };
      setServerStatus(status);
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
      const result = RF4SConfigBridge.loadConfigToDict();
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
      await ConfiguratorServer.start();
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
      await ConfiguratorServer.stop();
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
    if (serverStatus?.server.running) {
      window.open(`http://${serverStatus.server.host}:${serverStatus.server.port}`, '_blank');
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const result = RF4SConfigBridge.createBackup('Manual backup from panel');
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

  return (
    <div className="h-full bg-gray-900 text-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Configurator Integration
        </h2>
        <Button
          onClick={loadServerStatus}
          size="sm"
          variant="outline"
          className="border-gray-600 hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="server" className="h-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="server">Server Status</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="server" className="space-y-4 mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Server Status
            </h3>
            
            {serverStatus && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Configurator Server</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={serverStatus.server.running ? "default" : "secondary"}>
                      {serverStatus.server.running ? "Running" : "Stopped"}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {serverStatus.server.host}:{serverStatus.server.port}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Web Server</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={serverStatus.webServer.running ? "default" : "secondary"}>
                      {serverStatus.webServer.running ? "Running" : "Stopped"}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      Port {serverStatus.webServer.port}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  {!serverStatus.server.running ? (
                    <Button
                      onClick={handleStartServer}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Server
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleStopServer}
                        disabled={isLoading}
                        variant="destructive"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop Server
                      </Button>
                      <Button
                        onClick={handleOpenConfigurator}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Open Configurator
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3">API Endpoints</h3>
            <div className="space-y-2">
              {serverStatus?.endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {endpoint.split(':')[0]}
                  </Badge>
                  <span className="text-sm text-gray-300">{endpoint.split(':')[1]}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="tools" className="space-y-4 mt-4">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Configuration Tools
            </h3>
            
            <div className="space-y-3">
              <Button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
              
              <Button
                onClick={loadConfigData}
                disabled={isLoading}
                variant="outline"
                className="w-full border-gray-600 hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Configuration
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguratorIntegrationPanel;
