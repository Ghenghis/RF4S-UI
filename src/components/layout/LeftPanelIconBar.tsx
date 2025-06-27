import React, { useState, useRef, useEffect } from 'react';
import { useRF4SStore } from '../../stores/rf4sStore';
import { iconBarItems } from './iconBarConfig';
import { useConfigActions } from '../../hooks/useConfigActions';
import IconButton from './IconButton';
import ScrollControls, { ScrollDownControl } from './ScrollControls';

const LeftPanelIconBar: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activePanel, setActivePanel] = useState<string>('script-control');
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { togglePanelVisibility, panels } = useRF4SStore();
  
  const {
    handleSaveConfig,
    handleLoadConfig,
    handleExportConfig,
    handleShareConfig,
    handleShowHistory,
    handleAITuning,
    handleScreenshot,
    handleUICustomization,
    handleAdvancedTuning,
  } = useConfigActions();

  // Calculate how many complete features can fit with labels
  const visibleItemsCount = Math.max(3, Math.floor((window.innerHeight - 120) / 80));
  const maxScroll = Math.max(0, iconBarItems.length - visibleItemsCount);

  const handleScrollUp = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const handleScrollDown = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + 1));
  };

  // Mouse wheel and touch scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    if (delta > 0) {
      handleScrollDown();
    } else {
      handleScrollUp();
    }
  };

  // Touch scrolling support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    scrollContainerRef.current?.setAttribute('data-start-y', touch.clientY.toString());
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const startY = parseFloat(scrollContainerRef.current?.getAttribute('data-start-y') || '0');
    const deltaY = startY - touch.clientY;
    
    if (Math.abs(deltaY) > 50) { // Threshold for scroll
      if (deltaY > 0) {
        handleScrollDown();
      } else {
        handleScrollUp();
      }
      scrollContainerRef.current?.setAttribute('data-start-y', touch.clientY.toString());
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleItemClick = (itemId: string) => {
    console.log(`Icon clicked: ${itemId}`);
    setActivePanel(itemId);
    
    // Handle special actions first
    switch (itemId) {
      case 'save-config':
        handleSaveConfig();
        return;
      case 'load-config':
        handleLoadConfig();
        return;
      case 'export-config':
        handleExportConfig();
        return;
      case 'share-config':
        handleShareConfig();
        return;
      case 'history':
        handleShowHistory();
        return;
      case 'ai-tuning':
        handleAITuning();
        return;
      case 'screenshot-sharing':
        handleScreenshot();
        return;
      case 'ui-customization':
        handleUICustomization();
        return;
      case 'advanced-tuning':
        handleAdvancedTuning();
        return;
    }
    
    // For main category items, toggle panel visibility
    const item = iconBarItems.find(item => item.id === itemId);
    if (item && item.category === 'main') {
      console.log(`Toggling panel visibility for main category item: ${itemId}`);
      togglePanelVisibility(itemId);
    } else {
      console.log(`Item ${itemId} not found or not in main category`);
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

      {/* Icon List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-hidden flex flex-col select-none"
        style={{ touchAction: 'none' }}
      >
        {visibleItems.map((item) => {
          const isActive = activePanel === item.id;
          const isPanelVisible = panels.find(p => p.id === item.id)?.visible || false;
          
          return (
            <div key={item.id} className="flex-shrink-0" style={{ height: '80px' }}>
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
