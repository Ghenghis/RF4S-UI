
import { TagDetectionResult, TagDefinition, DetectionConfiguration } from './types';

export class TemplateMatchingService {
  private config: DetectionConfiguration;
  private tagDefinitions: Map<string, TagDefinition>;

  constructor(config: DetectionConfiguration, tagDefinitions: Map<string, TagDefinition>) {
    this.config = config;
    this.tagDefinitions = tagDefinitions;
  }

  updateConfiguration(config: DetectionConfiguration): void {
    this.config = config;
  }

  updateTagDefinitions(tagDefinitions: Map<string, TagDefinition>): void {
    this.tagDefinitions = tagDefinitions;
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
}
