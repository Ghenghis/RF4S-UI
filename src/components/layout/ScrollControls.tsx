
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollControlsProps {
  maxScroll: number;
  scrollPosition: number;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

const ScrollControls: React.FC<ScrollControlsProps> = ({
  maxScroll,
  scrollPosition,
  onScrollUp,
  onScrollDown,
}) => {
  if (maxScroll <= 0) return null;

  return (
    <button
      onClick={onScrollUp}
      disabled={scrollPosition === 0}
      className={cn(
        "p-2 border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors flex-shrink-0 h-12",
        scrollPosition === 0 && "opacity-50 cursor-not-allowed"
      )}
    >
      <ChevronUp className="h-4 w-4 text-gray-400 mx-auto" />
    </button>
  );
};

export const ScrollDownControl: React.FC<ScrollControlsProps> = ({
  maxScroll,
  scrollPosition,
  onScrollDown,
}) => {
  if (maxScroll <= 0) return null;

  return (
    <button
      onClick={onScrollDown}
      disabled={scrollPosition >= maxScroll}
      className={cn(
        "p-2 border-t border-gray-700/50 hover:bg-gray-700/50 transition-colors flex-shrink-0 h-12",
        scrollPosition >= maxScroll && "opacity-50 cursor-not-allowed"
      )}
    >
      <ChevronDown className="h-4 w-4 text-gray-400 mx-auto" />
    </button>
  );
};

export default ScrollControls;
