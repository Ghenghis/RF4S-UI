
import { FishData } from '../FishFilterLogic';
import { KeepnetStatus } from './types';

export class KeepnetStatusCalculator {
  calculateStatus(
    keepnetContents: Map<string, FishData>, 
    maxCapacity: number, 
    autoReleaseEnabled: boolean
  ): KeepnetStatus {
    const fish = Array.from(keepnetContents.values());
    const totalWeight = fish.reduce((sum, f) => sum + f.weight, 0);
    const speciesCount: Record<string, number> = {};
    const rarityDistribution: Record<string, number> = {};

    fish.forEach(f => {
      speciesCount[f.species] = (speciesCount[f.species] || 0) + 1;
      rarityDistribution[f.rarity] = (rarityDistribution[f.rarity] || 0) + 1;
    });

    const sortedByTime = fish.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      currentCapacity: keepnetContents.size,
      maxCapacity,
      utilizationPercentage: (keepnetContents.size / maxCapacity) * 100,
      totalWeight,
      averageWeight: fish.length > 0 ? totalWeight / fish.length : 0,
      speciesCount,
      rarityDistribution,
      oldestFish: sortedByTime[0] || null,
      newestFish: sortedByTime[sortedByTime.length - 1] || null,
      autoReleaseActive: autoReleaseEnabled
    };
  }

  processCapacityManagement(
    status: KeepnetStatus, 
    warningThreshold: number, 
    autoReleaseThreshold: number
  ): {
    status: 'ok' | 'warning' | 'critical';
    message: string;
    suggestedActions: string[];
  } {
    const utilization = status.utilizationPercentage / 100;

    if (utilization >= autoReleaseThreshold) {
      return {
        status: 'critical',
        message: `Keepnet critically full (${status.utilizationPercentage.toFixed(1)}%)`,
        suggestedActions: [
          'Immediate auto-release activated',
          'Consider manual fish sorting',
          'Review release rules'
        ]
      };
    } else if (utilization >= warningThreshold) {
      return {
        status: 'warning',
        message: `Keepnet approaching capacity (${status.utilizationPercentage.toFixed(1)}%)`,
        suggestedActions: [
          'Prepare for auto-release',
          'Review current fish inventory',
          'Consider manual releases'
        ]
      };
    }

    return {
      status: 'ok',
      message: `Keepnet capacity normal (${status.utilizationPercentage.toFixed(1)}%)`,
      suggestedActions: []
    };
  }
}
