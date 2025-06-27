
import { createRichLogger } from '../rf4s/utils';
import { OCRRegion } from './OCRProcessingService';

export interface DetectionConfig {
  liveFeedEnabled: boolean;
  overlayEnabled: boolean;
  highlightRegions: boolean;
  confidenceDisplay: boolean;
  processingInterval: number;
}

export interface DetectionResult {
  type: 'fish_bite' | 'spool_tension' | 'cast_ready' | 'fish_caught' | 'template_match';
  confidence: number;
  region: OCRRegion;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface OverlayData {
  regions: Array<{
    region: OCRRegion;
    status: 'active' | 'detected' | 'inactive';
    confidence?: number;
  }>;
  detections: DetectionResult[];
}

class VisualDetectionProcessorImpl {
  private config: DetectionConfig;
  private logger = createRichLogger('VisualDetectionProcessor');
  private isProcessing: boolean = false;
  private liveFeedData: ImageData | null = null;
  private detectionCallbacks: Set<(results: DetectionResult[]) => void> = new Set();

  constructor() {
    this.config = {
      liveFeedEnabled: false,
      overlayEnabled: true,
      highlightRegions: true,
      confidenceDisplay: true,
      processingInterval: 100
    };
  }

  getConfig(): DetectionConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('Visual detection configuration updated');
  }

  processLiveImageFeed(imageData: ImageData): Promise<DetectionResult[]> {
    return new Promise((resolve) => {
      if (!this.config.liveFeedEnabled) {
        resolve([]);
        return;
      }

      this.isProcessing = true;
      this.liveFeedData = imageData;

      // Simulate image processing
      setTimeout(() => {
        const results = this.analyzeImageData(imageData);
        this.isProcessing = false;
        
        // Notify callbacks
        this.detectionCallbacks.forEach(callback => {
          try {
            callback(results);
          } catch (error) {
            this.logger.error('Error in detection callback:', error);
          }
        });

        resolve(results);
      }, this.config.processingInterval);
    });
  }

  processDetectionOverlay(regions: OCRRegion[]): OverlayData {
    const overlayData: OverlayData = {
      regions: regions.map(region => ({
        region,
        status: this.getRegionStatus(region),
        confidence: this.calculateRegionConfidence(region)
      })),
      detections: this.getRecentDetections()
    };

    return overlayData;
  }

  processTemplateMatching(templates: string[], currentImage: ImageData): Promise<DetectionResult[]> {
    return new Promise((resolve) => {
      this.logger.info(`Processing template matching for ${templates.length} templates`);
      
      // Simulate template matching
      setTimeout(() => {
        const results: DetectionResult[] = [];
        
        templates.forEach((templateId, index) => {
          if (Math.random() > 0.7) { // 30% chance of match
            results.push({
              type: 'template_match',
              confidence: 0.8 + Math.random() * 0.2,
              region: {
                id: `template_${templateId}`,
                name: `Template ${templateId}`,
                x: Math.floor(Math.random() * currentImage.width),
                y: Math.floor(Math.random() * currentImage.height),
                width: 100,
                height: 50,
                type: 'template'
              },
              timestamp: new Date(),
              metadata: { templateId }
            });
          }
        });

        resolve(results);
      }, 200);
    });
  }

  calculateConfidenceMetrics(detections: DetectionResult[]): Record<string, number> {
    if (detections.length === 0) {
      return {
        averageConfidence: 0,
        minConfidence: 0,
        maxConfidence: 0,
        totalDetections: 0
      };
    }

    const confidences = detections.map(d => d.confidence);
    return {
      averageConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
      minConfidence: Math.min(...confidences),
      maxConfidence: Math.max(...confidences),
      totalDetections: detections.length
    };
  }

  processRegionHighlighting(regions: OCRRegion[]): Array<{region: OCRRegion; highlight: boolean; color: string}> {
    return regions.map(region => ({
      region,
      highlight: this.config.highlightRegions,
      color: this.getRegionHighlightColor(region)
    }));
  }

  startLiveFeed(): void {
    this.config.liveFeedEnabled = true;
    this.logger.info('Live feed processing started');
  }

  stopLiveFeed(): void {
    this.config.liveFeedEnabled = false;
    this.logger.info('Live feed processing stopped');
  }

  onDetection(callback: (results: DetectionResult[]) => void): () => void {
    this.detectionCallbacks.add(callback);
    return () => this.detectionCallbacks.delete(callback);
  }

  getCurrentFeedData(): ImageData | null {
    return this.liveFeedData;
  }

  private analyzeImageData(imageData: ImageData): DetectionResult[] {
    const results: DetectionResult[] = [];
    
    // Simulate different types of detections
    const detectionTypes: DetectionResult['type'][] = ['fish_bite', 'spool_tension', 'cast_ready'];
    
    detectionTypes.forEach(type => {
      if (Math.random() > 0.8) { // 20% chance for each type
        results.push({
          type,
          confidence: 0.7 + Math.random() * 0.3,
          region: {
            id: `detection_${type}`,
            name: `${type} detection`,
            x: Math.floor(Math.random() * imageData.width),
            y: Math.floor(Math.random() * imageData.height),
            width: 50,
            height: 30,
            type: 'template'
          },
          timestamp: new Date()
        });
      }
    });

    return results;
  }

  private getRegionStatus(region: OCRRegion): 'active' | 'detected' | 'inactive' {
    // Simulate region status based on recent activity
    const random = Math.random();
    if (random > 0.8) return 'detected';
    if (random > 0.6) return 'active';
    return 'inactive';
  }

  private calculateRegionConfidence(region: OCRRegion): number {
    return 0.6 + Math.random() * 0.4; // Random confidence between 0.6-1.0
  }

  private getRecentDetections(): DetectionResult[] {
    // Return simulated recent detections
    return [];
  }

  private getRegionHighlightColor(region: OCRRegion): string {
    const colors = {
      'text': '#00ff00',
      'number': '#0000ff',
      'color': '#ff0000',
      'template': '#ffff00'
    };
    return colors[region.type] || '#ffffff';
  }
}

export const VisualDetectionProcessor = new VisualDetectionProcessorImpl();
