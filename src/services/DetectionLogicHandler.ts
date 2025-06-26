
import { EventManager } from '../core/EventManager';
import { useRF4SStore } from '../stores/rf4sStore';

export interface OCRSettings {
  confidence: number;
  language: string;
  regions: DetectionRegion[];
  preprocessingEnabled: boolean;
  scalingFactor: number;
}

export interface DetectionRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spool' | 'fish' | 'bite' | 'ui';
  confidence: number;
}

export interface VisualDetectionResult {
  detected: boolean;
  confidence: number;
  region: DetectionRegion;
  timestamp: number;
  matchType: 'template' | 'ocr' | 'color';
}

export interface TemplateMatch {
  templateId: string;
  confidence: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

class DetectionLogicHandlerImpl {
  private ocrSettings: OCRSettings = {
    confidence: 0.8,
    language: 'en',
    regions: [],
    preprocessingEnabled: true,
    scalingFactor: 1.0
  };

  private detectionRegions: DetectionRegion[] = [
    {
      id: 'spool-area',
      name: 'Spool Detection',
      x: 100, y: 100, width: 200, height: 50,
      type: 'spool',
      confidence: 0.97
    },
    {
      id: 'fish-bite',
      name: 'Fish Bite Indicator',
      x: 300, y: 150, width: 100, height: 30,
      type: 'bite',
      confidence: 0.85
    }
  ];

  private recentDetections: VisualDetectionResult[] = [];
  private maxDetectionHistory = 100;

  configureOCR(settings: Partial<OCRSettings>): void {
    this.ocrSettings = { ...this.ocrSettings, ...settings };
    
    // Update store with new detection settings
    const { updateConfig } = useRF4SStore.getState();
    updateConfig('detection', {
      ocrConfidence: this.ocrSettings.confidence,
      spoolConfidence: this.getRegionConfidence('spool'),
      fishBite: this.getRegionConfidence('bite')
    });

    EventManager.emit('detection.ocr_configured', this.ocrSettings, 'DetectionLogicHandler');
  }

  addDetectionRegion(region: Omit<DetectionRegion, 'id'>): string {
    const id = `region-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRegion: DetectionRegion = { ...region, id };
    
    this.detectionRegions.push(newRegion);
    
    EventManager.emit('detection.region_added', newRegion, 'DetectionLogicHandler');
    return id;
  }

  updateDetectionRegion(id: string, updates: Partial<DetectionRegion>): boolean {
    const regionIndex = this.detectionRegions.findIndex(r => r.id === id);
    if (regionIndex === -1) return false;

    this.detectionRegions[regionIndex] = { 
      ...this.detectionRegions[regionIndex], 
      ...updates 
    };

    EventManager.emit('detection.region_updated', {
      id,
      region: this.detectionRegions[regionIndex]
    }, 'DetectionLogicHandler');

    return true;
  }

  removeDetectionRegion(id: string): boolean {
    const initialLength = this.detectionRegions.length;
    this.detectionRegions = this.detectionRegions.filter(r => r.id !== id);
    
    if (this.detectionRegions.length < initialLength) {
      EventManager.emit('detection.region_removed', { id }, 'DetectionLogicHandler');
      return true;
    }
    return false;
  }

  processDetection(regionId: string, confidence: number, matchType: 'template' | 'ocr' | 'color'): VisualDetectionResult {
    const region = this.detectionRegions.find(r => r.id === regionId);
    if (!region) {
      throw new Error(`Detection region ${regionId} not found`);
    }

    const result: VisualDetectionResult = {
      detected: confidence >= region.confidence,
      confidence,
      region,
      timestamp: Date.now(),
      matchType
    };

    this.addToDetectionHistory(result);
    
    if (result.detected) {
      EventManager.emit('detection.positive_match', result, 'DetectionLogicHandler');
      this.handlePositiveDetection(result);
    }

    return result;
  }

  validateTemplateMatch(match: TemplateMatch, region: DetectionRegion): boolean {
    // Check if match position is within region bounds
    const withinBounds = (
      match.position.x >= region.x &&
      match.position.y >= region.y &&
      match.position.x + match.size.width <= region.x + region.width &&
      match.position.y + match.size.height <= region.y + region.height
    );

    // Check confidence threshold
    const meetsConfidence = match.confidence >= region.confidence;

    return withinBounds && meetsConfidence;
  }

  calibrateDetectionThresholds(): void {
    // Analyze recent detection history to optimize thresholds
    const recentResults = this.recentDetections.slice(-50);
    
    if (recentResults.length < 10) return;

    const regionStats = new Map<string, { successes: number; total: number; avgConfidence: number }>();

    recentResults.forEach(result => {
      const regionId = result.region.id;
      const stats = regionStats.get(regionId) || { successes: 0, total: 0, avgConfidence: 0 };
      
      stats.total++;
      if (result.detected) {
        stats.successes++;
      }
      stats.avgConfidence = (stats.avgConfidence * (stats.total - 1) + result.confidence) / stats.total;
      
      regionStats.set(regionId, stats);
    });

    // Update region confidence thresholds based on performance
    regionStats.forEach((stats, regionId) => {
      const successRate = stats.successes / stats.total;
      const region = this.detectionRegions.find(r => r.id === regionId);
      
      if (region && successRate < 0.8) {
        // Lower threshold if success rate is low
        const newConfidence = Math.max(0.5, region.confidence - 0.05);
        this.updateDetectionRegion(regionId, { confidence: newConfidence });
      } else if (region && successRate > 0.95) {
        // Raise threshold if success rate is too high (might be false positives)
        const newConfidence = Math.min(0.99, region.confidence + 0.02);
        this.updateDetectionRegion(regionId, { confidence: newConfidence });
      }
    });

    EventManager.emit('detection.calibration_complete', {
      regionsCalibrated: regionStats.size,
      timestamp: Date.now()
    }, 'DetectionLogicHandler');
  }

  getDetectionHistory(regionType?: DetectionRegion['type']): VisualDetectionResult[] {
    if (!regionType) {
      return [...this.recentDetections];
    }
    
    return this.recentDetections.filter(d => d.region.type === regionType);
  }

  getDetectionRegions(): DetectionRegion[] {
    return [...this.detectionRegions];
  }

  getOCRSettings(): OCRSettings {
    return { ...this.ocrSettings };
  }

  private getRegionConfidence(type: DetectionRegion['type']): number {
    const region = this.detectionRegions.find(r => r.type === type);
    return region ? region.confidence : 0.8;
  }

  private addToDetectionHistory(result: VisualDetectionResult): void {
    this.recentDetections.push(result);
    
    if (this.recentDetections.length > this.maxDetectionHistory) {
      this.recentDetections.shift();
    }
  }

  private handlePositiveDetection(result: VisualDetectionResult): void {
    switch (result.region.type) {
      case 'spool':
        EventManager.emit('fishing.spool_detected', result, 'DetectionLogicHandler');
        break;
      case 'bite':
        EventManager.emit('fishing.bite_detected', result, 'DetectionLogicHandler');
        break;
      case 'fish':
        EventManager.emit('fishing.fish_detected', result, 'DetectionLogicHandler');
        break;
    }
  }
}

export const DetectionLogicHandler = new DetectionLogicHandlerImpl();
