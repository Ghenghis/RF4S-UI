
/**
 * Service layer to connect RF4S logic with UI components.
 */

import { RF4SResult, CraftResult, HarvestResult } from '../result/result';
import { Timer } from '../controller/timer';
import { getDefaultConfig, RF4SConfigDefaults } from '../config/defaults';
import { createRichLogger } from '../utils';

export class RF4SService {
  private config: RF4SConfigDefaults;
  private result: RF4SResult;
  private timer: Timer;
  private logger = createRichLogger('RF4SService');
  private isRunning: boolean = false;
  private sessionCallbacks: Set<(data: any) => void> = new Set();

  constructor() {
    this.config = getDefaultConfig();
    this.result = new RF4SResult();
    this.timer = new Timer();
  }

  // Configuration management
  getConfig(): RF4SConfigDefaults {
    return { ...this.config };
  }

  updateConfig(section: keyof RF4SConfigDefaults, updates: Partial<any>): void {
    this.config = {
      ...this.config,
      [section]: { ...this.config[section], ...updates }
    };
    this.logger.info(`Configuration updated: ${section}`);
  }

  // Session management
  startSession(): void {
    if (this.isRunning) {
      this.logger.warning('Session already running');
      return;
    }

    this.isRunning = true;
    this.timer = new Timer();
    this.result = new RF4SResult();
    this.logger.info('Session started');
    this.notifySessionUpdate();
  }

  stopSession(): void {
    if (!this.isRunning) {
      this.logger.warning('No session running');
      return;
    }

    this.isRunning = false;
    this.logger.info('Session stopped');
    this.notifySessionUpdate();
  }

  isSessionRunning(): boolean {
    return this.isRunning;
  }

  // Results and statistics
  getSessionResults(): RF4SResult {
    return { ...this.result };
  }

  getSessionStats(): Record<string, string | number> {
    return this.result.asDict('Current session', this.timer);
  }

  getTimer(): Timer {
    return this.timer;
  }

  // Real-time updates
  updateFishCount(type: 'green' | 'yellow' | 'blue' | 'purple' | 'pink'): void {
    this.result[type]++;
    this.result.total++;
    this.notifySessionUpdate();
  }

  updateKeptFish(): void {
    this.result.kept++;
    this.notifySessionUpdate();
  }

  updateConsumables(type: 'tea' | 'carrot' | 'alcohol' | 'coffee', amount: number = 1): void {
    this.result[type] += amount;
    this.notifySessionUpdate();
  }

  updateBaitHarvested(amount: number = 1): void {
    this.result.bait += amount;
    this.notifySessionUpdate();
  }

  // Event callbacks
  onSessionUpdate(callback: (data: any) => void): () => void {
    this.sessionCallbacks.add(callback);
    return () => this.sessionCallbacks.delete(callback);
  }

  private notifySessionUpdate(): void {
    const data = {
      isRunning: this.isRunning,
      results: this.getSessionResults(),
      stats: this.getSessionStats(),
      timer: {
        runningTime: this.timer.getRunningTimeStr(),
        startTime: this.timer.getStartDateTime(),
      }
    };

    this.sessionCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error('Error in session callback:', error);
      }
    });
  }

  // Validation and helpers
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.detection.spoolConfidence < 0.1 || this.config.detection.spoolConfidence > 1.0) {
      errors.push('Spool confidence must be between 0.1 and 1.0');
    }

    if (this.config.detection.fishBite < 0.1 || this.config.detection.fishBite > 1.0) {
      errors.push('Fish bite confidence must be between 0.1 and 1.0');
    }

    if (this.config.automation.castDelayMin > this.config.automation.castDelayMax) {
      errors.push('Cast delay minimum cannot be greater than maximum');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(configJson);
      this.config = { ...this.config, ...imported };
      this.logger.info('Configuration imported successfully');
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to import configuration:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  resetConfig(): void {
    this.config = getDefaultConfig();
    this.logger.info('Configuration reset to defaults');
  }
}

// Singleton instance
export const rf4sService = new RF4SService();
