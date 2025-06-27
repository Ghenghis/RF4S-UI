import { createRichLogger } from '../rf4s/utils';
import { FishData } from './FishFilterLogic';

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

class KeepnetLogicManagerImpl {
  private config: KeepnetConfiguration;
  private keepnetContents: Map<string, FishData> = new Map();
  private logger = createRichLogger('KeepnetLogicManager');
  private releaseHistory: Array<{ fish: FishData; timestamp: Date; reason: string }> = [];

  constructor() {
    this.config = {
      maxCapacity: 50,
      capacityWarningThreshold: 0.8,
      autoReleaseEnabled: true,
      autoReleaseThreshold: 0.9,
      sortingEnabled: true,
      sortingCriteria: 'weight',
      releaseRules: this.getDefaultReleaseRules()
    };
  }

  updateConfiguration(updates: Partial<KeepnetConfiguration>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('Keepnet configuration updated');
  }

  addFish(fish: FishData): boolean {
    if (this.keepnetContents.size >= this.config.maxCapacity) {
      this.logger.warning(`Keepnet at maximum capacity (${this.config.maxCapacity})`);
      
      if (this.config.autoReleaseEnabled) {
        this.processAutoRelease();
      } else {
        return false;
      }
    }

    this.keepnetContents.set(fish.id, fish);
    this.logger.info(`Fish added to keepnet: ${fish.name} (${fish.weight}kg)`);
    
    // Check if auto-release is needed
    this.checkAutoReleaseConditions();
    
    return true;
  }

  removeFish(fishId: string): FishData | null {
    const fish = this.keepnetContents.get(fishId);
    if (fish) {
      this.keepnetContents.delete(fishId);
      this.logger.info(`Fish removed from keepnet: ${fish.name}`);
      return fish;
    }
    return null;
  }

