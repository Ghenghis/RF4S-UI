
export interface RF4SYamlConfig {
  VERSION: string;
  SCRIPT: {
    LANGUAGE: string;
    LAUNCH_OPTIONS: string;
    SMTP_VERIFICATION: boolean;
    IMAGE_VERIFICATION: boolean;
    SNAG_DETECTION: boolean;
    SPOOLING_DETECTION: boolean;
    RANDOM_ROD_SELECTION: boolean;
    SPOOL_CONFIDENCE: number;
    SPOD_ROD_RECAST_DELAY: number;
    LURE_CHANGE_DELAY: number;
    ALARM_SOUND: string;
    RANDOM_CAST_PROBABILITY: number;
    SCREENSHOT_TAGS: string[];
  };
  KEY: {
    TEA: number;
    CARROT: number;
    BOTTOM_RODS: number[];
    COFFEE: number;
    DIGGING_TOOL: number;
    ALCOHOL: number;
    MAIN_ROD: number;
    SPOD_ROD: number;
    QUIT: string;
  };
  STAT: {
    ENERGY_THRESHOLD: number;
    HUNGER_THRESHOLD: number;
    COMFORT_THRESHOLD: number;
    TEA_DELAY: number;
    COFFEE_LIMIT: number;
    COFFEE_PER_DRINK: number;
    ALCOHOL_DELAY: number;
    ALCOHOL_PER_DRINK: number;
  };
  FRICTION_BRAKE: {
    INITIAL: number;
    MAX: number;
    START_DELAY: number;
    INCREASE_DELAY: number;
    SENSITIVITY: string;
  };
  KEEPNET: {
    CAPACITY: number;
    FISH_DELAY: number;
    GIFT_DELAY: number;
    FULL_ACTION: string;
    WHITELIST: string[];
    BLACKLIST: string[];
    TAGS: string[];
  };
  NOTIFICATION: {
    EMAIL: string;
    PASSWORD: string;
    SMTP_SERVER: string;
    MIAO_CODE: string;
    DISCORD_WEBHOOK_URL: string;
  };
  PAUSE: {
    DELAY: number;
    DURATION: number;
  };
  PROFILE: {
    [key: string]: FishingProfile;
  };
}

export interface FishingProfile {
  MODE: string;
  LAUNCH_OPTIONS: string;
  CAST_POWER_LEVEL: number;
  CAST_DELAY: number;
  [key: string]: any;
}

export interface ConfigVersion {
  id: string;
  timestamp: Date;
  config: RF4SYamlConfig;
  description: string;
  user: string;
  aiOptimized: boolean;
}
