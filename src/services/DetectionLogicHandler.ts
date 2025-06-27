
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';
import { StatisticsCalculator } from './StatisticsCalculator';

interface DetectionConfig {
  spoolThreshold: number;
  fishBiteThreshold: number;
  rodTipThreshold: number;
  ocrThreshold: number;
  adaptiveMode: boolean;
}

interface CalibrationData {
  sampleCount: number;
  averageConfidence: number;
  recommendedThreshold: number;
  accuracy: number;
}

class DetectionLogicHandlerImpl {
  private config: DetectionConfig;
  private calibrationData: Map<string, CalibrationData> = new Map();
  private recentDetections: Array<{ type: string; confidence: number; timestamp: Date }> = [];
  private maxHistorySize = 100;

  constructor() {
    this.config = {
      spoolThreshold: 0.98,
      fishBiteThreshold: 0.85,
      rodTipThreshold: 0.7,
      ocrThreshold: 0.8,
      adaptiveMode: true
    };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for detection results to process and validate
    EventManager.subscribe('rf4s.detection_result', (result: any) => {
      this.processDetectionResult(result);
    });

    // Listen for configuration updates
    EventManager.subscribe('config.detection_updated', (config: any) => {
      this.updateConfiguration(config);
    });
  }

  private processDetectionResult(result: any): void {
    const { type, confidence, timestamp } = result;
    
    // Store detection history
    this.recentDetections.push({ type, confidence, timestamp });
    if (this.recentDetections.length > this.maxHistorySize) {
      this.recentDetections.shift();
    }

    // Validate detection confidence
    const isValidDetection = this.validateDetection(type, confidence);
    
    if (isValidDetection) {
      this.handleValidDetection(result);
    } else {
      this.handleInvalidDetection(result);
    }

    // Update calibration data
    this.updateCalibrationData(type, confidence, isValidDetection);

    // Adapt thresholds if adaptive mode is enabled
    if (this.config.adaptiveMode) {
      this.adaptThresholds();
    }
  }

  private validateDetection(type: string, confidence: number): boolean {
    const threshold = this.getThresholdForType(type);
    return confidence >= threshold;
  }

  private getThresholdForType(type: string): number {
    switch (type) {
      case 'spool':
        return this.config.spoolThreshold;
      case 'fish_bite':
        return this.config.fishBiteThreshold;
      case 'rod_tip':
        return this.config.rodTipThreshold;
      case 'ocr':
        return this.config.ocrThreshold;
      default:
        return 0.5;
    }
  }

  private handleValidDetection(result: any): void {
    console.log('Valid detection processed:', result.type, result.confidence);
    
    // Update statistics
    if (result.type === 'fish_bite') {
      StatisticsCalculator.recordCast();
    }

    // Emit validated detection event
    EventManager.emit('detection.validated', {
      ...result,
      validated: true,
      threshold: this.getThresholdForType(result.type)
    }, 'DetectionLogicHandler');
  }

  private handleInvalidDetection(result: any): void {
    console.log('Invalid detection filtered:', result.type, result.confidence);
    
    // Emit filtered detection event for monitoring
    EventManager.emit('detection.filtered', {
      ...result,
      validated: false,
      threshold: this.getThresholdForType(result.type),
      reason: 'Below confidence threshold'
    }, 'DetectionLogicHandler');
  }

  private updateCalibrationData(type: string, confidence: number, isValid: boolean): void {
    if (!this.calibrationData.has(type)) {
      this.calibrationData.set(type, {
        sampleCount: 0,
        averageConfidence: 0,
        recommendedThreshold: this.getThresholdForType(type),
        accuracy: 0
      });
    }

    const data = this.calibrationData.get(type)!;
    data.sampleCount++;
    data.averageConfidence = (data.averageConfidence * (data.sampleCount - 1) + confidence) / data.sampleCount;
    
    // Calculate accuracy based on validation success
    data.accuracy = this.calculateAccuracyForType(type);
    
    // Update recommended threshold
    data.recommendedThreshold = this.calculateRecommendedThreshold(type);
  }

  private calculateAccuracyForType(type: string): number {
    const typeDetections = this.recentDetections.filter(d => d.type === type);
    if (typeDetections.length === 0) return 100;
    
    const validCount = typeDetections.filter(d => 
      d.confidence >= this.getThresholdForType(type)
    ).length;
    
    return Math.round((validCount / typeDetections.length) * 100);
  }

  private calculateRecommendedThreshold(type: string): number {
    const typeDetections = this.recentDetections.filter(d => d.type === type);
    if (typeDetections.length < 10) {
      return this.getThresholdForType(type);
    }

    // Calculate optimal threshold based on confidence distribution
    const confidences = typeDetections.map(d => d.confidence).sort((a, b) => b - a);
    const percentile75 = confidences[Math.floor(confidences.length * 0.25)];
    
    return Math.max(0.5, Math.min(0.99, percentile75 || this.getThresholdForType(type)));
  }

  private adaptThresholds(): void {
    // Only adapt if we have enough data
    const minSamples = 20;
    
    for (const [type, data] of this.calibrationData.entries()) {
      if (data.sampleCount >= minSamples && data.accuracy < 80) {
        // Increase threshold if accuracy is too low
        const newThreshold = Math.min(0.99, data.recommendedThreshold + 0.05);
        this.updateThresholdForType(type, newThreshold);
      } else if (data.sampleCount >= minSamples && data.accuracy > 95) {
        // Decrease threshold if accuracy is very high (might be too strict)
        const newThreshold = Math.max(0.3, data.recommendedThreshold - 0.02);
        this.updateThresholdForType(type, newThreshold);
      }
    }
  }

  private updateThresholdForType(type: string, threshold: number): void {
    switch (type) {
      case 'spool':
        this.config.spoolThreshold = threshold;
        break;
      case 'fish_bite':
        this.config.fishBiteThreshold = threshold;
        break;
      case 'rod_tip':
        this.config.rodTipThreshold = threshold;
        break;
      case 'ocr':
        this.config.ocrThreshold = threshold;
        break;
    }

    // Update RF4S configuration
    rf4sService.updateConfig('detection', {
      [`${type}Confidence`]: threshold
    });

    console.log(`Adapted ${type} threshold to ${threshold.toFixed(3)}`);
  }

  updateConfiguration(config: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Detection configuration updated:', config);
  }

  getDetectionConfig(): DetectionConfig {
    return { ...this.config };
  }

  getCalibrationData(): Record<string, CalibrationData> {
    const result: Record<string, CalibrationData> = {};
    for (const [key, value] of this.calibrationData.entries()) {
      result[key] = { ...value };
    }
    return result;
  }

  getDetectionHistory(): Array<{ type: string; confidence: number; timestamp: Date }> {
    return [...this.recentDetections];
  }

  clearCalibrationData(): void {
    this.calibrationData.clear();
    console.log('Calibration data cleared');
  }

  exportCalibrationData(): string {
    return JSON.stringify(Object.fromEntries(this.calibrationData), null, 2);
  }
}

export const DetectionLogicHandler = new DetectionLogicHandlerImpl();
