
import { RF4SYamlConfig } from '../../../types/config';
import { rf4sService } from '../../../rf4s/services/rf4sService';
import { RF4SConfigDefaults } from '../../../rf4s/config/defaults';
import { createRichLogger } from '../../../rf4s/utils';

export class ConfigConverter {
  private logger = createRichLogger('ConfigConverter');

  convertRF4SToYaml(rf4sConfig: any): RF4SYamlConfig {
    return {
      VERSION: "0.5.3",
      SCRIPT: {
        LANGUAGE: "en",
        LAUNCH_OPTIONS: "",
        SMTP_VERIFICATION: rf4sConfig.script?.enabled || false,
        IMAGE_VERIFICATION: rf4sConfig.detection?.imageVerification || true,
        SNAG_DETECTION: rf4sConfig.detection?.snagDetection || true,
        SPOOLING_DETECTION: true,
        RANDOM_ROD_SELECTION: rf4sConfig.script?.randomCast || false,
        SPOOL_CONFIDENCE: rf4sConfig.detection?.spoolConfidence || 0.98,
        SPOD_ROD_RECAST_DELAY: 1800,
        LURE_CHANGE_DELAY: 1800,
        ALARM_SOUND: rf4sConfig.script?.alarmSound || "./static/sound/guitar.wav",
        RANDOM_CAST_PROBABILITY: rf4sConfig.script?.randomCastProbability || 0.25,
        SCREENSHOT_TAGS: rf4sConfig.script?.screenshotTags || ["green", "yellow", "blue", "purple", "pink"]
      },
      KEY: {
        TEA: -1,
        CARROT: -1,
        BOTTOM_RODS: rf4sConfig.key?.bottomRods || [1, 2, 3],
        COFFEE: 4,
        DIGGING_TOOL: 5,
        ALCOHOL: 6,
        MAIN_ROD: 1,
        SPOD_ROD: 7,
        QUIT: rf4sConfig.key?.quit || "CTRL-C"
      },
      STAT: {
        ENERGY_THRESHOLD: 0.74,
        HUNGER_THRESHOLD: 0.5,
        COMFORT_THRESHOLD: 0.51,
        TEA_DELAY: 300,
        COFFEE_LIMIT: rf4sConfig.stat?.coffeeLimit || 20,
        COFFEE_PER_DRINK: rf4sConfig.stat?.coffeePerDrink || 1,
        ALCOHOL_DELAY: 900,
        ALCOHOL_PER_DRINK: rf4sConfig.stat?.alcoholPerDrink || 1
      },
      FRICTION_BRAKE: {
        INITIAL: rf4sConfig.frictionBrake?.initial || 29,
        MAX: 30,
        START_DELAY: 2.0,
        INCREASE_DELAY: 1.0,
        SENSITIVITY: "medium"
      },
      KEEPNET: {
        CAPACITY: rf4sConfig.keepnet?.capacity || 100,
        FISH_DELAY: rf4sConfig.keepnet?.fishDelay || 0.0,
        GIFT_DELAY: rf4sConfig.keepnet?.giftDelay || 4.0,
        FULL_ACTION: rf4sConfig.keepnet?.fullAction || "quit",
        WHITELIST: ["mackerel", "saithe", "herring", "squid", "scallop", "mussel"],
        BLACKLIST: [],
        TAGS: rf4sConfig.keepnet?.tags || ["green", "yellow", "blue", "purple", "pink"]
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
        DURATION: rf4sConfig.pause?.duration || 600
      },
      PROFILE: {}
    };
  }

  convertYamlToRF4S(yamlConfig: RF4SYamlConfig): any {
    return {
      script: {
        enabled: yamlConfig.SCRIPT.SMTP_VERIFICATION,
        randomCast: yamlConfig.SCRIPT.RANDOM_ROD_SELECTION,
        randomCastProbability: yamlConfig.SCRIPT.RANDOM_CAST_PROBABILITY,
        alarmSound: yamlConfig.SCRIPT.ALARM_SOUND,
        screenshotTags: yamlConfig.SCRIPT.SCREENSHOT_TAGS
      },
      detection: {
        spoolConfidence: yamlConfig.SCRIPT.SPOOL_CONFIDENCE,
        imageVerification: yamlConfig.SCRIPT.IMAGE_VERIFICATION,
        snagDetection: yamlConfig.SCRIPT.SNAG_DETECTION
      },
      automation: {
        castDelayMin: yamlConfig.PAUSE.DELAY / 1000,
        castDelayMax: (yamlConfig.PAUSE.DELAY + yamlConfig.PAUSE.DURATION) / 1000
      },
      key: {
        bottomRods: yamlConfig.KEY.BOTTOM_RODS,
        quit: yamlConfig.KEY.QUIT
      },
      stat: {
        coffeeLimit: yamlConfig.STAT.COFFEE_LIMIT,
        coffeePerDrink: yamlConfig.STAT.COFFEE_PER_DRINK,
        alcoholPerDrink: yamlConfig.STAT.ALCOHOL_PER_DRINK
      },
      frictionBrake: {
        initial: yamlConfig.FRICTION_BRAKE.INITIAL
      },
      keepnet: {
        capacity: yamlConfig.KEEPNET.CAPACITY,
        fishDelay: yamlConfig.KEEPNET.FISH_DELAY,
        giftDelay: yamlConfig.KEEPNET.GIFT_DELAY,
        fullAction: yamlConfig.KEEPNET.FULL_ACTION,
        tags: yamlConfig.KEEPNET.TAGS
      },
      pause: {
        duration: yamlConfig.PAUSE.DURATION
      }
    };
  }

  applyConfigToRF4S(rf4sConfig: any): void {
    // Apply configuration sections to RF4S service with proper typing
    const validSections: (keyof RF4SConfigDefaults)[] = ['script', 'detection', 'automation', 'key', 'stat', 'keepnet', 'pause', 'frictionBrake'];
    
    Object.keys(rf4sConfig).forEach(section => {
      const typedSection = section as keyof RF4SConfigDefaults;
      if (validSections.includes(typedSection)) {
        rf4sService.updateConfig(typedSection, rf4sConfig[section]);
      }
    });
  }
}
