import React, { useState } from 'react';
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
  ChevronUp,
  ChevronDown,
  Eye,
  Sliders,
  Zap
} from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { cn } from '@/lib/utils';

interface IconBarItem {
  id: string;
  icon: React.ElementType;
  label: string;
  category: 'main' | 'settings' | 'tools';
}

const iconBarItems: IconBarItem[] = [
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

const LeftPanelIconBar: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activePanel, setActivePanel] = useState<string>('script-control');
  const { togglePanelVisibility, panels } = useRF4SStore();

  const visibleItemsCount = Math.max(6, Math.floor((window.innerHeight - 200) / 50)); // Dynamic based on height
  const maxScroll = Math.max(0, iconBarItems.length - visibleItemsCount);

  const handleScrollUp = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const handleScrollDown = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + 1));
  };

  const handleItemClick = (itemId: string) => {
    setActivePanel(itemId);
    
    // Handle different actions based on item type
    switch (itemId) {
      case 'save-config':
        handleSaveConfig();
        break;
      case 'load-config':
        handleLoadConfig();
        break;
      case 'export-config':
        handleExportConfig();
        break;
      case 'share-config':
        handleShareConfig();
        break;
      case 'history':
        handleShowHistory();
        break;
      case 'ai-tuning':
        handleAITuning();
        break;
      default:
        // Toggle panel visibility for main panels
        if (iconBarItems.find(item => item.id === itemId)?.category === 'main') {
          togglePanelVisibility(itemId);
        }
    }
  };

  const handleSaveConfig = () => {
    // TODO: Implement save configuration
    console.log('Saving configuration...');
  };

  const handleLoadConfig = () => {
    // TODO: Implement load configuration
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Loading configuration from:', file.name);
      }
    };
    input.click();
  };

  const handleExportConfig = () => {
    // TODO: Implement export configuration
    const config = { message: 'RF4S Configuration Export' };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rf4s-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareConfig = () => {
    // TODO: Implement share configuration
    console.log('Sharing configuration...');
  };

  const handleShowHistory = () => {
    // TODO: Implement history view
    console.log('Showing history...');
  };

  const handleAITuning = () => {
    // TODO: Implement AI fine tuning
    console.log('Starting AI fine tuning...');
  };

  const visibleItems = iconBarItems.slice(scrollPosition, scrollPosition + visibleItemsCount);

  return (
    <div className="h-full bg-gray-800/50 border-r border-gray-700/50 flex flex-col min-w-0">
      {/* Scroll Up Button */}
      {maxScroll > 0 && (
        <button
          onClick={handleScrollUp}
          disabled={scrollPosition === 0}
          className={cn(
            "p-2 border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors flex-shrink-0",
            scrollPosition === 0 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronUp className="h-4 w-4 text-gray-400" />
        </button>
      )}

      {/* Icon List - Flexible */}
      <div className="flex-1 overflow-hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          const isPanelVisible = panels.find(p => p.id === item.id)?.visible;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "w-full p-3 border-b border-gray-700/30 hover:bg-gray-700/50 transition-colors group relative flex items-center justify-center",
                isActive && "bg-gray-700/70",
                isPanelVisible && item.category === 'main' && "bg-blue-600/30"
              )}
              title={item.label}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                isPanelVisible && item.category === 'main' && "text-blue-400"
              )} />
              
              {/* Category indicator */}
              <div className={cn(
                "absolute right-1 top-1 w-2 h-2 rounded-full",
                item.category === 'main' && "bg-green-500",
                item.category === 'settings' && "bg-yellow-500",
                item.category === 'tools' && "bg-blue-500"
              )} />
            </button>
          );
        })}
      </div>

      {/* Scroll Down Button */}
      {maxScroll > 0 && (
        <button
          onClick={handleScrollDown}
          disabled={scrollPosition >= maxScroll}
          className={cn(
            "p-2 border-t border-gray-700/50 hover:bg-gray-700/50 transition-colors flex-shrink-0",
            scrollPosition >= maxScroll && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default LeftPanelIconBar;
