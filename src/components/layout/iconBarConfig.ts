
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
  Wrench
} from 'lucide-react';

export interface IconBarItem {
  id: string;
  label: string;
  icon: any;
  category: 'main' | 'settings' | 'tools' | 'smart' | 'ai';
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
  
  // Equipment and setup
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
  
  // Configuration and advanced settings
  {
    id: 'config-dashboard',
    label: 'Config Editor',
    icon: Database,
    category: 'settings',
    description: 'Edit YAML configuration with version control'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    category: 'settings',
    description: 'General application settings and preferences'
  },
  {
    id: 'advanced-settings',
    label: 'Advanced',
    icon: Wrench,
    category: 'settings',
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
  }
];
