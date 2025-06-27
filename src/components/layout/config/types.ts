
export interface IconBarItem {
  id: string;
  label: string;
  icon: any;
  category: 'main' | 'settings' | 'tools' | 'smart' | 'ai' | 'advanced';
  description?: string;
  isPanel?: boolean;
}
