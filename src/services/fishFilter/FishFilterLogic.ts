
import { createRichLogger } from '../../rf4s/utils';
import { FishData, FilterRule, FilterResult } from './types';
import { FilterRuleEvaluator } from './FilterRuleEvaluator';
import { ConfidenceCalculator } from './ConfidenceCalculator';
import { DefaultRules } from './DefaultRules';

class FishFilterLogicImpl {
  private filterRules: Map<string, FilterRule> = new Map();
  private logger = createRichLogger('FishFilterLogic');
  private whitelistSpecies: Set<string> = new Set();
  private blacklistSpecies: Set<string> = new Set();
  private ruleEvaluator = new FilterRuleEvaluator();
  private confidenceCalculator = new ConfidenceCalculator();

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

    // Sort rules by priority (higher priority first)
    const activeRules = Array.from(this.filterRules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    // Evaluate each rule
    for (const rule of activeRules) {
      if (this.ruleEvaluator.evaluateRule(rule, fishData)) {
        matchedRules.push(rule);
        
        // Higher priority rules override lower priority ones
        if (rule.priority > highestPriority) {
          finalAction = rule.action;
          highestPriority = rule.priority;
        }
      }
    }

    // Calculate confidence based on rule matches and fish data quality
    const confidence = this.confidenceCalculator.calculateFilterConfidence(fishData, matchedRules);

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
    const defaultRules = DefaultRules.getDefaultRules();
    defaultRules.forEach(rule => this.addFilterRule(rule));
  }
}

export const FishFilterLogic = new FishFilterLogicImpl();
export * from './types';
