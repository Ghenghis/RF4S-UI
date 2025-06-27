
import { TagColor, ColorAnalysisResult, ColorMatchResult, DetectionConfiguration } from './types';

export class ColorAnalysisService {
  private config: DetectionConfiguration;

  constructor(config: DetectionConfiguration) {
    this.config = config;
  }

  updateConfiguration(config: DetectionConfiguration): void {
    this.config = config;
  }

  analyzeImageColors(imageData: ImageData, region?: { x: number; y: number; width: number; height: number }): ColorAnalysisResult[] {
    const colors: ColorAnalysisResult[] = [];
    
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const startX = region?.x || 0;
    const startY = region?.y || 0;
    const endX = Math.min(startX + (region?.width || width), width);
    const endY = Math.min(startY + (region?.height || height), height);
    
    // Sample pixels at intervals to find prominent colors
    for (let y = startY; y < endY; y += 5) {
      for (let x = startX; x < endX; x += 5) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        
        if (a > 128) { // Only consider non-transparent pixels
          colors.push({
            color: { r, g, b },
            count: 1,
            position: { x, y }
          });
        }
      }
    }
    
    return colors;
  }

  findBestColorMatch(detectedColors: ColorAnalysisResult[], tagColors: Map<string, TagColor>): ColorMatchResult | null {
    let bestMatch: ColorMatchResult | null = null;
    
    detectedColors.forEach(detected => {
      Array.from(tagColors.values()).forEach(tagColor => {
        if (!tagColor.enabled) return;
        
        const distance = this.calculateColorDistance(detected.color, tagColor.rgbValues);
        const tolerance = tagColor.tolerance || this.config.colorTolerance;
        
        if (distance <= tolerance) {
          const confidence = Math.max(0, 1 - (distance / tolerance));
          
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              color: tagColor,
              confidence,
              position: detected.position
            };
          }
        }
      });
    });
    
    return bestMatch;
  }

  private calculateColorDistance(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
    // Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
    );
  }
}
