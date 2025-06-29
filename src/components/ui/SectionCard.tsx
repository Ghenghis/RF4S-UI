
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  compact?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  className,
  headerActions,
  compact = false
}) => {
  return (
    <Card className={cn('bg-gray-800 border-gray-700', className)}>
      {title && (
        <CardHeader className={cn('pb-3', compact && 'py-2')}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              'text-white',
              compact ? 'text-sm' : 'text-base'
            )}>
              {title}
            </CardTitle>
            {headerActions}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(compact && 'py-2')}>
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
