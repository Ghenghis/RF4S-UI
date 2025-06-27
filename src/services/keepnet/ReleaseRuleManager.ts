
import { createRichLogger } from '../../rf4s/utils';
import { FishData } from '../FishFilterLogic';
import { ReleaseRule, ReleaseCandidate } from './types';

export class ReleaseRuleManager {
  private logger = createRichLogger('ReleaseRuleManager');

  getDefaultReleaseRules(): ReleaseRule[] {
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

  findReleaseCandidates(
    fish: FishData[], 
    rules: ReleaseRule[], 
    utilizationPercentage: number
  ): ReleaseCandidate[] {
    const candidates: ReleaseCandidate[] = [];
    const utilization = utilizationPercentage / 100;

    rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority)
      .forEach(rule => {
        fish.forEach(f => {
          if (this.fishMatchesReleaseRule(f, rule, utilization)) {
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

  selectFishForRelease(
    candidates: ReleaseCandidate[], 
    currentCapacity: number, 
    maxCapacity: number, 
    warningThreshold: number
  ): ReleaseCandidate[] {
    // Sort by priority (higher first), then by weight (lower first for same priority)
    const sorted = candidates.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.fish.weight - b.fish.weight;
    });

    // Release enough fish to get below the auto-release threshold
    const targetCapacity = Math.floor(maxCapacity * warningThreshold);
    const toReleaseCount = Math.max(0, currentCapacity - targetCapacity);

    return sorted.slice(0, toReleaseCount);
  }

  private fishMatchesReleaseRule(fish: FishData, rule: ReleaseRule, utilization: number): boolean {
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
}
