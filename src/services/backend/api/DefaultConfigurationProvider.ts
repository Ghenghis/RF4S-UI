
import { RF4SYamlConfig } from '../../../types/config';

export class DefaultConfigurationProvider {
  getDefaultConfig(): RF4SYamlConfig {
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: false,
        IMAGE_VERIFICATION: true,
        SNAG_DETECTION: true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: false,
        SPOOL_CONFIDENCE: 0.98,
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
      PROFILE: {}
    };
  }
}
