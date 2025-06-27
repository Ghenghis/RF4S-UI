
import { FishData, FilterRule, FilterCondition } from './types';

export class FilterRuleEvaluator {
  evaluateRule(rule: FilterRule, fishData: FishData): boolean {
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
}
