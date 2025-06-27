
import { 
  Terminal, 
  Palette, 
  Camera, 
  Gamepad2,
  Network,
  AlertTriangle,
  Save,
  Monitor,
  Gauge,
  Fish
} from 'lucide-react';
import { IconBarItem } from './types';

export const toolsIcons: IconBarItem[] = [
  {
    id: 'cli-terminal',
    label: 'Console',
    icon: Terminal,
    category: 'tools',
    description: 'Command line interface and real-time bot interaction'
  },
  {
    id: 'ui-customization',
    label: 'UI Theme',
    icon: Palette,
    category: 'tools',
    description: 'Customize interface themes and layouts'
  },
  {
    id: 'screenshot-sharing',
    label: 'Screenshots',
    icon: Camera,
    category: 'tools',
    description: 'Capture and share fishing setups and results'
  },
  {
    id: 'game-integration',
    label: 'Game Link',
    icon: Gamepad2,
    category: 'tools',
    description: 'Game detection and process integration'
  },
  {
    id: 'network-status',
    label: 'Network',
    icon: Network,
    category: 'tools',
    description: 'Connection status and network diagnostics'
  },
  {
    id: 'error-diagnostics',
    label: 'Diagnostics',
    icon: AlertTriangle,
    category: 'tools',
    description: 'Error logs, debugging, and troubleshooting'
  },
  {
    id: 'save-load-manager',
    label: 'Save/Load',
    icon: Save,
    category: 'tools',
    description: 'Save and load game configurations',
    isPanel: true
  },
  {
    id: 'game-state-monitor',
    label: 'Game State',
    icon: Monitor,
    category: 'tools',
    description: 'Real-time game state synchronization',
    isPanel: true
  },
  {
    id: 'performance-stats',
    label: 'Performance',
    icon: Gauge,
    category: 'tools',
    description: 'System performance monitoring',
    isPanel: true
  }
];
