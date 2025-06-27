
import { createRichLogger } from '../rf4s/utils';

export interface OCRConfig {
  confidenceThreshold: number;
  language: string;
  templateMatchingEnabled: boolean;
  regionDefinitions: OCRRegion[];
  calibrationData: CalibrationData;
}

export interface OCRRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'text' | 'number' | 'color' | 'template';
}

export interface CalibrationData {
  screenResolution: { width: number; height: number };
  gameWindowBounds: { x: number; y: number; width: number; height: number };
  lastCalibrated: Date;
}

export interface OCRResult {
  text: string;
  confidence: number;
  region: OCRRegion;
  timestamp: Date;
}

class OCRProcessingServiceImpl {
  private config: OCRConfig;
  private logger = createRichLogger('OCRProcessingService');
  private isProcessing: boolean = false;

  constructor() {
    this.config = {
      confidenceThreshold: 0.8,
      language: 'en',
      templateMatchingEnabled: true,
      regionDefinitions: this.getDefaultRegions(),
      calibrationData: {
        screenResolution: { width: 1920, height: 1080 },
        gameWindowBounds: { x: 0, y: 0, width: 1920, height: 1080 },
        lastCalibrated: new Date()
      }
    };
  }

  getConfig(): OCRConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<OCRConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('OCR configuration updated');
  }

  processConfidenceThreshold(threshold: number): boolean {
    if (threshold < 0.1 || threshold > 1.0) {
      this.logger.warning(`Invalid confidence threshold: ${threshold}. Must be between 0.1 and 1.0`);
      return false;
    }
    this.config.confidenceThreshold = threshold;
    return true;
  }

  processLanguageSelection(language: string): boolean {
    const supportedLanguages = ['en', 'ru', 'de', 'fr', 'es', 'it'];
    if (!supportedLanguages.includes(language)) {
      this.logger.warning(`Unsupported language: ${language}`);
      return false;
    }
    this.config.language = language;
    this.logger.info(`Language set to: ${language}`);
    return true;
  }

  processTemplateMatching(imageData: ImageData, templateId: string): Promise<OCRResult[]> {
    return new Promise((resolve) => {
      if (!this.config.templateMatchingEnabled) {
        resolve([]);
        return;
      }

      this.isProcessing = true;
      // Simulate template matching processing
      setTimeout(() => {
        const results: OCRResult[] = [];
        
        // Simulate finding matches
        if (Math.random() > 0.3) {
          results.push({
            text: `Template_${templateId}_Match`,
            confidence: 0.85 + Math.random() * 0.15,
            region: this.config.regionDefinitions[0],
            timestamp: new Date()
          });
        }

        this.isProcessing = false;
        resolve(results);
      }, 100);
    });
  }

  processRegionDefinition(region: OCRRegion): boolean {
    // Validate region bounds
    if (region.x < 0 || region.y < 0 || region.width <= 0 || region.height <= 0) {
      this.logger.error(`Invalid region bounds for ${region.name}`);
      return false;
    }

    const existingIndex = this.config.regionDefinitions.findIndex(r => r.id === region.id);
    if (existingIndex >= 0) {
      this.config.regionDefinitions[existingIndex] = region;
    } else {
      this.config.regionDefinitions.push(region);
    }

    this.logger.info(`Region ${region.name} processed successfully`);
    return true;
  }

  processCalibration(screenCapture: ImageData): Promise<CalibrationData> {
    return new Promise((resolve) => {
      this.logger.info('Starting calibration process...');
      
      // Simulate calibration processing
      setTimeout(() => {
        const calibrationData: CalibrationData = {
          screenResolution: { width: screenCapture.width, height: screenCapture.height },
          gameWindowBounds: this.detectGameWindow(screenCapture),
          lastCalibrated: new Date()
        };

        this.config.calibrationData = calibrationData;
        this.logger.info('Calibration completed successfully');
        resolve(calibrationData);
      }, 2000);
    });
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  getProcessingStats(): Record<string, number> {
    return {
      regionsConfigured: this.config.regionDefinitions.length,
      confidenceThreshold: this.config.confidenceThreshold,
      lastCalibrationAge: Date.now() - this.config.calibrationData.lastCalibrated.getTime()
    };
  }

  private getDefaultRegions(): OCRRegion[] {
    return [
      {
        id: 'fish_name',
        name: 'Fish Name Region',
        x: 100,
        y: 200,
        width: 300,
        height: 50,
        type: 'text'
      },
      {
        id: 'weight_display',
        name: 'Weight Display',
        x: 500,
        y: 300,
        width: 150,
        height: 30,
        type: 'number'
      }
    ];
  }

  private detectGameWindow(screenCapture: ImageData): { x: number; y: number; width: number; height: number } {
    // Simulate game window detection
    return {
      x: Math.floor(screenCapture.width * 0.1),
      y: Math.floor(screenCapture.height * 0.1),
      width: Math.floor(screenCapture.width * 0.8),
      height: Math.floor(screenCapture.height * 0.8)
    };
  }
}

export const OCRProcessingService = new OCRProcessingServiceImpl();
