'use client';

import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bell, Menu } from 'lucide-react';
import { UserMenu } from './user-menu';

type HeaderProps = {
    onMenuClick?: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-0 z-40 w-full',
                // Glass-morphism effect
                'border-b border-border/40',
                'bg-background/60 backdrop-blur-xl backdrop-saturate-150',
                // Subtle gradient overlay
                'before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/[0.02] before:via-transparent before:to-secondary/[0.02] before:pointer-events-none'
            )}
        >
            <div className="relative flex h-16 items-center gap-4 px-4 sm:px-6">
                {/* Mobile menu button */}
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className={cn(
                            'relative flex h-10 w-10 items-center justify-center rounded-xl md:hidden',
                            'bg-gradient-to-br from-primary/10 to-primary/5',
                            'ring-1 ring-primary/20',
                            'text-primary',
                            'transition-all duration-150',
                            'hover:from-primary/15 hover:to-primary/10 hover:ring-primary/30',
                            'active:scale-95'
                        )}
                    >
                        <Menu
                            className="h-5 w-5"
                            style={{
                                filter: 'drop-shadow(0 0 4px oklch(0.62 0.18 250 / 0.3))',
                            }}
                        />
                        <span className="sr-only">Toggle menu</span>
                    </button>
                )}

                <div className="flex-1" />

                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 rounded-xl text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground cursor-pointer"
                    >
                        <Bell className="h-5 w-5 cursor-pointer" />
                        {/* Notification indicator */}
                        <span className="absolute right-2 top-2 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        <span className="sr-only">Notifications</span>
                    </Button>

                    {/* Divider */}
                    <div className="mx-1 hidden h-6 w-px bg-border/50 sm:block" />

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* User menu */}
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
