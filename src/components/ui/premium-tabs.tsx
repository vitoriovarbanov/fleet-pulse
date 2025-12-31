'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TabItem = {
    id: string;
    label: string;
    icon?: React.ReactNode;
};

type PremiumTabsProps = {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
};

export function PremiumTabs({ tabs, activeTab, onTabChange, className }: PremiumTabsProps) {
    return (
        <div
            className={cn(
                'relative flex items-center gap-1 p-1 rounded-xl',
                'bg-muted/50 border border-border/50',
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <motion.button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        whileHover={isActive ? undefined : { scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            'relative flex items-center gap-2 px-4 py-2 rounded-lg',
                            'text-sm font-medium transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {/* Active background */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className={cn('absolute inset-0 rounded-lg', 'bg-card shadow-sm border border-border/50')}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 35,
                                }}
                            />
                        )}

                        {/* Content */}
                        <span className="relative flex items-center gap-2 cursor-pointer">
                            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                            <span>{tab.label}</span>
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}

// Vertical tab variant
type PremiumVerticalTabsProps = PremiumTabsProps & {
    compact?: boolean;
};

export function PremiumVerticalTabs({
    tabs,
    activeTab,
    onTabChange,
    compact = false,
    className,
}: PremiumVerticalTabsProps) {
    return (
        <div className={cn('flex flex-col gap-1 p-1 rounded-xl', 'bg-muted/30', className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                    <motion.button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        whileHover={isActive ? undefined : { x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            'relative flex items-center gap-3 rounded-lg text-left',
                            'transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            compact ? 'px-3 py-2' : 'px-4 py-3',
                            isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                    >
                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeVerticalTab"
                                className={cn('absolute inset-0 rounded-lg', 'bg-primary/10 border border-primary/20')}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 35,
                                }}
                            />
                        )}

                        {/* Left accent bar */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    exit={{ scaleY: 0 }}
                                    className={cn(
                                        'absolute left-0 top-2 bottom-2 w-0.5 rounded-full',
                                        'bg-primary'
                                    )}
                                />
                            )}
                        </AnimatePresence>

                        {/* Content */}
                        <span className="relative flex items-center gap-3">
                            {tab.icon && (
                                <span
                                    className={cn('flex-shrink-0 transition-colors', isActive ? 'text-primary' : '')}
                                >
                                    {tab.icon}
                                </span>
                            )}
                            <span className="text-sm font-medium">{tab.label}</span>
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}

// Tab panel container
type TabPanelProps = {
    children: React.ReactNode;
    isActive: boolean;
    className?: string;
};

export function TabPanel({ children, isActive, className }: TabPanelProps) {
    return (
        <AnimatePresence mode="wait">
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={className}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
