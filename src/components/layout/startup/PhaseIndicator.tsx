
import React from 'react';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';

interface PhaseData {
  phase: number;
  total: number;
  name: string;
}

interface PhaseIndicatorProps {
  currentPhase?: PhaseData;
  isInitializing?: boolean;
}

export const PhaseIndicator = ({ currentPhase, isInitializing }: PhaseIndicatorProps) => {
  if (!currentPhase) return null;

  return (
    <>
      {isInitializing && (
        <Badge variant="outline" className="text-xs">
          Phase {currentPhase.phase}/{currentPhase.total}
        </Badge>
      )}
      
      {!isInitializing && (
        <div className="text-xs text-muted-foreground">
          <span>Current Phase: {currentPhase.name}</span>
          <Progress 
            value={(currentPhase.phase / currentPhase.total) * 100} 
            className="w-full h-1 mt-1" 
          />
        </div>
      )}
    </>
  );
};
