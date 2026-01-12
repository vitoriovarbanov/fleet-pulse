'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DashboardLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div
      className={cn(
        'flex h-[calc(100vh-9rem)] w-full overflow-hidden gap-3',
        // Account for header height and any padding
        'relative',
        className
      )}
    >
      {children}
    </div>
  );
}
