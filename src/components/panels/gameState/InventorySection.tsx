
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Settings } from 'lucide-react';

interface InventorySectionProps {
  gameState: any;
}

const InventorySection: React.FC<InventorySectionProps> = ({ gameState }) => {
  return (
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
  );
};

export default InventorySection;
