import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { GameStateSync } from '../../services/GameStateSync';
import { EventManager } from '../../core/EventManager';
import { Monitor, Gamepad2, Users, Settings, Zap } from 'lucide-react';

const GameStatePanel: React.FC = () => {
  const [gameState, setGameState] = useState<any>({});
  const [syncMetrics, setSyncMetrics] = useState<any>({});
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    const updateGameState = (data: any) => {
      setGameState(data);
    };

    const unsubscribe = EventManager.subscribe('game_state.synced', updateGameState);
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleForceSync = () => {
    GameStateSync.forceSync();
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400';
  };

  return (
    <div className="space-y-3">
      {/* Sync Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            Sync Status
            <Badge variant="outline" className={getStatusColor(isHealthy)}>
              {isHealthy ? 'Healthy' : 'Issues'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Last Sync</span>
            <span className="text-blue-400">
              {syncMetrics.lastSyncTime ? 
                new Date(syncMetrics.lastSyncTime).toLocaleTimeString() : 
                'Never'
              }
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Latency</span>
            <span className="text-yellow-400">{syncMetrics.latency || 0}ms</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Missed Syncs</span>
            <span className={syncMetrics.missedSyncs > 0 ? 'text-red-400' : 'text-green-400'}>
              {syncMetrics.missedSyncs || 0}
            </span>
          </div>
          <Button
            onClick={handleForceSync}
            className="w-full h-6 text-xs bg-blue-600 hover:bg-blue-700"
          >
            Force Sync
          </Button>
        </CardContent>
      </Card>

      {/* Game Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-green-500" />
            Game Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Game Running</span>
            <Badge variant="outline" className={getStatusColor(gameState.isGameRunning)}>
              {gameState.isGameRunning ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Window Active</span>
            <Badge variant="outline" className={getStatusColor(gameState.windowActive)}>
              {gameState.windowActive ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Resolution</span>
            <span className="text-blue-400">
              {gameState.resolution?.width || 0}x{gameState.resolution?.height || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Version</span>
            <span className="text-gray-400">{gameState.gameVersion || 'Unknown'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Fishing State */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            Fishing State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Location</span>
            <span className="text-green-400">{gameState.currentLocation || 'Unknown'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Technique</span>
            <span className="text-blue-400">{gameState.currentTechnique || 'None'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Rod in Water</span>
            <Badge variant="outline" className={getStatusColor(gameState.rodInWater)}>
              {gameState.rodInWater ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Fish on Hook</span>
            <Badge variant="outline" className={getStatusColor(gameState.fishOnHook)}>
              {gameState.fishOnHook ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Player Stats */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-500" />
            Player Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Level</span>
            <span className="text-yellow-400">{gameState.playerStats?.level || 1}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Experience</span>
            <span className="text-blue-400">{gameState.playerStats?.experience || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Money</span>
            <span className="text-green-400">${gameState.playerStats?.money || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Inventory State */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-500" />
            Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Bait</span>
            <span className="text-orange-400">{gameState.inventoryState?.bait || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Lures</span>
            <span className="text-purple-400">
              {gameState.inventoryState?.lures?.length || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Equipment</span>
            <span className="text-cyan-400">
              {gameState.inventoryState?.equipment?.length || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStatePanel;
