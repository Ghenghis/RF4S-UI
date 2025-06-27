
import { createRichLogger } from '../rf4s/utils';

export interface TagColor {
  id: string;
  name: string;
  hexCode: string;
  rgbValues: { r: number; g: number; b: number };
  hsvValues: { h: number; s: number; v: number };
  tolerance: number;
  enabled: boolean;
}

export interface TagDefinition {
  id: string;
  name: string;
  colors: TagColor[];
  shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'custom';
  size: { width: number; height: number };
  position: 'fin' | 'body' | 'head' | 'tail' | 'any';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  value: number;
}

export interface TagDetectionResult {
  detected: boolean;
  tagDefinition: TagDefinition | null;
  confidence: number;
  position: { x: number; y: number } | null;
  colorMatch: TagColor | null;
  timestamp: Date;
  metadata: {
    imageData?: string;
    processingTime: number;
    detectionMethod: 'color' | 'template' | 'hybrid';
  };
}

export interface DetectionConfiguration {
  colorTolerance: number;
  minimumTagSize: number;
  maximumTagSize: number;
  confidenceThreshold: number;
  enableColorDetection: boolean;
  enableTemplateMatching: boolean;
  enableHybridDetection: boolean;
  processMultipleTags: boolean;
}

class TagDetectionLogicImpl {
  private tagDefinitions: Map<string, TagDefinition> = new Map();
  private tagColors: Map<string, TagColor> = new Map();
  private config: DetectionConfiguration;
  private logger = createRichLogger('TagDetectionLogic');
  private detectionHistory: TagDetectionResult[] = [];

  constructor() {
    this.config = {
      colorTolerance: 25,
      minimumTagSize: 10,
      maximumTagSize: 100,
      confidenceThreshold: 0.7,
      enableColorDetection: true,
      enableTemplateMatching: false,
      enableHybridDetection: false,
      processMultipleTags: true
    };
    
    this.initializeDefaultTags();
  }

  updateConfiguration(updates: Partial<DetectionConfiguration>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('Tag detection configuration updated');
  }

  addTagDefinition(tagDef: TagDefinition): void {
    this.tagDefinitions.set(tagDef.id, tagDef);
    
    // Add associated colors
    tagDef.colors.forEach(color => {
      this.tagColors.set(color.id, color);
    });
    
    this.logger.info(`Tag definition added: ${tagDef.name}`);
  }

  removeTagDefinition(tagId: string): boolean {
    const tagDef = this.tagDefinitions.get(tagId);
    if (!tagDef) {
      return false;
    }

    // Remove associated colors
    tagDef.colors.forEach(color => {
      this.tagColors.delete(color.id);
    });

    const removed = this.tagDefinitions.delete(tagId);
    if (removed) {
      this.logger.info(`Tag definition removed: ${tagId}`);
    }
    return removed;
  }

  processColorBasedDetection(imageData: ImageData, region?: { x: number; y: number; width: number; height: number }): TagDetectionResult {
    const startTime = Date.now();
    
    if (!this.config.enableColorDetection) {
      return this.createNegativeResult('color', Date.now() - startTime);
    }

    try {
      const detectedColors = this.analyzeImageColors(imageData, region);
      const bestMatch = this.findBestColorMatch(detectedColors);
      
      if (bestMatch) {
        const tagDef = this.findTagByColor(bestMatch.color);
        
        return {
          detected: true,
          tagDefinition: tagDef,
          confidence: bestMatch.confidence,
          position: bestMatch.position,
          colorMatch: bestMatch.color,
          timestamp: new Date(),
          metadata: {
            processingTime: Date.now() - startTime,
            detectionMethod: 'color'
          }
        };
      }

      return this.createNegativeResult('color', Date.now() - startTime);
    } catch (error) {
      this.logger.error('Color-based detection error:', error);
      return this.createNegativeResult('color', Date.now() - startTime);
    }
  }

  processTemplateMatching(imageData: ImageData, templateIds: string[]): Promise<TagDetectionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      if (!this.config.enableTemplateMatching) {
        resolve(this.createNegativeResult('template', Date.now() - startTime));
        return;
      }

