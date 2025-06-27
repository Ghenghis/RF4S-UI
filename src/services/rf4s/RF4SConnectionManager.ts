
import { rf4sService } from '../../rf4s/services/rf4sService';
import { EventManager } from '../../core/EventManager';
import { RF4SDetectionService } from '../RF4SDetectionService';
import { RF4SAutomationService } from '../RF4SAutomationService';
import { RF4SFishingProfileService } from '../RF4SFishingProfileService';

export class RF4SConnectionManager {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('RF4SConnectionManager: Initializing connection to RF4S codebase...');
    
    // Initialize RF4S service
    rf4sService.startSession();
    
    // Initialize all sub-services
    RF4SDetectionService.start();
    RF4SAutomationService.start();
    RF4SFishingProfileService.start();
    
    this.isInitialized = true;
    console.log('RF4SConnectionManager: Successfully connected to RF4S codebase');

    // Emit connection event
    EventManager.emit('rf4s.codebase_connected', { connected: true }, 'RF4SConnectionManager');
  }

  async startScript(): Promise<boolean> {
    try {
      rf4sService.startSession();
      
      // Start all services
      if (!RF4SDetectionService.isGameDetected()) {
        RF4SDetectionService.start();
      }
      RF4SAutomationService.start();
      
      console.log('RF4S Script started via codebase');
      return true;
    } catch (error) {
      console.error('Failed to start RF4S script:', error);
      return false;
    }
  }

  async stopScript(): Promise<boolean> {
    try {
      rf4sService.stopSession();
      
      // Stop automation service
      RF4SAutomationService.stop();
      
      console.log('RF4S Script stopped via codebase');
      return true;
    } catch (error) {
      console.error('Failed to stop RF4S script:', error);
      return false;
    }
  }

  updateConfig(section: string, updates: any): void {
    rf4sService.updateConfig(section as any, updates);
    
    // Update detection service if detection settings changed
    if (section === 'detection') {
      RF4SDetectionService.updateDetectionSettings(updates);
    }
    
    // Update automation service if automation settings changed
    if (section === 'automation') {
      RF4SAutomationService.updateAutomationSettings(updates);
    }
  }

  getStatus() {
    return {
      isRunning: rf4sService.isSessionRunning(),
      results: rf4sService.getSessionResults(),
      config: rf4sService.getConfig(),
      stats: rf4sService.getSessionStats()
    };
  }

  updateFishCount(type: 'green' | 'yellow' | 'blue' | 'purple' | 'pink'): void {
    rf4sService.updateFishCount(type);
  }

  destroy(): void {
    // Stop all services
    RF4SDetectionService.stop();
    RF4SAutomationService.stop();
    RF4SFishingProfileService.stop();
    
    rf4sService.stopSession();
    this.isInitialized = false;
  }

  isConnected(): boolean {
    return this.isInitialized;
  }
}
