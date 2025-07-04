import { RF4SConfig } from './types';

export const defaultConfig: RF4SConfig = {
  script: {
    enabled: false,
    mode: 'auto',
    sensitivity: 0.8,
    delay: 1.0,
    randomCast: false,
    randomCastProbability: 0.1,
    screenshotTags: ['green', 'yellow', 'blue', 'purple', 'pink'],
    alarmSound: './static/sound/bell_1.wav',
  },
  profiles: {
    active: 'default',
    profiles: {
      default: {
        name: 'Default Profile',
        technique: 'spin',
        enabled: true,
        autoSwitch: false,
        settings: {},
      },
    },
  },
  equipment: {
    mainRod: 'Generic Rod',
    spodRod: 'Generic Spod Rod',
    rodType: 'Spinning',
    reelDrag: 5.0,
    lineTest: 10.0,
    hookSize: 6,
    leaderLength: 100,
    sinkerWeight: 20,
    floatSize: 15,
    // Friction brake defaults
    brakeInitial: 29,
    brakeMax: 30,
    brakeSensitivity: 0.75,
    brakeResponseSpeed: 0.5,
    brakeDelay: 0.2,
    brakeHoldDuration: 1.5,
    brakeAutoEnabled: true,
    brakeAdaptiveEnabled: false,
  },
  detection: {
    spoolConfidence: 0.98,
    fishBite: 0.85,
    rodTip: 0.7,
    ocrConfidence: 0.8,
    snagDetection: true,
    imageVerification: true,
  },
  automation: {
    bottomEnabled: true,
    bottomWaitTime: 300,
    bottomHookDelay: 0.5,
    spinEnabled: false,
    spinRetrieveSpeed: 50,
    spinTwitchFrequency: 3.0,
    floatEnabled: false,
    floatSensitivity: 0.68,
    floatCheckDelay: 1.0,
    floatPullDelay: 0.5,
    floatDriftTimeout: 16.0,
    pirkEnabled: false,
    pirkDuration: 0.5,
    pirkDelay: 2.0,
    pirkSinkTimeout: 60.0,
    castDelayMin: 2.0,
    castDelayMax: 5.0,
    randomCastProbability: 0.25,
    // Pause settings defaults
    pauseAutoEnabled: false,
    pauseInterval: 30,
    pauseDuration: 5,
    pauseSmartPauseEnabled: true,
    pauseInactivityThreshold: 10,
    pauseWeatherPauseEnabled: false,
    pauseAutoResumeEnabled: true,
    pauseManualResumeEnabled: false,
  },
  system: {
    cpuUsage: 0,
    memoryUsage: 0,
    fps: 0,
    sessionTime: '00:00:00',
    fishCaught: 0,
    successRate: 0,
    runtime: 0,
    // Stat management defaults
    energyThreshold: 75,
    hungerThreshold: 60,
    comfortThreshold: 50,
    energyFoodEnabled: true,
    hungerFoodEnabled: false,
    comfortItemsEnabled: true,
    // Keepnet defaults
    keepnetMaxCapacity: 50,
    keepnetAutoSortEnabled: true,
    keepnetSizeSortEnabled: false,
    keepnetMinWeight: 0.5,
    keepnetAutoReleaseEnabled: false,
    keepnetReleaseThreshold: 1.0,
    // Notification defaults
    emailNotificationsEnabled: true,
    discordNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    // Analytics defaults
    detailedTrackingEnabled: true,
    analyticsCollectionInterval: 30,
    exportDataEnabled: false,
    analyticsHistoryRetention: 30,
    // Game integration defaults
    gameAutoDetectEnabled: true,
    gameDetectionInterval: 2,
    gameWindowCaptureEnabled: true,
    gameOverlayEnabled: false,
    gameCaptureQuality: 85,
    gameProcessMonitorEnabled: true,
    // Network defaults
    networkMonitoringEnabled: true,
    networkCheckInterval: 30,
    networkAutoReconnectEnabled: false,
    networkVPNEnabled: true,
    networkProxyEnabled: false,
    // Diagnostics defaults
    diagnosticsVerboseLoggingEnabled: true,
    diagnosticsStackTracesEnabled: false,
    diagnosticsLogLevel: 2,
    diagnosticsMaxLogSize: 50,
  },
};
