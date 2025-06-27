
import { EventManager } from '../core/EventManager';
import { GameStateSync } from './GameStateSync';

interface EnvironmentalCondition {
  type: 'weather' | 'time' | 'season' | 'water';
  value: string | number;
  intensity: number; // 0-1
  duration: number; // milliseconds
  startTime: Date;
}

interface EffectModifier {
  fishBiteRate: number;
  castAccuracy: number;
  lineVisibility: number;
  fishActivity: number;
  lureEffectiveness: number;
}

interface WeatherPattern {
  name: string;
  conditions: EnvironmentalCondition[];
  modifiers: EffectModifier;
  transitionTime: number;
}

class EnvironmentalEffectsServiceImpl {
  private currentConditions: Map<string, EnvironmentalCondition> = new Map();
  private activeEffects: Map<string, EffectModifier> = new Map();
  private weatherPatterns: Map<string, WeatherPattern> = new Map();
  private transitionInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  initialize(): void {
    console.log('Environmental Effects Service initialized');
    this.initializeWeatherPatterns();
    this.setupEventListeners();
    this.startEnvironmentalSystem();
  }

  private initializeWeatherPatterns(): void {
    const patterns: WeatherPattern[] = [
      {
        name: 'sunny',
        conditions: [
          {
            type: 'weather',
            value: 'clear',
            intensity: 0.8,
            duration: 7200000, // 2 hours
            startTime: new Date()
          }
        ],
        modifiers: {
          fishBiteRate: 1.0,
          castAccuracy: 1.1,
          lineVisibility: 1.2,
          fishActivity: 0.9,
          lureEffectiveness: 1.0
        },
        transitionTime: 1800000 // 30 minutes
      },
      {
        name: 'cloudy',
        conditions: [
          {
            type: 'weather',
            value: 'overcast',
            intensity: 0.6,
            duration: 5400000, // 1.5 hours
            startTime: new Date()
          }
        ],
        modifiers: {
          fishBiteRate: 1.1,
          castAccuracy: 1.0,
          lineVisibility: 0.9,
          fishActivity: 1.2,
          lureEffectiveness: 1.1
        },
        transitionTime: 2700000 // 45 minutes
      },
      {
        name: 'rainy',
        conditions: [
          {
            type: 'weather',
            value: 'precipitation',
            intensity: 0.7,
            duration: 3600000, // 1 hour
            startTime: new Date()
          }
        ],
        modifiers: {
          fishBiteRate: 1.3,
          castAccuracy: 0.8,
          lineVisibility: 0.7,
          fishActivity: 1.4,
          lureEffectiveness: 1.2
        },
        transitionTime: 1200000 // 20 minutes
      },
      {
        name: 'foggy',
        conditions: [
          {
            type: 'weather',
            value: 'fog',
            intensity: 0.9,
            duration: 1800000, // 30 minutes
            startTime: new Date()
          }
        ],
        modifiers: {
          fishBiteRate: 0.8,
          castAccuracy: 0.6,
          lineVisibility: 0.3,
          fishActivity: 0.7,
          lureEffectiveness: 0.9
        },
        transitionTime: 600000 // 10 minutes
      },
      {
        name: 'windy',
        conditions: [
          {
            type: 'weather',
            value: 'wind',
            intensity: 0.8,
            duration: 2700000, // 45 minutes
            startTime: new Date()
          }
        ],
        modifiers: {
          fishBiteRate: 0.9,
          castAccuracy: 0.7,
          lineVisibility: 1.0,
          fishActivity: 1.1,
          lureEffectiveness: 0.8
        },
        transitionTime: 900000 // 15 minutes
      }
    ];

    patterns.forEach(pattern => {
      this.weatherPatterns.set(pattern.name, pattern);
    });
  }

  private startEnvironmentalSystem(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.initializeCurrentWeather();
    
    // Check conditions every 30 seconds
    this.transitionInterval = setInterval(() => {
      this.updateEnvironmentalConditions();
    }, 30000);
  }

  private initializeCurrentWeather(): void {
    // Start with sunny weather
    this.applyWeatherPattern('sunny');
  }

  private updateEnvironmentalConditions(): void {
    const gameState = GameStateSync.getGameState();
    
    // Update time-based effects
    this.updateTimeEffects();
    
    // Check for weather transitions
    this.checkWeatherTransitions();
    
    // Apply water condition effects
    this.updateWaterConditions(gameState);
    
    // Calculate and apply combined effects
    this.calculateCombinedEffects();
  }

  private updateTimeEffects(): void {
    const hour = new Date().getHours();
    let timeModifier: EffectModifier;

    if (hour >= 5 && hour <= 8) { // Dawn
      timeModifier = {
        fishBiteRate: 1.3,
        castAccuracy: 1.0,
        lineVisibility: 0.8,
        fishActivity: 1.4,
        lureEffectiveness: 1.2
      };
    } else if (hour >= 18 && hour <= 21) { // Dusk
      timeModifier = {
        fishBiteRate: 1.4,
        castAccuracy: 0.9,
        lineVisibility: 0.7,
        fishActivity: 1.5,
        lureEffectiveness: 1.3
      };
    } else if (hour >= 22 || hour <= 4) { // Night
      timeModifier = {
        fishBiteRate: 0.7,
        castAccuracy: 0.6,
        lineVisibility: 0.4,
        fishActivity: 0.8,
        lureEffectiveness: 0.9
      };
    } else { // Day
      timeModifier = {
        fishBiteRate: 1.0,
        castAccuracy: 1.0,
        lineVisibility: 1.0,
        fishActivity: 1.0,
        lureEffectiveness: 1.0
      };
    }

    this.activeEffects.set('time', timeModifier);
  }

