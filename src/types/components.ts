
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'healthy' | 'warning' | 'critical';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export interface InfoDisplayProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  headerActions?: React.ReactNode;
  compact?: boolean;
}
