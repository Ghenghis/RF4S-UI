
import { 
  Target, 
  Timer, 
  Eye, 
  Database,
  Key,
  Heart,
  Shield,
  Archive,
  Bell,
  PauseCircle,
  Settings,
  Wrench
} from 'lucide-react';
import { IconBarItem } from './types';

export const settingsIcons: IconBarItem[] = [
  {
    id: 'equipment-setup',
    label: 'Rod Setup',
    icon: Target,
    category: 'settings',
    description: 'Configure rods, reels, and fishing tackle'
  },
  {
    id: 'automation-settings',
    label: 'Automation',
    icon: Timer,
    category: 'settings',
    description: 'Fine-tune automated fishing behaviors'
  },
  {
    id: 'detection-settings',
    label: 'Detection',
    icon: Eye,
    category: 'settings',
    description: 'Adjust fish bite and visual detection sensitivity'
  },
  {
    id: 'config-dashboard',
    label: 'Config Editor',
    icon: Database,
    category: 'settings',
    description: 'Edit YAML configuration with version control'
  },
  {
    id: 'key-bindings',
    label: 'Key Bindings',
    icon: Key,
    category: 'settings',
    description: 'Configure keyboard shortcuts and game controls'
  },
  {
    id: 'stat-management',
    label: 'Player Stats',
    icon: Heart,
    category: 'settings',
    description: 'Energy, hunger, comfort thresholds and consumables'
  },
  {
    id: 'friction-brake',
    label: 'Friction Brake',
    icon: Shield,
    category: 'settings',
    description: 'Configure friction brake sensitivity and timing'
  },
  {
    id: 'keepnet-settings',
    label: 'Keepnet',
    icon: Archive,
    category: 'settings',
    description: 'Fish sorting, capacity, and keepnet management'
  },
  {
    id: 'notification-settings',
    label: 'Notifications',
    icon: Bell,
    category: 'settings',
    description: 'Email, Discord, and other notification settings'
  },
  {
    id: 'pause-settings',
    label: 'Auto Pause',
    icon: PauseCircle,
    category: 'settings',
    description: 'Configure automatic pause intervals and duration'
  },
  {
    id: 'settings',
    label: 'General',
    icon: Settings,
    category: 'settings',
    description: 'General application settings and preferences'
  },
  {
    id: 'advanced-settings',
    label: 'Advanced',
    icon: Wrench,
    category: 'advanced',
    description: 'Expert-level configuration options'
  }
];
