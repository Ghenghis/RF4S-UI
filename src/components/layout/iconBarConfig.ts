
import { IconBarItem } from './config/types';
import { mainIcons } from './config/mainIcons';
import { settingsIcons } from './config/settingsIcons';
import { toolsIcons } from './config/toolsIcons';
import { smartIcons } from './config/smartIcons';
import { advancedIcons } from './config/advancedIcons';

export type { IconBarItem };

export const iconBarItems: IconBarItem[] = [
  ...mainIcons,
  ...settingsIcons,
  ...toolsIcons,
  ...smartIcons,
  ...advancedIcons
];
