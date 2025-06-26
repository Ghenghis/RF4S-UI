
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
  Zap
} from 'lucide-react';

export interface IconBarItem {
  id: string;
  icon: React.ElementType;
  label: string;
  category: 'main' | 'settings' | 'tools';
}

export const iconBarItems: IconBarItem[] = [
  // Main Features
  { id: 'script-control', icon: FileText, label: 'Script Control', category: 'main' },
  { id: 'fishing-profiles', icon: FolderOpen, label: 'Fishing Profiles', category: 'main' },
  { id: 'detection-settings', icon: Eye, label: 'Detection Settings', category: 'main' },
  { id: 'system-monitor', icon: TestTube, label: 'System Monitor', category: 'main' },
  { id: 'equipment-setup', icon: Sliders, label: 'Equipment Setup', category: 'main' },
  { id: 'automation-settings', icon: Zap, label: 'Automation', category: 'main' },
  
  // Settings & Configuration
  { id: 'settings', icon: Settings, label: 'Settings', category: 'settings' },
  { id: 'advanced-settings', icon: Settings, label: 'Advanced Settings', category: 'settings' },
  { id: 'ai-tuning', icon: Bot, label: 'AI Fine Tuning', category: 'settings' },
  
  // Tools
  { id: 'save-config', icon: Save, label: 'Save Config', category: 'tools' },
  { id: 'load-config', icon: Upload, label: 'Load Config', category: 'tools' },
  { id: 'export-config', icon: Download, label: 'Export Config', category: 'tools' },
  { id: 'share-config', icon: Share2, label: 'Share Config', category: 'tools' },
  { id: 'history', icon: History, label: 'History', category: 'tools' },
];
