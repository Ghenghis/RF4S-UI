
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { EnhancedServiceCoordinator, CoordinatorStatus } from '../../services/EnhancedServiceCoordinator';
import { ServiceOrchestrator } from '../../services/ServiceOrchestrator';
import { useToast } from '../../hooks/use-toast';
import { 
  Activity, 
  Server, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Play,
  RotateCcw
} from 'lucide-react';

const StatusIndicator: React.FC<{ status: boolean; label: string }> = ({ status, label }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm">{label}</span>
    <div className="flex items-center space-x-2">
      {status ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "Active" : "Inactive"}
      </Badge>
    </div>
  </div>
);

const SystemStatusPanel: React.FC = () => {
  const [coordinatorStatus, setCoordinatorStatus] = useState<CoordinatorStatus | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = EnhancedServiceCoordinator.getStatus();
      setCoordinatorStatus(status);
      
      const services = await ServiceOrchestrator.getServiceStatus();
      setServiceStatuses(services);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const handleInitializeSystem = async () => {
    setIsLoading(true);
    try {
      await EnhancedServiceCoordinator.initializeAllSystems();
      await loadSystemStatus();
      toast({
        title: "Success",
        description: "System initialization completed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "System initialization failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartSystem = async () => {
    setIsLoading(true);
    try {
      await EnhancedServiceCoordinator.restartSystem();
      await loadSystemStatus();
      toast({
        title: "Success",
        description: "System restart completed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "System restart failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'ready': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Server className="h-5 w-5 mr-2" />
          System Status
        </h2>
        <Button
          onClick={loadSystemStatus}
          size="sm"
          variant="outline"
          className="border-gray-600 hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {coordinatorStatus && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              {getPhaseIcon(coordinatorStatus.phase)}
              <span className="ml-2">System Coordinator</span>
            </h3>
            <Badge variant={coordinatorStatus.phase === 'ready' ? "default" : coordinatorStatus.phase === 'error' ? "destructive" : "secondary"}>
              {coordinatorStatus.phase.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Initialization Progress</span>
                <span>{coordinatorStatus.progress}%</span>
              </div>
              <Progress value={coordinatorStatus.progress} className="h-2" />
            </div>

            <div className="text-sm text-gray-300">
              <strong>Current Task:</strong> {coordinatorStatus.currentTask}
            </div>

            {coordinatorStatus.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-700 rounded p-3">
                <h4 className="text-sm font-semibold text-red-400 mb-2">Errors:</h4>
                <ul className="text-xs text-red-300 space-y-1">
                  {coordinatorStatus.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="font-semibold mb-3">Core Services</h3>
        {coordinatorStatus && (
          <div className="space-y-2">
            <StatusIndicator 
              status={coordinatorStatus.services.orchestrator} 
              label="Service Orchestrator" 
            />
            <StatusIndicator 
              status={coordinatorStatus.services.configurator} 
              label="Configurator Integration" 
            />
            <StatusIndicator 
              status={coordinatorStatus.services.realtimeData} 
              label="Realtime Data Service" 
            />
            <StatusIndicator 
              status={coordinatorStatus.services.verification} 
              label="System Verification" 
            />
          </div>
        )}
      </Card>

      <Card className="p-4 bg-gray-800 border-gray-700">
        <h3 className="font-semibold mb-3">Service Registry</h3>
        <div className="space-y-2">
          {serviceStatuses.map((service, index) => (
            <StatusIndicator
              key={index}
              status={service.status === 'running'}
              label={service.name || service.serviceName || `Service ${index + 1}`}
            />
          ))}
        </div>
      </Card>

      <div className="flex space-x-2">
        <Button
          onClick={handleInitializeSystem}
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Play className="h-4 w-4 mr-1" />
          Initialize System
        </Button>
        <Button
          onClick={handleRestartSystem}
          disabled={isLoading}
          variant="outline"
          className="flex-1 border-gray-600 hover:bg-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restart System
        </Button>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