  getKeepnetStatus(): KeepnetStatus {
    const fish = Array.from(this.keepnetContents.values());
    const totalWeight = fish.reduce((sum, f) => sum + f.weight, 0);
    const speciesCount: Record<string, number> = {};
    const rarityDistribution: Record<string, number> = {};

    fish.forEach(f => {
      speciesCount[f.species] = (speciesCount[f.species] || 0) + 1;
      rarityDistribution[f.rarity] = (rarityDistribution[f.rarity] || 0) + 1;
    });

    const sortedByTime = fish.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      currentCapacity: this.keepnetContents.size,
      maxCapacity: this.config.maxCapacity,
      utilizationPercentage: (this.keepnetContents.size / this.config.maxCapacity) * 100,
      totalWeight,
      averageWeight: fish.length > 0 ? totalWeight / fish.length : 0,
      speciesCount,
      rarityDistribution,
      oldestFish: sortedByTime[0] || null,
      newestFish: sortedByTime[sortedByTime.length - 1] || null,
      autoReleaseActive: this.config.autoReleaseEnabled
    };
  }

  processCapacityManagement(): {
    status: 'ok' | 'warning' | 'critical';
    message: string;
    suggestedActions: string[];
  } {
    const status = this.getKeepnetStatus();
    const utilization = status.utilizationPercentage / 100;

    if (utilization >= this.config.autoReleaseThreshold) {
      return {
        status: 'critical',
        message: `Keepnet critically full (${status.utilizationPercentage.toFixed(1)}%)`,
        suggestedActions: [
          'Immediate auto-release activated',
          'Consider manual fish sorting',
          'Review release rules'
        ]
      };
    } else if (utilization >= this.config.capacityWarningThreshold) {
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

  processAutoRelease(): ReleaseCandidate[] {
    if (!this.config.autoReleaseEnabled) {
      return [];
    }

    const releaseCandidates = this.findReleaseCandidates();
    const toRelease = this.selectFishForRelease(releaseCandidates);

    toRelease.forEach(candidate => {
      this.releaseFish(candidate.fish, candidate.reason);
    });

    this.logger.info(`Auto-release processed: ${toRelease.length} fish released`);
    return toRelease;
  }

  processSorting(): FishData[] {
    if (!this.config.sortingEnabled) {
      return Array.from(this.keepnetContents.values());
    }

    const fish = Array.from(this.keepnetContents.values());
    
    return fish.sort((a, b) => {
      switch (this.config.sortingCriteria) {
        case 'weight':
          return b.weight - a.weight;
        case 'length':
          return b.length - a.length;
        case 'rarity':
          const rarityOrder = { 'legendary': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        case 'species':
          return a.species.localeCompare(b.species);
        case 'timestamp':
          return b.timestamp.getTime() - a.timestamp.getTime();
        default:
          return 0;
      }
    });
  }

  getReleaseHistory(): Array<{ fish: FishData; timestamp: Date; reason: string }> {
    return [...this.releaseHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private checkAutoReleaseConditions(): void {
    const status = this.getKeepnetStatus();
    const utilization = status.utilizationPercentage / 100;

    if (utilization >= this.config.autoReleaseThreshold) {
      this.processAutoRelease();
    }
  }

  private findReleaseCandidates(): ReleaseCandidate[] {
    const candidates: ReleaseCandidate[] = [];
    const fish = Array.from(this.keepnetContents.values());

    this.config.releaseRules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority)
      .forEach(rule => {
        fish.forEach(f => {
          if (this.fishMatchesReleaseRule(f, rule)) {
            candidates.push({
              fish: f,
              reason: rule.name,
              priority: rule.priority,
              rule
            });
          }
        });
      });

    return candidates;
  }

  private fishMatchesReleaseRule(fish: FishData, rule: ReleaseRule): boolean {
    const status = this.getKeepnetStatus();
    const utilization = status.utilizationPercentage / 100;

    // Check capacity threshold
    if (utilization < rule.conditions.capacityThreshold) {
      return false;
    }

    // Check weight conditions
    if (rule.conditions.minWeight && fish.weight < rule.conditions.minWeight) {
      return false;
    }
    if (rule.conditions.maxWeight && fish.weight > rule.conditions.maxWeight) {
      return false;
    }

    // Check species conditions
    if (rule.conditions.species && !rule.conditions.species.includes(fish.species)) {
      return false;
    }

    // Check rarity conditions
    if (rule.conditions.rarity && !rule.conditions.rarity.includes(fish.rarity)) {
      return false;
    }

    // Check age conditions
    if (rule.conditions.age) {
      const ageMinutes = (Date.now() - fish.timestamp.getTime()) / (1000 * 60);
      if (ageMinutes < rule.conditions.age) {
        return false;
      }
    }

    return true;
  }

  private selectFishForRelease(candidates: ReleaseCandidate[]): ReleaseCandidate[] {
    // Sort by priority (higher first), then by weight (lower first for same priority)
    const sorted = candidates.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.fish.weight - b.fish.weight;
    });

    // Release enough fish to get below the auto-release threshold
    const status = this.getKeepnetStatus();
    const targetCapacity = Math.floor(this.config.maxCapacity * this.config.capacityWarningThreshold);
    const toReleaseCount = Math.max(0, status.currentCapacity - targetCapacity);

    return sorted.slice(0, toReleaseCount);
  }

  private releaseFish(fish: FishData, reason: string): void {
    this.keepnetContents.delete(fish.id);
    this.releaseHistory.push({
      fish,
      timestamp: new Date(),
      reason
    });

    // Keep release history manageable
    if (this.releaseHistory.length > 1000) {
      this.releaseHistory = this.releaseHistory.slice(-500);
    }
  }

  private getDefaultReleaseRules(): ReleaseRule[] {
    return [
      {
        id: 'release_old_common',
        name: 'Release Old Common Fish',
        enabled: true,
        priority: 50,
        conditions: {
          capacityThreshold: 0.8,
          rarity: ['common'],
          age: 30 // 30 minutes
        }
      },
      {
        id: 'release_small_fish',
        name: 'Release Small Fish',
        enabled: true,
        priority: 40,
        conditions: {
          capacityThreshold: 0.9,
          maxWeight: 1.5
        }
      },
      {
        id: 'release_excess_species',
        name: 'Release Excess Same Species',
        enabled: false,
        priority: 30,
        conditions: {
          capacityThreshold: 0.85
        }
      }
    ];
  }
}

export const KeepnetLogicManager = new KeepnetLogicManagerImpl();
