
import { TagColor, TagDefinition } from './types';

export class DefaultTagsProvider {
  static getDefaultColors(): TagColor[] {
    return [
      {
        id: 'green_tag',
        name: 'Green Tag',
        hexCode: '#00FF00',
        rgbValues: { r: 0, g: 255, b: 0 },
        hsvValues: { h: 120, s: 100, v: 100 },
        tolerance: 30,
        enabled: true
      },
      {
        id: 'red_tag',
        name: 'Red Tag',
        hexCode: '#FF0000',
        rgbValues: { r: 255, g: 0, b: 0 },
        hsvValues: { h: 0, s: 100, v: 100 },
        tolerance: 25,
        enabled: true
      },
      {
        id: 'blue_tag',
        name: 'Blue Tag',
        hexCode: '#0000FF',
        rgbValues: { r: 0, g: 0, b: 255 },
        hsvValues: { h: 240, s: 100, v: 100 },
        tolerance: 25,
        enabled: true
      }
    ];
  }

  static getDefaultTags(): TagDefinition[] {
    const defaultColors = this.getDefaultColors();
    
    return [
      {
        id: 'rare_green',
        name: 'Rare Green Tag',
        colors: [defaultColors[0]],
        shape: 'circle',
        size: { width: 20, height: 20 },
        position: 'fin',
        rarity: 'rare',
        value: 100
      },
      {
        id: 'legendary_red',
        name: 'Legendary Red Tag',
        colors: [defaultColors[1]],
        shape: 'diamond',
        size: { width: 25, height: 25 },
        position: 'body',
        rarity: 'legendary',
        value: 500
      }
    ];
  }
}
