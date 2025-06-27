
import { FishData } from '../FishFilterLogic';

export interface KeepnetConfiguration {
  maxCapacity: number;
  capacityWarningThreshold: number;
  autoReleaseEnabled: boolean;
  autoReleaseThreshold: number;
  sortingEnabled: boolean;
  sortingCriteria: 'weight' | 'length' | 'rarity' | 'species' | 'timestamp';
  releaseRules: ReleaseRule[];
}

export interface ReleaseRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: {
    capacityThreshold: number;
    minWeight?: number;
    maxWeight?: number;
    species?: string[];
    rarity?: string[];
    age?: number; // in minutes
  };
}

export interface KeepnetStatus {
  currentCapacity: number;
  maxCapacity: number;
  utilizationPercentage: number;
  totalWeight: number;
  averageWeight: number;
  speciesCount: Record<string, number>;
  rarityDistribution: Record<string, number>;
  oldestFish: FishData | null;
  newestFish: FishData | null;
  autoReleaseActive: boolean;
}

export interface ReleaseCandidate {
  fish: FishData;
  reason: string;
  priority: number;
  rule: ReleaseRule;
}