      // Simulate template matching processing
      setTimeout(() => {
        const matchFound = Math.random() > 0.7; // 30% match rate
        
        if (matchFound && templateIds.length > 0) {
          const randomTemplateId = templateIds[Math.floor(Math.random() * templateIds.length)];
          const tagDef = this.tagDefinitions.get(randomTemplateId);
          
          if (tagDef) {
            resolve({
              detected: true,
              tagDefinition: tagDef,
              confidence: 0.8 + Math.random() * 0.2,
              position: {
                x: Math.floor(Math.random() * imageData.width),
                y: Math.floor(Math.random() * imageData.height)
              },
              colorMatch: tagDef.colors[0] || null,
              timestamp: new Date(),
              metadata: {
                processingTime: Date.now() - startTime,
                detectionMethod: 'template'
              }
            });
            return;
          }
        }

        resolve(this.createNegativeResult('template', Date.now() - startTime));
      }, 150);
    });
  }

  processHybridDetection(imageData: ImageData, templateIds: string[]): Promise<TagDetectionResult> {
    return new Promise(async (resolve) => {
      const startTime = Date.now();
      
      if (!this.config.enableHybridDetection) {
        resolve(this.createNegativeResult('hybrid', Date.now() - startTime));
        return;
      }

      try {
        // Combine color detection and template matching
        const colorResult = this.processColorBasedDetection(imageData);
        const templateResult = await this.processTemplateMatching(imageData, templateIds);

        // Determine best result
        let bestResult: TagDetectionResult;
        
        if (colorResult.detected && templateResult.detected) {
          // Both detected - use higher confidence
          bestResult = colorResult.confidence > templateResult.confidence ? colorResult : templateResult;
          bestResult.confidence = Math.min(bestResult.confidence * 1.2, 1.0); // Boost confidence for hybrid match
        } else if (colorResult.detected) {
          bestResult = colorResult;
        } else if (templateResult.detected) {
          bestResult = templateResult;
        } else {
          bestResult = this.createNegativeResult('hybrid', Date.now() - startTime);
        }

        bestResult.metadata.detectionMethod = 'hybrid';
        bestResult.metadata.processingTime = Date.now() - startTime;
        
        resolve(bestResult);
      } catch (error) {
        this.logger.error('Hybrid detection error:', error);
        resolve(this.createNegativeResult('hybrid', Date.now() - startTime));
      }
    });
  }

  processMultiTagDetection(imageData: ImageData): TagDetectionResult[] {
    if (!this.config.processMultipleTags) {
      const singleResult = this.processColorBasedDetection(imageData);
      return singleResult.detected ? [singleResult] : [];
    }

    const results: TagDetectionResult[] = [];
    
    // Divide image into regions for multi-tag detection
    const regions = this.generateDetectionRegions(imageData);
    
    regions.forEach(region => {
      const result = this.processColorBasedDetection(imageData, region);
      if (result.detected && result.confidence >= this.config.confidenceThreshold) {
        results.push(result);
      }
    });

    this.logger.info(`Multi-tag detection found ${results.length} tags`);
    return results;
  }

  getDetectionStatistics(): {
    totalDetections: number;
    successfulDetections: number;
    averageConfidence: number;
    detectionsByMethod: Record<string, number>;
    detectionsByTag: Record<string, number>;
    recentDetections: TagDetectionResult[];
  } {
    const successful = this.detectionHistory.filter(d => d.detected);
    const methodCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    this.detectionHistory.forEach(detection => {
      const method = detection.metadata.detectionMethod;
      methodCounts[method] = (methodCounts[method] || 0) + 1;
      
      if (detection.detected && detection.tagDefinition) {
        const tagName = detection.tagDefinition.name;
        tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
      }
    });

    const avgConfidence = successful.length > 0 
      ? successful.reduce((sum, d) => sum + d.confidence, 0) / successful.length 
      : 0;

    return {
      totalDetections: this.detectionHistory.length,
      successfulDetections: successful.length,
      averageConfidence: avgConfidence,
      detectionsByMethod: methodCounts,
      detectionsByTag: tagCounts,
      recentDetections: this.detectionHistory.slice(-10)
    };
  }

  private analyzeImageColors(imageData: ImageData, region?: { x: number; y: number; width: number; height: number }): Array<{ color: { r: number; g: number; b: number }; count: number; position: { x: number; y: number } }> {
    const colors: Array<{ color: { r: number; g: number; b: number }; count: number; position: { x: number; y: number } }> = [];
    
    // Simplified color analysis - in real implementation would use more sophisticated algorithms
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

  private findBestColorMatch(detectedColors: Array<{ color: { r: number; g: number; b: number }; count: number; position: { x: number; y: number } }>): { color: TagColor; confidence: number; position: { x: number; y: number } } | null {
    let bestMatch: { color: TagColor; confidence: number; position: { x: number; y: number } } | null = null;
    
    detectedColors.forEach(detected => {
      Array.from(this.tagColors.values()).forEach(tagColor => {
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

  private findTagByColor(color: TagColor): TagDefinition | null {
    for (const tagDef of this.tagDefinitions.values()) {
      if (tagDef.colors.some(c => c.id === color.id)) {
        return tagDef;
      }
    }
    return null;
  }

  private generateDetectionRegions(imageData: ImageData): Array<{ x: number; y: number; width: number; height: number }> {
    const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
    const regionSize = 100; // 100x100 pixel regions
    
    for (let y = 0; y < imageData.height; y += regionSize) {
      for (let x = 0; x < imageData.width; x += regionSize) {
        regions.push({
          x,
          y,
          width: Math.min(regionSize, imageData.width - x),
          height: Math.min(regionSize, imageData.height - y)
        });
      }
    }
    
    return regions;
  }

  private createNegativeResult(method: string, processingTime: number): TagDetectionResult {
    return {
      detected: false,
      tagDefinition: null,
      confidence: 0,
      position: null,
      colorMatch: null,
      timestamp: new Date(),
      metadata: {
        processingTime,
        detectionMethod: method as any
      }
    };
  }

  private initializeDefaultTags(): void {
    const defaultColors: TagColor[] = [
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

    defaultColors.forEach(color => {
      this.tagColors.set(color.id, color);
    });

    const defaultTags: TagDefinition[] = [
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

    defaultTags.forEach(tag => {
      this.tagDefinitions.set(tag.id, tag);
    });
  }
}

export const TagDetectionLogic = new TagDetectionLogicImpl();
