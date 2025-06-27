
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
