import { createRichLogger } from '../../rf4s/utils';
import { FishData } from '../FishFilterLogic';
import { KeepnetConfiguration, KeepnetStatus, ReleaseCandidate } from './types';
import { ReleaseRuleManager } from './ReleaseRuleManager';
import { KeepnetSorter } from './KeepnetSorter';
import { KeepnetStatusCalculator } from './KeepnetStatusCalculator';

class KeepnetLogicManagerImpl {
  private config: KeepnetConfiguration;
  private keepnetContents: Map<string, FishData> = new Map();
  private logger = createRichLogger('KeepnetLogicManager');
  private releaseHistory: Array<{ fish: FishData; timestamp: Date; reason: string }> = [];
  private ruleManager = new ReleaseRuleManager();
  private sorter = new KeepnetSorter();
  private statusCalculator = new KeepnetStatusCalculator();

  constructor() {
    this.config = {
      maxCapacity: 50,
      capacityWarningThreshold: 0.8,
      autoReleaseEnabled: true,
      autoReleaseThreshold: 0.9,
      sortingEnabled: true,
      sortingCriteria: 'weight',
      releaseRules: this.ruleManager.getDefaultReleaseRules()
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
    return this.statusCalculator.calculateStatus(
      this.keepnetContents, 
      this.config.maxCapacity, 
      this.config.autoReleaseEnabled
    );
  }

  processCapacityManagement(): {
    status: 'ok' | 'warning' | 'critical';
    message: string;
    suggestedActions: string[];
  } {
    const status = this.getKeepnetStatus();
    return this.statusCalculator.processCapacityManagement(
      status,
      this.config.capacityWarningThreshold,
      this.config.autoReleaseThreshold
    );
  }

  processAutoRelease(): ReleaseCandidate[] {
    if (!this.config.autoReleaseEnabled) {
      return [];
    }

    const fish = Array.from(this.keepnetContents.values());
    const status = this.getKeepnetStatus();
    const releaseCandidates = this.ruleManager.findReleaseCandidates(
      fish, 
      this.config.releaseRules, 
      status.utilizationPercentage
    );
    
    const toRelease = this.ruleManager.selectFishForRelease(
      releaseCandidates,
      status.currentCapacity,
      this.config.maxCapacity,
      this.config.capacityWarningThreshold
    );

    toRelease.forEach(candidate => {
      this.releaseFish(candidate.fish, candidate.reason);
    });

    this.logger.info(`Auto-release processed: ${toRelease.length} fish released`);
    return toRelease;
  }

  processSorting(): FishData[] {
    const fish = Array.from(this.keepnetContents.values());
    return this.sorter.processSorting(fish, this.config.sortingCriteria, this.config.sortingEnabled);
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
}

export const KeepnetLogicManager = new KeepnetLogicManagerImpl();
export * from './types';
