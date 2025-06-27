
import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Globe, Play, Square, ExternalLink } from 'lucide-react';

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

interface ServerStatusTabProps {
  serverStatus: ServerStatus | null;
  isLoading: boolean;
  onStartServer: () => void;
  onStopServer: () => void;
  onOpenConfigurator: () => void;
  onOpenHTMLConfigurator: () => void;
}

const ServerStatusTab: React.FC<ServerStatusTabProps> = ({
  serverStatus,
  isLoading,
  onStartServer,
  onStopServer,
  onOpenConfigurator,
  onOpenHTMLConfigurator
}) => {
  return (
    <div className="space-y-4 mt-4">
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

            <div className="flex items-center justify-between">
              <span>HTML Configurator</span>
              <div className="flex items-center space-x-2">
                <Badge variant={serverStatus.htmlServer.running ? "default" : "secondary"}>
                  {serverStatus.htmlServer.running ? "Running" : "Stopped"}
                </Badge>
                <span className="text-sm text-gray-400">
                  Port {serverStatus.htmlServer.port}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              {!serverStatus.server.running ? (
                <Button
                  onClick={onStartServer}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Server
                </Button>
              ) : (
                <>
                  <Button
                    onClick={onStopServer}
                    disabled={isLoading}
                    variant="destructive"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop Server
                  </Button>
                  <Button
                    onClick={onOpenConfigurator}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Open Configurator
                  </Button>
                </>
              )}
              
              {serverStatus.htmlServer.running && (
                <Button
                  onClick={onOpenHTMLConfigurator}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open HTML Configurator
                </Button>
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
    </div>
  );
};

export default ServerStatusTab;
