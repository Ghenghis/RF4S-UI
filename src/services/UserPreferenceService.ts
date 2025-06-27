
import { EventManager } from '../core/EventManager';

interface UserPreference {
  key: string;
  value: any;
  category: 'ui' | 'automation' | 'detection' | 'performance';
  timestamp: Date;
}

interface PreferenceUpdate {
  key: string;
  value: any;
  category: string;
}

class UserPreferenceServiceImpl {
  private preferences: Map<string, UserPreference> = new Map();
  private persistenceKey = 'rf4s_user_preferences';

  start(): void {
    console.log('User Preference Service started');
    this.loadPreferences();
    this.setupEventListeners();
  }

  stop(): void {
    this.savePreferences();
    console.log('User Preference Service stopped');
  }

  private setupEventListeners(): void {
    EventManager.subscribe('preference.update', (data: PreferenceUpdate) => {
      this.setPreference(data.key, data.value, data.category as any);
    });

    EventManager.subscribe('preference.reset', (category: string) => {
      this.resetCategory(category as any);
    });
  }

  setPreference(key: string, value: any, category: 'ui' | 'automation' | 'detection' | 'performance'): void {
    const preference: UserPreference = {
      key,
      value,
      category,
      timestamp: new Date()
    };

    this.preferences.set(key, preference);
    this.savePreferences();

    EventManager.emit('preference.changed', preference, 'UserPreferenceService');
  }

  getPreference(key: string, defaultValue: any = null): any {
    const preference = this.preferences.get(key);
    return preference ? preference.value : defaultValue;
  }

  getPreferencesByCategory(category: 'ui' | 'automation' | 'detection' | 'performance'): UserPreference[] {
    return Array.from(this.preferences.values()).filter(p => p.category === category);
  }

  private resetCategory(category: 'ui' | 'automation' | 'detection' | 'performance'): void {
    const keysToDelete = Array.from(this.preferences.keys()).filter(
      key => this.preferences.get(key)?.category === category
    );

    keysToDelete.forEach(key => this.preferences.delete(key));
    this.savePreferences();

    EventManager.emit('preference.category_reset', { category }, 'UserPreferenceService');
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          this.preferences.set(key, {
            ...value,
            timestamp: new Date(value.timestamp)
          });
        });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      const data = Object.fromEntries(this.preferences.entries());
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  exportPreferences(): string {
    return JSON.stringify(Object.fromEntries(this.preferences.entries()), null, 2);
  }

  importPreferences(data: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(data);
      Object.entries(imported).forEach(([key, value]: [string, any]) => {
        this.preferences.set(key, {
          ...value,
          timestamp: new Date(value.timestamp)
        });
      });
      this.savePreferences();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const UserPreferenceService = new UserPreferenceServiceImpl();
