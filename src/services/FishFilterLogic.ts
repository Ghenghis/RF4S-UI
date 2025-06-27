
import { createRichLogger } from '../rf4s/utils';

export interface FishData {
  id: string;
  name: string;
  weight: number;
  length: number;
  species: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  tags?: string[];
  timestamp: Date;
  location?: string;
  weather?: string;
}

export interface FilterRule {
  id: string;
  name: string;
  type: 'whitelist' | 'blacklist' | 'weight' | 'length' | 'species' | 'rarity' | 'tag';
  enabled: boolean;
  conditions: FilterCondition[];
  action: 'keep' | 'release' | 'tag' | 'notify';
  priority: number;
}

export interface FilterCondition {
  field: keyof FishData;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface FilterResult {
  fishId: string;
  action: 'keep' | 'release' | 'tag' | 'notify';
  matchedRules: FilterRule[];
  reason: string;
  confidence: number;
}

class FishFilterLogicImpl {
  private filterRules: Map<string, FilterRule> = new Map();
  private logger = createRichLogger('FishFilterLogic');
  private whitelistSpecies: Set<string> = new Set();
  private blacklistSpecies: Set<string> = new Set();

  constructor() {
    this.initializeDefaultRules();
  }

  addFilterRule(rule: FilterRule): void {
    this.filterRules.set(rule.id, rule);
    this.logger.info(`Filter rule added: ${rule.name}`);
  }

  removeFilterRule(ruleId: string): boolean {
    const removed = this.filterRules.delete(ruleId);
    if (removed) {
      this.logger.info(`Filter rule removed: ${ruleId}`);
    }
    return removed;
  }

  updateFilterRule(ruleId: string, updates: Partial<FilterRule>): boolean {
    const rule = this.filterRules.get(ruleId);
    if (!rule) {
      this.logger.error(`Filter rule not found: ${ruleId}`);
      return false;
    }

    const updatedRule = { ...rule, ...updates };
    this.filterRules.set(ruleId, updatedRule);
    this.logger.info(`Filter rule updated: ${ruleId}`);
    return true;
  }

