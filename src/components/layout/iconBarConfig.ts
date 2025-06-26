
import { 
  Settings, 
  FileText, 
  Upload, 
  Download, 
  Share2, 
  Save, 
  FolderOpen, 
  TestTube, 
  History, 
  Bot,
  Eye,
  Sliders,
  Zap,
  Terminal,
  Target,
  List,
  Fish,
  Anchor,
  Waves,
  Timer,
  Activity,
  Gauge,
  Wind,
  MapPin,
  Mountain,
  Navigation,
  Compass,
  Thermometer,
  Clock,
  Camera,
  Palette,
  Wrench,
  BarChart3,
  Shield,
  Cpu,
  MonitorSpeaker,
  Smartphone,
  Gamepad2,
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Bookmark
} from 'lucide-react';

export interface IconBarItem {
  id: string;
  icon: React.ElementType;
  label: string;
  category: 'main' | 'settings' | 'tools' | 'smart' | 'ai';
  description?: string;
}

export const iconBarItems: IconBarItem[] = [
  // Main Features - Fishing Operations
  { 
    id: 'script-control', 
    icon: Activity, 
    label: 'Bot Control', 
    category: 'main',
    description: 'Start/Stop fishing bot and session control'
  },
  { 
    id: 'fishing-profiles', 
    icon: Fish, 
    label: 'Active Profiles', 
    category: 'main',
    description: 'Current fishing techniques and active setups'
  },
  { 
    id: 'expanded-fishing-profiles', 
    icon: Anchor, 
    label: 'All Techniques', 
    category: 'main',
    description: 'Complete fishing profiles: Bottom, Spin, Float, Feeder'
  },
  { 
    id: 'detection-settings', 
    icon: Eye, 
    label: 'Fish Detection', 
    category: 'main',
    description: 'Bite detection, OCR confidence, and vision settings'
  },
  { 
    id: 'system-monitor', 
    icon: Gauge, 
    label: 'Performance', 
    category: 'main',
    description: 'CPU, memory usage, FPS, and session statistics'
  },
  { 
    id: 'equipment-setup', 
    icon: Target, 
    label: 'Rod & Tackle', 
    category: 'main',
    description: 'Rods, reels, lines, hooks, baits, and equipment'
  },
  { 
    id: 'automation-settings', 
    icon: Timer, 
    label: 'Auto Settings', 
    category: 'main',
    description: 'Cast delays, retrieve speeds, and automation timing'
  },
  { 
    id: 'cli-terminal', 
    icon: Terminal, 
    label: 'Bot Console', 
    category: 'main',
    description: 'Real-time bot commands and AI interaction'
  },

  // Smart Features - AI & Automation
  { 
    id: 'ai-assistant', 
    icon: Bot, 
    label: 'AI Assistant', 
    category: 'ai',
    description: 'AI-powered fishing optimization and suggestions'
  },
  { 
    id: 'smart-analytics', 
    icon: BarChart3, 
    label: 'Smart Analytics', 
    category: 'ai',
    description: 'Catch patterns, success rates, and predictive insights'
  },
  { 
    id: 'auto-optimization', 
    icon: Sparkles, 
    label: 'Auto Optimize', 
    category: 'ai',
    description: 'AI automatically adjusts settings based on conditions'
  },
  { 
    id: 'pattern-learning', 
    icon: TrendingUp, 
    label: 'Pattern Learning', 
    category: 'ai',
    description: 'Machine learning from your fishing behavior'
  },

  // Smart UI Features
  { 
    id: 'ui-customization', 
    icon: Palette, 
    label: 'UI Themes', 
    category: 'smart',
    description: 'Customize interface colors, layouts, and themes'
  },
  { 
    id: 'screenshot-sharing', 
    icon: Camera, 
    label: 'Screenshot Share', 
    category: 'smart',
    description: 'Capture and share setup screenshots with settings'
  },
  { 
    id: 'profile-manager', 
    icon: Users, 
    label: 'Profile Manager', 
    category: 'smart',
    description: 'Save, load, and share complete fishing setups'
  },
  { 
    id: 'hotkey-manager', 
    icon: Gamepad2, 
    label: 'Hotkeys', 
    category: 'smart',
    description: 'Customize keyboard shortcuts and game controls'
  },
  { 
    id: 'multi-monitor', 
    icon: MonitorSpeaker, 
    label: 'Multi-Monitor', 
    category: 'smart',
    description: 'Support for multiple screens and window layouts'
  },
  { 
    id: 'mobile-companion', 
    icon: Smartphone, 
    label: 'Mobile App', 
    category: 'smart',
    description: 'Remote monitoring and control via mobile device'
  },
  
  // Advanced Settings & Tools
  { 
    id: 'advanced-tuning', 
    icon: Wrench, 
    label: 'Advanced Tuning', 
    category: 'settings',
    description: 'Expert-level fine-tuning and calibration'
  },
  { 
    id: 'security-settings', 
    icon: Shield, 
    label: 'Security', 
    category: 'settings',
    description: 'Anti-detection, safety features, and privacy'
  },
  { 
    id: 'performance-tweaks', 
    icon: Cpu, 
    label: 'Performance', 
    category: 'settings',
    description: 'CPU optimization, memory management, and speed'
  },
  { 
    id: 'weather-integration', 
    icon: Wind, 
    label: 'Weather Data', 
    category: 'settings',
    description: 'Real weather integration for fishing conditions'
  },

  // Settings & Configuration - Game Settings
  { 
    id: 'settings', 
    icon: Settings, 
    label: 'Game Settings', 
    category: 'settings',
    description: 'General bot configuration and preferences'
  },
  { 
    id: 'advanced-settings', 
    icon: Sliders, 
    label: 'Advanced Config', 
    category: 'settings',
    description: 'Fine-tune detection algorithms and thresholds'
  },
  { 
    id: 'ai-tuning', 
    icon: Bot, 
    label: 'AI Fine Tuning', 
    category: 'settings',
    description: 'Machine learning optimization and model training'
  },
  
  // Tools - Session Management
  { 
    id: 'save-config', 
    icon: Save, 
    label: 'Save Setup', 
    category: 'tools',
    description: 'Save current fishing configuration'
  },
  { 
    id: 'load-config', 
    icon: Upload, 
    label: 'Load Setup', 
    category: 'tools',
    description: 'Load saved fishing configuration'
  },
  { 
    id: 'export-config', 
    icon: Download, 
    label: 'Export Config', 
    category: 'tools',
    description: 'Export configuration to file'
  },
  { 
    id: 'share-config', 
    icon: Share2, 
    label: 'Share Setup', 
    category: 'tools',
    description: 'Share fishing setup with other players'
  },
  { 
    id: 'history', 
    icon: History, 
    label: 'Session History', 
    category: 'tools',
    description: 'View past fishing sessions and catch records'
  },
  { 
    id: 'community-hub', 
    icon: MessageSquare, 
    label: 'Community', 
    category: 'tools',
    description: 'Connect with other RF4S users and share tips'
  },
  { 
    id: 'bookmarks', 
    icon: Bookmark, 
    label: 'Favorites', 
    category: 'tools',
    description: 'Save favorite fishing spots and successful setups'
  },
];
