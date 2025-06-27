
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Users } from 'lucide-react';

interface PlayerStatsSectionProps {
  gameState: any;
}

const PlayerStatsSection: React.FC<PlayerStatsSectionProps> = ({ gameState }) => {
  return (
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
  );
};

export default PlayerStatsSection;
