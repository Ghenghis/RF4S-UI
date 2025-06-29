
import { useState } from 'react';
import { RF4SYamlConfig } from '../../types/config';

const DEFAULT_CONFIG: RF4SYamlConfig = {
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

export const useConfigState = () => {
  const [config, setConfig] = useState<RF4SYamlConfig>(DEFAULT_CONFIG);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateConfig = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newConfig = { ...config };
    
    let current = newConfig;
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setConfig(newConfig);
    setHasUnsavedChanges(true);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setHasUnsavedChanges(false);
  };

  return {
    config,
    setConfig,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    updateConfig,
    resetConfig
  };
};