  processFilterDecision(fishData: FishData): FilterResult {
    const matchedRules: FilterRule[] = [];
    let finalAction: FilterResult['action'] = 'keep';
    let highestPriority = -1;
    let confidence = 1.0;

    // Sort rules by priority (higher priority first)
    const activeRules = Array.from(this.filterRules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    // Evaluate each rule
    for (const rule of activeRules) {
      if (this.evaluateRule(rule, fishData)) {
        matchedRules.push(rule);
        
        // Higher priority rules override lower priority ones
        if (rule.priority > highestPriority) {
          finalAction = rule.action;
          highestPriority = rule.priority;
        }
      }
    }

    // Calculate confidence based on rule matches and fish data quality
    confidence = this.calculateFilterConfidence(fishData, matchedRules);

    const result: FilterResult = {
      fishId: fishData.id,
      action: finalAction,
      matchedRules,
      reason: this.generateFilterReason(matchedRules, finalAction),
      confidence
    };

    this.logger.info(`Filter decision for ${fishData.name}: ${finalAction} (${matchedRules.length} rules matched)`);
    return result;
  }

  processSpeciesWhitelist(species: string[]): void {
    this.whitelistSpecies.clear();
    species.forEach(s => this.whitelistSpecies.add(s.toLowerCase()));
    this.logger.info(`Species whitelist updated: ${species.length} species`);
  }

  processSpeciesBlacklist(species: string[]): void {
    this.blacklistSpecies.clear();
    species.forEach(s => this.blacklistSpecies.add(s.toLowerCase()));
    this.logger.info(`Species blacklist updated: ${species.length} species`);
  }

  processBulkFiltering(fishList: FishData[]): FilterResult[] {
    this.logger.info(`Processing bulk filtering for ${fishList.length} fish`);
    
    return fishList.map(fish => this.processFilterDecision(fish));
  }

  getFilterStatistics(): {
    totalRules: number;
    activeRules: number;
    whitelistCount: number;
    blacklistCount: number;
    ruleTypes: Record<string, number>;
  } {
    const activeRules = Array.from(this.filterRules.values()).filter(rule => rule.enabled);
    const ruleTypes: Record<string, number> = {};
    
    activeRules.forEach(rule => {
      ruleTypes[rule.type] = (ruleTypes[rule.type] || 0) + 1;
    });

    return {
      totalRules: this.filterRules.size,
      activeRules: activeRules.length,
      whitelistCount: this.whitelistSpecies.size,
      blacklistCount: this.blacklistSpecies.size,
      ruleTypes
    };
  }

  private evaluateRule(rule: FilterRule, fishData: FishData): boolean {
    return rule.conditions.every(condition => this.evaluateCondition(condition, fishData));
  }

  private evaluateCondition(condition: FilterCondition, fishData: FishData): boolean {
    const fieldValue = fishData[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return this.compareValues(fieldValue, targetValue, condition.caseSensitive);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'greater':
        return Number(fieldValue) > Number(targetValue);
      case 'less':
        return Number(fieldValue) < Number(targetValue);
      case 'between':
        const [min, max] = Array.isArray(targetValue) ? targetValue : [0, targetValue];
        const numValue = Number(fieldValue);
        return numValue >= min && numValue <= max;
      case 'in':
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(targetValue) && !targetValue.includes(fieldValue);
      default:
        return false;
    }
  }

  private compareValues(a: any, b: any, caseSensitive: boolean = false): boolean {
    if (typeof a === 'string' && typeof b === 'string') {
      return caseSensitive ? a === b : a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
  }

  private calculateFilterConfidence(fishData: FishData, matchedRules: FilterRule[]): number {
    let confidence = 0.8; // Base confidence

    // Increase confidence with more rule matches
    confidence += Math.min(matchedRules.length * 0.1, 0.2);

    // Adjust based on fish data completeness
    const dataCompleteness = this.calculateDataCompleteness(fishData);
    confidence *= dataCompleteness;

    return Math.min(confidence, 1.0);
  }

  private calculateDataCompleteness(fishData: FishData): number {
    const requiredFields = ['name', 'weight', 'species'];
    const optionalFields = ['length', 'tags', 'location'];
    
    let score = 0;
    let maxScore = requiredFields.length + optionalFields.length * 0.5;

    // Required fields
    requiredFields.forEach(field => {
      if (fishData[field as keyof FishData] && fishData[field as keyof FishData] !== 'Unknown') {
        score += 1;
      }
    });

    // Optional fields
    optionalFields.forEach(field => {
      if (fishData[field as keyof FishData]) {
        score += 0.5;
      }
    });

    return score / maxScore;
  }

  private generateFilterReason(matchedRules: FilterRule[], action: FilterResult['action']): string {
    if (matchedRules.length === 0) {
      return 'No matching filter rules, default action applied';
    }

    const primaryRule = matchedRules.find(rule => rule.action === action);
    if (primaryRule) {
      return `${primaryRule.name}: ${action}`;
    }

    return `${matchedRules.length} rules matched, action: ${action}`;
  }

  private initializeDefaultRules(): void {
    const defaultRules: FilterRule[] = [
      {
        id: 'whitelist_rare',
        name: 'Keep Rare Fish',
        type: 'rarity',
        enabled: true,
        conditions: [
          { field: 'rarity', operator: 'in', value: ['rare', 'legendary'] }
        ],
        action: 'keep',
        priority: 100
      },
      {
        id: 'blacklist_common_small',
        name: 'Release Small Common Fish',
        type: 'weight',
        enabled: true,
        conditions: [
          { field: 'rarity', operator: 'equals', value: 'common' },
          { field: 'weight', operator: 'less', value: 1.0 }
        ],
        action: 'release',
        priority: 50
      }
    ];

    defaultRules.forEach(rule => this.addFilterRule(rule));
  }
}

export const FishFilterLogic = new FishFilterLogicImpl();
