
import React, { useState } from 'react';
import { ChevronRight, Home, Settings, Activity, Search } from 'lucide-react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  path?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

const NavigationManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [breadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'RF4S Control', path: '/' },
    { label: 'Dashboard', active: true }
  ]);
  
  const { panels, togglePanelVisibility } = useRF4SStore();

  const quickAccessItems: NavigationItem[] = [
    { id: 'script-control', label: 'Bot Control', icon: Activity },
    { id: 'system-monitor', label: 'Monitor', icon: Activity },
    { id: 'fishing-profiles', label: 'Profiles', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleQuickAccess = (itemId: string) => {
    togglePanelVisibility(itemId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic here
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm">
          <Home className="w-4 h-4 text-gray-400" />
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3 h-3 text-gray-500" />}
              <span
                className={cn(
                  'transition-colors',
                  crumb.active 
                    ? 'text-white font-medium' 
                    : 'text-gray-400 hover:text-white cursor-pointer'
                )}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Quick Access Toolbar */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search panels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 text-xs bg-gray-700/50 border border-gray-600/50 rounded focus:outline-none focus:border-blue-500/50 text-white placeholder-gray-400"
              />
            </div>
          </form>

          {/* Quick Access Buttons */}
          <div className="flex items-center space-x-1">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              const isActive = panels.find(p => p.id === item.id)?.visible;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleQuickAccess(item.id)}
                  className={cn(
                    'flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  )}
                  title={item.label}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="flex items-center justify-end mt-1">
        <div className="text-xs text-gray-500 space-x-4">
          <span>Ctrl+K: Search</span>
          <span>Ctrl+P: Quick Panel</span>
          <span>Esc: Close All</span>
        </div>
      </div>
    </div>
  );
};

export default NavigationManager;
