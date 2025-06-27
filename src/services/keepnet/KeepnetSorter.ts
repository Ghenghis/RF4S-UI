
import { FishData } from '../FishFilterLogic';

export class KeepnetSorter {
  processSorting(fish: FishData[], criteria: string, enabled: boolean): FishData[] {
    if (!enabled) {
      return fish;
    }

    return fish.sort((a, b) => {
      switch (criteria) {
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
}
