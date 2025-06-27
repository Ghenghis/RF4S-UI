export interface ScriptSettings {
  enabled: boolean;
  mode: 'auto' | 'manual' | 'assistance';
  sensitivity: number;
  delay: number;
  randomCast: boolean;
  randomCastProbability: number;
  screenshotTags: string[];
  alarmSound: string;
}

export interface FishingProfiles {
  active: string;
  profiles: {
    [key: string]: {
      name: string;
      technique: 'spin' | 'float' | 'bottom' | 'pirk' | 'telescopic';
      enabled: boolean;
      autoSwitch: boolean;
      settings: any;
    };
  };
}

export interface EquipmentSetup {
  mainRod: string;
  spodRod: string;
  rodType: string;
  reelDrag: number;
  lineTest: number;
  hookSize: number;
  leaderLength: number;
  sinkerWeight: number;
  floatSize: number;
  // Friction brake settings
  brakeInitial: number;
  brakeMax: number;
  brakeSensitivity: number;
  brakeResponseSpeed: number;
  brakeDelay: number;
  brakeHoldDuration: number;
  brakeAutoEnabled: boolean;
  brakeAdaptiveEnabled: boolean;
}

export interface DetectionSettings {
  spoolConfidence: number;
  fishBite: number;
  rodTip: number;
  ocrConfidence: number;
  snagDetection: boolean;
  imageVerification: boolean;
}

export interface AutomationSettings {
  bottomEnabled: boolean;
  bottomWaitTime: number;
  bottomHookDelay: number;
  spinEnabled: boolean;
  spinRetrieveSpeed: number;
  spinTwitchFrequency: number;
  floatEnabled: boolean;
  floatSensitivity: number;
  floatCheckDelay: number;
  floatPullDelay: number;
  floatDriftTimeout: number;
  pirkEnabled: boolean;
  pirkDuration: number;
  pirkDelay: number;
  pirkSinkTimeout: number;
  castDelayMin: number;
  castDelayMax: number;
  randomCastProbability: number;
  // Pause settings
  pauseAutoEnabled: boolean;
  pauseInterval: number;
  pauseDuration: number;
  pauseSmartPauseEnabled: boolean;
  pauseInactivityThreshold: number;
  pauseWeatherPauseEnabled: boolean;
  pauseAutoResumeEnabled: boolean;
  pauseManualResumeEnabled: boolean;
}

export interface SystemSettings {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  sessionTime: string;
  fishCaught: number;
  successRate: number;
  runtime: number;
  // Stat management
  energyThreshold: number;
  hungerThreshold: number;
  comfortThreshold: number;
  energyFoodEnabled: boolean;
  hungerFoodEnabled: boolean;
  comfortItemsEnabled: boolean;
  // Keepnet settings
  keepnetMaxCapacity: number;
  keepnetAutoSortEnabled: boolean;
  keepnetSizeSortEnabled: boolean;
  keepnetMinWeight: number;
  keepnetAutoReleaseEnabled: boolean;
  keepnetReleaseThreshold: number;
  // Notification settings
  emailNotificationsEnabled: boolean;
  discordNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  // Analytics settings
  detailedTrackingEnabled: boolean;
  analyticsCollectionInterval: number;
  exportDataEnabled: boolean;
  analyticsHistoryRetention: number;
  // Game integration
  gameAutoDetectEnabled: boolean;
  gameDetectionInterval: number;
  gameWindowCaptureEnabled: boolean;
  gameOverlayEnabled: boolean;
  gameCaptureQuality: number;
  gameProcessMonitorEnabled: boolean;
  // Network monitoring
  networkMonitoringEnabled: boolean;
  networkCheckInterval: number;
  networkAutoReconnectEnabled: boolean;
  networkVPNEnabled: boolean;
  networkProxyEnabled: boolean;
  // Diagnostics
  diagnosticsVerboseLoggingEnabled: boolean;
  diagnosticsStackTracesEnabled: boolean;
  diagnosticsLogLevel: number;
  diagnosticsMaxLogSize: number;
}

export interface RF4SConfig {
  script: ScriptSettings;
  profiles: FishingProfiles;
  equipment: EquipmentSetup;
  detection: DetectionSettings;
  automation: AutomationSettings;
  system: SystemSettings;
}
