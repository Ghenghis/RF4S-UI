
import { 
  Bot,
  TrendingUp, 
  BarChart3,
  Trophy,
  Fish
} from 'lucide-react';
import { IconBarItem } from './types';

export const smartIcons: IconBarItem[] = [
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
  {
    id: 'achievement-tracker',
    label: 'Achievements',
    icon: Trophy,
    category: 'smart',
    description: 'Track progress and unlock achievements',
    isPanel: true
  },
  {
    id: 'fishing-stats',
    label: 'Fishing Stats',
    icon: Fish,
    category: 'smart',
    description: 'Detailed fishing statistics and metrics',
    isPanel: true
  }
];
