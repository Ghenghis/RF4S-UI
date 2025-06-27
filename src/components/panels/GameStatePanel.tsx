
import React, { useState, useEffect } from 'react';
import { GameStateSync } from '../../services/GameStateSync';
import { EventManager } from '../../core/EventManager';
import SyncStatusSection from './gameState/SyncStatusSection';
import GameStatusSection from './gameState/GameStatusSection';
import FishingStateSection from './gameState/FishingStateSection';
import PlayerStatsSection from './gameState/PlayerStatsSection';
import InventorySection from './gameState/InventorySection';

const GameStatePanel: React.FC = () => {
  const [gameState, setGameState] = useState<any>({});
  const [syncMetrics, setSyncMetrics] = useState<any>({});
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    const updateGameState = (data: any) => {
      setGameState(data.gameState || data);
      setSyncMetrics(data.metrics || {});
      setIsHealthy(GameStateSync.isGameStateHealthy());
    };

    EventManager.subscribe('game_state.synced', updateGameState);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleForceSync = () => {
    GameStateSync.forceSync();
  };

  return (
    <div className="space-y-3">
      <SyncStatusSection
        isHealthy={isHealthy}
        syncMetrics={syncMetrics}
        onForceSync={handleForceSync}
      />

      <GameStatusSection gameState={gameState} />

      <FishingStateSection gameState={gameState} />

      <PlayerStatsSection gameState={gameState} />

      <InventorySection gameState={gameState} />
    </div>
  );
};

export default GameStatePanel;
