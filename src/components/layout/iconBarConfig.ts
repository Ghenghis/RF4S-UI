
import { 
  Fish, 
  Activity, 
  Gauge, 
  Target, 
  Timer, 
  Eye, 
  Terminal, 
  Anchor, 
  TrendingUp, 
  Palette, 
  Camera, 
  Settings, 
  Bot,
  Database,
  Wrench,
  Bell,
  Key,
  Heart,
  Zap,
  Shield,
  Mail,
  Coffee,
  PauseCircle,
  Archive,
  BarChart3,
  AlertTriangle,
  Gamepad2,
  Network
} from 'lucide-react';

export interface IconBarItem {
  id: string;
  label: string;
  icon: any;
  category: 'main' | 'settings' | 'tools' | 'smart' | 'ai' | 'advanced';
  description?: string;
}

export const iconBarItems: IconBarItem[] = [
  // Main fishing features
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
  },
  
  // Equipment and basic setup
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
  
  // Advanced configuration
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
  
  // General settings
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
  },
  
  // AI and smart features
  {
    id: 'ai-tuning',
    label: 'AI Tuning',
    icon: Bot,
    category: 'ai',
    description: 'AI-powered optimization and fine-tuning'
  },
  {
    id: 'smart-analytics',
    label: 'Analytics',
    icon: TrendingUp,
    category: 'smart',
    description: 'Smart fishing insights and pattern analysis'
  },
  {
    id: 'session-analytics',
    label: 'Sessions',
    icon: BarChart3,
    category: 'smart',
    description: 'Detailed session tracking and performance metrics'
  },
  
  // Tools and utilities
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
  }
];
