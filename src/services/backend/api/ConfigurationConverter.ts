
import { RF4SYamlConfig } from '../../../types/config';
import { rf4sService } from '../../../rf4s/services/rf4sService';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfigurationConverter {
  private logger = createRichLogger('ConfigurationConverter');

  convertToYamlConfig(config: any): RF4SYamlConfig {
    // Convert RF4S service config to YAML format
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: config.script?.enabled || false,
        IMAGE_VERIFICATION: config.detection?.imageVerification || true,
        SNAG_DETECTION: config.detection?.snagDetection || true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: config.script?.randomCast || false,
        SPOOL_CONFIDENCE: config.detection?.spoolConfidence || 0.98,
        SPOD_ROD_RECAST_DELAY: 1800,
        LURE_CHANGE_DELAY: 1800,
        ALARM_SOUND: config.script?.alarmSound || "./static/sound/guitar.wav",
        RANDOM_CAST_PROBABILITY: config.script?.randomCastProbability || 0.25,
        SCREENSHOT_TAGS: config.script?.screenshotTags || ["green", "yellow", "blue", "purple", "pink"]
      },
      KEY: {
        TEA: -1,
        CARROT: -1,
        BOTTOM_RODS: config.key?.bottomRods || [1, 2, 3],
        COFFEE: 4,
        DIGGING_TOOL: 5,
        ALCOHOL: 6,
        MAIN_ROD: 1,
        SPOD_ROD: 7,
        QUIT: config.key?.quit || "CTRL-C"
      },
      STAT: {
        ENERGY_THRESHOLD: 0.74,
        HUNGER_THRESHOLD: 0.5,
        COMFORT_THRESHOLD: 0.51,
        TEA_DELAY: 300,
        COFFEE_LIMIT: config.stat?.coffeeLimit || 20,
        COFFEE_PER_DRINK: config.stat?.coffeePerDrink || 1,
        ALCOHOL_DELAY: 900,
        ALCOHOL_PER_DRINK: config.stat?.alcoholPerDrink || 1
      },
      FRICTION_BRAKE: {
        INITIAL: config.frictionBrake?.initial || 29,
        MAX: 30,
        START_DELAY: 2.0,
        INCREASE_DELAY: 1.0,
        SENSITIVITY: "medium"
      },
      KEEPNET: {
        CAPACITY: config.keepnet?.capacity || 100,
        FISH_DELAY: config.keepnet?.fishDelay || 0.0,
        GIFT_DELAY: config.keepnet?.giftDelay || 4.0,
        FULL_ACTION: config.keepnet?.fullAction || "quit",
        WHITELIST: config.keepnet?.tags || ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
        BLACKLIST: [],
        TAGS: config.keepnet?.tags || ["green", "yellow", "blue", "purple", "pink"]
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
        DURATION: config.pause?.duration || 600
      },
      PROFILE: {}
    };
  }

  updateRF4SConfig(yamlConfig: RF4SYamlConfig): void {
    // Update RF4S service configuration
    rf4sService.updateConfig('script', {
      enabled: yamlConfig.SCRIPT.SMTP_VERIFICATION,
      randomCast: yamlConfig.SCRIPT.RANDOM_ROD_SELECTION,
      randomCastProbability: yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY,
      alarmSound: yamlConfig.SCRIPT.ALARM_SOUND,
      screenshotTags: yamlConfig.SCRIPT.SCREENSHOT_TAGS
    });

    rf4sService.updateConfig('detection', {
      spoolConfidence: yamlConfig.SCRIPT.SPOOL_CONFIDENCE,
      imageVerification: yamlConfig.SCRIPT.IMAGE_VERIFICATION,
      snagDetection: yamlConfig.SCRIPT.SNAG_DETECTION
    });

    rf4sService.updateConfig('automation', {
      castDelayMin: yamlConfig.PAUSE.DELAY / 1000,
      castDelayMax: (yamlConfig.PAUSE.DELAY + yamlConfig.PAUSE.DURATION) / 1000
    });
  }
}
