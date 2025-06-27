
import { createRichLogger } from '../../rf4s/utils';
import { 
  TagColor, 
  TagDefinition, 
  TagDetectionResult, 
  DetectionConfiguration,
  ColorAnalysisResult
} from './types';
import { ColorAnalysisService } from './ColorAnalysisService';
import { TemplateMatchingService } from './TemplateMatchingService';
import { DefaultTagsProvider } from './DefaultTagsProvider';

class TagDetectionLogicImpl {
  private tagDefinitions: Map<string, TagDefinition> = new Map();
  private tagColors: Map<string, TagColor> = new Map();
  private config: DetectionConfiguration;
  private logger = createRichLogger('TagDetectionLogic');
  private detectionHistory: TagDetectionResult[] = [];
  private colorAnalysisService: ColorAnalysisService;
  private templateMatchingService: TemplateMatchingService;

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
    
    this.colorAnalysisService = new ColorAnalysisService(this.config);
    this.templateMatchingService = new TemplateMatchingService(this.config, this.tagDefinitions);
    this.initializeDefaultTags();
  }

  updateConfiguration(updates: Partial<DetectionConfiguration>): void {
    this.config = { ...this.config, ...updates };
    this.colorAnalysisService.updateConfiguration(this.config);
    this.templateMatchingService.updateConfiguration(this.config);
    this.logger.info('Tag detection configuration updated');
  }

  addTagDefinition(tagDef: TagDefinition): void {
    this.tagDefinitions.set(tagDef.id, tagDef);
    
    // Add associated colors
    tagDef.colors.forEach(color => {
      this.tagColors.set(color.id, color);
    });
    
    this.templateMatchingService.updateTagDefinitions(this.tagDefinitions);
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
      this.templateMatchingService.updateTagDefinitions(this.tagDefinitions);
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
      const detectedColors = this.colorAnalysisService.analyzeImageColors(imageData, region);
      const bestMatch = this.colorAnalysisService.findBestColorMatch(detectedColors, this.tagColors);
      
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
    return this.templateMatchingService.processTemplateMatching(imageData, templateIds);
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
    const defaultColors = DefaultTagsProvider.getDefaultColors();
    const defaultTags = DefaultTagsProvider.getDefaultTags();

    defaultColors.forEach(color => {
      this.tagColors.set(color.id, color);
    });

    defaultTags.forEach(tag => {
      this.tagDefinitions.set(tag.id, tag);
    });
  }
}

export const TagDetectionLogic = new TagDetectionLogicImpl();
export * from './types';
