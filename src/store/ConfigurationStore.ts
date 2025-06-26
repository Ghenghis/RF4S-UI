
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RF4SYamlConfig } from '../types/config';

export interface ConfigProfile {
  id: string;
  name: string;
  description: string;
  config: RF4SYamlConfig;
  created: number;
  modified: number;
  isDefault: boolean;
  tags: string[];
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigurationState {
  // Current Configuration
  activeConfig: RF4SYamlConfig;
  activeProfileId: string;
  
  // Profiles
  profiles: ConfigProfile[];
  
  // Validation
  validationResult?: ConfigValidationResult;
  hasUnsavedChanges: boolean;
  
  // Backup & Restore
  backups: ConfigProfile[];
  maxBackups: number;
  
  // Actions
  updateConfig: (path: string, value: any) => void;
  setActiveProfile: (profileId: string) => void;
  createProfile: (name: string, description: string, config?: RF4SYamlConfig) => string;
  updateProfile: (profileId: string, updates: Partial<ConfigProfile>) => void;
  deleteProfile: (profileId: string) => void;
  duplicateProfile: (profileId: string, newName: string) => string;
  validateConfig: (config?: RF4SYamlConfig) => ConfigValidationResult;
  saveConfig: () => void;
  createBackup: (description: string) => void;
  restoreBackup: (backupId: string) => void;
  importConfig: (config: RF4SYamlConfig, profileName: string) => string;
  exportConfig: (profileId?: string) => RF4SYamlConfig;
  resetToDefaults: () => void;
}

const defaultConfig: RF4SYamlConfig = {
  VERSION: "0.5.3",
  SCRIPT: {
    LANGUAGE: "en",
    LAUNCH_OPTIONS: "",
    SMTP_VERIFICATION: true,
    IMAGE_VERIFICATION: true,
    SNAG_DETECTION: true,
    SPOOLING_DETECTION: true,
    RANDOM_ROD_SELECTION: true,
    SPOOL_CONFIDENCE: 0.97,
    SPOD_ROD_RECAST_DELAY: 1800,
    LURE_CHANGE_DELAY: 1800,
    ALARM_SOUND: "./static/sound/guitar.wav",
    RANDOM_CAST_PROBABILITY: 0.25,
    SCREENSHOT_TAGS: ["green", "yellow", "blue", "purple", "pink"]
  },
  KEY: {
    TEA: -1,
    CARROT: -1,
    BOTTOM_RODS: [1, 2, 3],
    COFFEE: 4,
    DIGGING_TOOL: 5,
    ALCOHOL: 6,
    MAIN_ROD: 1,
    SPOD_ROD: 7,
    QUIT: "CTRL-C"
  },
  STAT: {
    ENERGY_THRESHOLD: 0.74,
    HUNGER_THRESHOLD: 0.5,
    COMFORT_THRESHOLD: 0.51,
    TEA_DELAY: 300,
    COFFEE_LIMIT: 20,
    COFFEE_PER_DRINK: 1,
    ALCOHOL_DELAY: 900,
    ALCOHOL_PER_DRINK: 1
  },
  FRICTION_BRAKE: {
    INITIAL: 29,
    MAX: 30,
    START_DELAY: 2.0,
    INCREASE_DELAY: 1.0,
    SENSITIVITY: "medium"
  },
  KEEPNET: {
    CAPACITY: 100,
    FISH_DELAY: 0.0,
    GIFT_DELAY: 4.0,
    FULL_ACTION: "quit",
    WHITELIST: ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
    BLACKLIST: [],
    TAGS: ["green", "yellow", "blue", "purple", "pink"]
  },
  NOTIFICATION: {
    EMAIL: "email@example.com",
    PASSWORD: "password",
    SMTP_SERVER: "smtp.gmail.com",
    MIAO_CODE: "example",
    DISCORD_WEBHOOK_URL: ""
  },
  PAUSE: {
    DELAY: 1800,
    DURATION: 600
  },
  PROFILE: {
    SPIN: {
      MODE: "spin",
      LAUNCH_OPTIONS: "",
      CAST_POWER_LEVEL: 5.0,
      CAST_DELAY: 6.0,
      TIGHTEN_DURATION: 1.0,
      RETRIEVAL_DURATION: 1.0,
      RETRIEVAL_DELAY: 3.8,
      RETRIEVAL_TIMEOUT: 256.0,
      PRE_ACCELERATION: false,
      POST_ACCELERATION: "off",
      CTRL: false,
      SHIFT: false,
      TYPE: "normal"
    },
    BOTTOM: {
      MODE: "bottom",
      LAUNCH_OPTIONS: "",
      CAST_POWER_LEVEL: 5.0,
      CAST_DELAY: 4.0,
      POST_ACCELERATION: "off",
      CHECK_DELAY: 32.0,
      CHECK_MISS_LIMIT: 16,
      PUT_DOWN_DELAY: 0.0
    },
    TELESCOPIC: {
      MODE: "telescopic",
      LAUNCH_OPTIONS: "",
      CAST_POWER_LEVEL: 5.0,
      CAST_DELAY: 4.0,
      FLOAT_SENSITIVITY: 0.68,
      CHECK_DELAY: 1.0,
      PULL_DELAY: 0.5,
      DRIFT_TIMEOUT: 16.0,
      CAMERA_SHAPE: "square"
    }
  }
};

const createDefaultProfile = (): ConfigProfile => ({
  id: 'default',
  name: 'Default Profile',
  description: 'Default RF4S configuration',
  config: defaultConfig,
  created: Date.now(),
  modified: Date.now(),
  isDefault: true,
  tags: ['default']
});

export const useConfigurationStore = create<ConfigurationState>()(
  persist(
    (set, get) => ({
      activeConfig: defaultConfig,
      activeProfileId: 'default',
      profiles: [createDefaultProfile()],
      hasUnsavedChanges: false,
      backups: [],
      maxBackups: 10,

      updateConfig: (path, value) => {
        const pathArray = path.split('.');
        const newConfig = JSON.parse(JSON.stringify(get().activeConfig));
        
        let current = newConfig;
        for (let i = 0; i < pathArray.length - 1; i++) {
          current = current[pathArray[i]];
        }
        current[pathArray[pathArray.length - 1]] = value;

        set({ 
          activeConfig: newConfig, 
          hasUnsavedChanges: true,
          validationResult: get().validateConfig(newConfig)
        });
      },

      setActiveProfile: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (profile) {
          set({
            activeConfig: profile.config,
            activeProfileId: profileId,
            hasUnsavedChanges: false,
            validationResult: get().validateConfig(profile.config)
          });
        }
      },

      createProfile: (name, description, config) => {
        const id = Date.now().toString();
        const newProfile: ConfigProfile = {
          id,
          name,
          description,
          config: config || get().activeConfig,
          created: Date.now(),
          modified: Date.now(),
          isDefault: false,
          tags: []
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile]
        }));

        return id;
      },

