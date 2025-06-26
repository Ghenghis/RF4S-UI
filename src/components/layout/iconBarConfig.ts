
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
  Clock
} from 'lucide-react';

export interface IconBarItem {
  id: string;
  icon: React.ElementType;
  label: string;
  category: 'main' | 'settings' | 'tools';
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
];
