
/**
 * Default configuration values for RF4S.
 */

export interface RF4SConfigDefaults {
  script: {
    enabled: boolean;
    mode: 'auto' | 'manual' | 'assistance';
    sensitivity: number;
    delay: number;
    randomCast: boolean;
    randomCastProbability: number;
    screenshotTags: string[];
    alarmSound: string;
  };
  detection: {
    spoolConfidence: number;
    fishBite: number;
    rodTip: number;
    ocrConfidence: number;
    snagDetection: boolean;
    imageVerification: boolean;
  };
  automation: {
    bottomEnabled: boolean;
    bottomWaitTime: number;
    bottomHookDelay: number;
    spinEnabled: boolean;
    spinRetrieveSpeed: number;
    spinTwitchFrequency: number;
    pirkEnabled: boolean;
    castDelayMin: number;
    castDelayMax: number;
  };
  key: {
    quit: string;
    bottomRods: number[];
    tea: string;
    carrot: string;
    alcohol: string;
    coffee: string;
    mainRod: string;
    spodRod: string;
    diggingTool: string;
  };
  stat: {
    alcoholPerDrink: number;
    coffeePerDrink: number;
    coffeeLimit: number;
  };
  keepnet: {
    capacity: number;
    tags: string[];
    fullAction: 'alarm' | 'quit' | 'continue';
    fishDelay: number;
    giftDelay: number;
  };
  pause: {
    duration: number;
  };
  frictionBrake: {
    initial: number;
  };
}

export const getDefaultConfig = (): RF4SConfigDefaults => ({
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
    pirkEnabled: false,
    castDelayMin: 2.0,
    castDelayMax: 5.0,
  },
  key: {
    quit: 'q',
    bottomRods: [1, 2, 3, 4],
    tea: '5',
    carrot: '6',
    alcohol: '7',
    coffee: '8',
    mainRod: '1',
    spodRod: '2',
    diggingTool: '9',
  },
  stat: {
    alcoholPerDrink: 2,
    coffeePerDrink: 1,
    coffeeLimit: 10,
  },
  keepnet: {
    capacity: 100,
    tags: ['green', 'yellow', 'blue', 'purple', 'pink'],
    fullAction: 'alarm',
    fishDelay: 1.0,
    giftDelay: 2.0,
  },
  pause: {
    duration: 60,
  },
  frictionBrake: {
    initial: 15,
  },
});
