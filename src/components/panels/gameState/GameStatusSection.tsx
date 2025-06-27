
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Gamepad2 } from 'lucide-react';

interface GameStatusSectionProps {
  gameState: any;
}

const GameStatusSection: React.FC<GameStatusSectionProps> = ({ gameState }) => {
  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400';
  };

  return (
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
  );
};

export default GameStatusSection;
