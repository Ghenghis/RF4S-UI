
import { FilterRule } from './types';

export class DefaultRules {
  static getDefaultRules(): FilterRule[] {
    return [
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
  }
}
