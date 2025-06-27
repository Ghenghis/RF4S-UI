
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Zap } from 'lucide-react';

interface FishingStateSectionProps {
  gameState: any;
}

const FishingStateSection: React.FC<FishingStateSectionProps> = ({ gameState }) => {
  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400';
  };

  return (
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
  );
};

export default FishingStateSection;