      updateProfile: (profileId, updates) => {
        set((state) => ({
          profiles: state.profiles.map(profile =>
            profile.id === profileId
              ? { ...profile, ...updates, modified: Date.now() }
              : profile
          )
        }));
      },

      deleteProfile: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (profile?.isDefault) return;

        set((state) => ({
          profiles: state.profiles.filter(p => p.id !== profileId),
          activeProfileId: state.activeProfileId === profileId ? 'default' : state.activeProfileId
        }));
      },

      duplicateProfile: (profileId, newName) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (!profile) return '';

        const id = Date.now().toString();
        const newProfile: ConfigProfile = {
          ...profile,
          id,
          name: newName,
          description: `Copy of ${profile.name}`,
          created: Date.now(),
          modified: Date.now(),
          isDefault: false
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile]
        }));

        return id;
      },

      validateConfig: (config) => {
        const configToValidate = config || get().activeConfig;
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic validation
        if (!configToValidate.VERSION) {
          errors.push('VERSION is required');
        }

        if (configToValidate.SCRIPT.SPOOL_CONFIDENCE < 0 || configToValidate.SCRIPT.SPOOL_CONFIDENCE > 1) {
          errors.push('SPOOL_CONFIDENCE must be between 0 and 1');
        }

        if (configToValidate.SCRIPT.SPOOL_CONFIDENCE < 0.8) {
          warnings.push('SPOOL_CONFIDENCE below 0.8 may cause false positives');
        }

        if (configToValidate.KEEPNET.CAPACITY <= 0) {
          errors.push('KEEPNET.CAPACITY must be greater than 0');
        }

        const result = {
          valid: errors.length === 0,
          errors,
          warnings
        };

        return result;
      },

      saveConfig: () => {
        const state = get();
        const profile = state.profiles.find(p => p.id === state.activeProfileId);
        if (profile) {
          get().updateProfile(state.activeProfileId, {
            config: state.activeConfig,
            modified: Date.now()
          });
          set({ hasUnsavedChanges: false });
        }
      },

      createBackup: (description) => {
        const state = get();
        const backup: ConfigProfile = {
          id: `backup-${Date.now()}`,
          name: `Backup ${new Date().toLocaleString()}`,
          description,
          config: state.activeConfig,
          created: Date.now(),
          modified: Date.now(),
          isDefault: false,
          tags: ['backup']
        };

        const newBackups = [backup, ...state.backups.slice(0, state.maxBackups - 1)];
        set({ backups: newBackups });
      },

      restoreBackup: (backupId) => {
        const backup = get().backups.find(b => b.id === backupId);
        if (backup) {
          set({
            activeConfig: backup.config,
            hasUnsavedChanges: true,
            validationResult: get().validateConfig(backup.config)
          });
        }
      },

      importConfig: (config, profileName) => {
        return get().createProfile(profileName, 'Imported configuration', config);
      },

      exportConfig: (profileId) => {
        if (profileId) {
          const profile = get().profiles.find(p => p.id === profileId);
          return profile ? profile.config : get().activeConfig;
        }
        return get().activeConfig;
      },

      resetToDefaults: () => {
        set({
          activeConfig: defaultConfig,
          hasUnsavedChanges: true,
          validationResult: get().validateConfig(defaultConfig)
        });
      }
    }),
    {
      name: 'rf4s-configuration-store',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        backups: state.backups
      })
    }
  )
);
