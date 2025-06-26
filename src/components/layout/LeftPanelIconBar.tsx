
import React, { useState } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { iconBarItems } from './iconBarConfig';
import { useConfigActions } from '../../hooks/useConfigActions';
import IconButton from './IconButton';
import ScrollControls, { ScrollDownControl } from './ScrollControls';

const LeftPanelIconBar: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activePanel, setActivePanel] = useState<string>('script-control');
  const { togglePanelVisibility, panels } = useRF4SStore();
  
  const {
    handleSaveConfig,
    handleLoadConfig,
    handleExportConfig,
    handleShareConfig,
    handleShowHistory,
    handleAITuning,
  } = useConfigActions();

  // Calculate how many complete features can fit
  const visibleItemsCount = Math.max(4, Math.floor((window.innerHeight - 120) / 60));
  const maxScroll = Math.max(0, iconBarItems.length - visibleItemsCount);

  const handleScrollUp = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const handleScrollDown = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + 1));
  };

  const handleItemClick = (itemId: string) => {
    setActivePanel(itemId);
    
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
        if (iconBarItems.find(item => item.id === itemId)?.category === 'main') {
          togglePanelVisibility(itemId);
        }
    }
  };

  const visibleItems = iconBarItems.slice(scrollPosition, scrollPosition + visibleItemsCount);

  return (
    <div className="h-full bg-gray-800/50 border-r border-gray-700/50 flex flex-col min-w-0">
      <ScrollControls
        maxScroll={maxScroll}
        scrollPosition={scrollPosition}
        onScrollUp={handleScrollUp}
        onScrollDown={handleScrollDown}
      />

      {/* Icon List - Show complete features only */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {visibleItems.map((item) => {
          const isActive = activePanel === item.id;
          const isPanelVisible = panels.find(p => p.id === item.id)?.visible || false;
          
          return (
            <div key={item.id} className="flex-shrink-0" style={{ height: '60px' }}>
              <IconButton
                item={item}
                isActive={isActive}
                isPanelVisible={isPanelVisible}
                onClick={handleItemClick}
              />
            </div>
          );
        })}
      </div>

      <ScrollDownControl
        maxScroll={maxScroll}
        scrollPosition={scrollPosition}
        onScrollUp={handleScrollUp}
        onScrollDown={handleScrollDown}
      />
    </div>
  );
};

export default LeftPanelIconBar;