  private checkWeatherTransitions(): void {
    // Simple weather transition logic
    if (Math.random() < 0.1) { // 10% chance every check
      const weatherTypes = Array.from(this.weatherPatterns.keys());
      const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      this.applyWeatherPattern(newWeather);
    }
  }

  private updateWaterConditions(gameState: any): void {
    const waterTemp = gameState.environmentalConditions?.waterTemperature || 15;
    const visibility = gameState.environmentalConditions?.visibility || 100;

    let waterModifier: EffectModifier;

    // Temperature effects
    if (waterTemp < 10) { // Cold water
      waterModifier = {
        fishBiteRate: 0.6,
        castAccuracy: 1.0,
        lineVisibility: 1.2,
        fishActivity: 0.5,
        lureEffectiveness: 0.8
      };
    } else if (waterTemp > 25) { // Warm water
      waterModifier = {
        fishBiteRate: 1.2,
        castAccuracy: 1.0,
        lineVisibility: 0.9,
        fishActivity: 1.3,
        lureEffectiveness: 1.1
      };
    } else { // Optimal temperature
      waterModifier = {
        fishBiteRate: 1.0,
        castAccuracy: 1.0,
        lineVisibility: 1.0,
        fishActivity: 1.0,
        lureEffectiveness: 1.0
      };
    }

    // Visibility effects
    const visibilityFactor = visibility / 100;
    waterModifier.lineVisibility *= visibilityFactor;
    waterModifier.fishActivity *= (1 + (1 - visibilityFactor) * 0.3);

    this.activeEffects.set('water', waterModifier);
  }

  private applyWeatherPattern(patternName: string): void {
    const pattern = this.weatherPatterns.get(patternName);
    if (!pattern) return;

    console.log(`Weather changing to: ${patternName}`);

    // Clear old weather conditions
    this.currentConditions.clear();

    // Apply new conditions
    pattern.conditions.forEach(condition => {
      condition.startTime = new Date();
      this.currentConditions.set(condition.type, condition);
    });

    // Apply weather modifiers
    this.activeEffects.set('weather', pattern.modifiers);

    // Emit weather change event
    EventManager.emit('environment.weather_changed', {
      weather: patternName,
      pattern,
      timestamp: new Date()
    }, 'EnvironmentalEffectsService');
  }

  private calculateCombinedEffects(): void {
    const combinedEffect: EffectModifier = {
      fishBiteRate: 1.0,
      castAccuracy: 1.0,
      lineVisibility: 1.0,
      fishActivity: 1.0,
      lureEffectiveness: 1.0
    };

    // Multiply all active effects
    this.activeEffects.forEach(effect => {
      combinedEffect.fishBiteRate *= effect.fishBiteRate;
      combinedEffect.castAccuracy *= effect.castAccuracy;
      combinedEffect.lineVisibility *= effect.lineVisibility;
      combinedEffect.fishActivity *= effect.fishActivity;
      combinedEffect.lureEffectiveness *= effect.lureEffectiveness;
    });

    // Emit combined effects
    EventManager.emit('environment.effects_updated', {
      effects: combinedEffect,
      conditions: Array.from(this.currentConditions.values()),
      timestamp: new Date()
    }, 'EnvironmentalEffectsService');
  }

  private setupEventListeners(): void {
    // Listen for manual weather changes
    EventManager.subscribe('environment.set_weather', (data: any) => {
      if (data.weather && this.weatherPatterns.has(data.weather)) {
        this.applyWeatherPattern(data.weather);
      }
    });

    // Listen for game state changes that might affect environment
    EventManager.subscribe('game_state.synced', (data: any) => {
      // Environment automatically updates based on game state
    });
  }

  // Public API
  getCurrentConditions(): EnvironmentalCondition[] {
    return Array.from(this.currentConditions.values());
  }

  getCurrentEffects(): EffectModifier {
    const combined: EffectModifier = {
      fishBiteRate: 1.0,
      castAccuracy: 1.0,
      lineVisibility: 1.0,
      fishActivity: 1.0,
      lureEffectiveness: 1.0
    };

    this.activeEffects.forEach(effect => {
      combined.fishBiteRate *= effect.fishBiteRate;
      combined.castAccuracy *= effect.castAccuracy;
      combined.lineVisibility *= effect.lineVisibility;
      combined.fishActivity *= effect.fishActivity;
      combined.lureEffectiveness *= effect.lureEffectiveness;
    });

    return combined;
  }

  setWeather(weatherType: string): boolean {
    if (this.weatherPatterns.has(weatherType)) {
      this.applyWeatherPattern(weatherType);
      return true;
    }
    return false;
  }

  getAvailableWeatherTypes(): string[] {
    return Array.from(this.weatherPatterns.keys());
  }

  stop(): void {
    if (this.transitionInterval) {
      clearInterval(this.transitionInterval);
      this.transitionInterval = null;
    }
    this.isRunning = false;
    console.log('Environmental Effects Service stopped');
  }
}

export const EnvironmentalEffectsService = new EnvironmentalEffectsServiceImpl();
