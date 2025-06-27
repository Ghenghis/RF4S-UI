
import { 
  Fish, 
  Activity, 
  Gauge, 
  Target, 
  Anchor
} from 'lucide-react';
import { IconBarItem } from './types';

export const mainIcons: IconBarItem[] = [
  {
    id: 'script-control',
    label: 'Bot Control',
    icon: Activity,
    category: 'main',
    description: 'Start/stop fishing bot and control main operations'
  },
  {
    id: 'fishing-profiles',
    label: 'Active Profiles',
    icon: Fish,
    category: 'main',
    description: 'Quick access to active fishing techniques'
  },
  {
    id: 'expanded-fishing-profiles',
    label: 'All Techniques',
    icon: Anchor,
    category: 'main',
    description: 'Complete fishing profile management for all techniques'
  },
  {
    id: 'system-monitor',
    label: 'Performance',
    icon: Gauge,
    category: 'main',
    description: 'Monitor system performance and fishing statistics'
  }
];
