'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PremiumDialog = DialogPrimitive.Root;
const PremiumDialogTrigger = DialogPrimitive.Trigger;
const PremiumDialogPortal = DialogPrimitive.Portal;
const PremiumDialogClose = DialogPrimitive.Close;

const PremiumDialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-50',
            // Premium backdrop with blur and gradient
            'bg-black/40 backdrop-blur-md',
            // Subtle radial gradient for depth
            'before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:pointer-events-none',
            // Animation classes using Radix data attributes
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'duration-200',
            className
        )}
        {...props}
    />
));
PremiumDialogOverlay.displayName = 'PremiumDialogOverlay';

type PremiumDialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    size?: 'default' | 'lg' | 'xl' | 'full';
};

const PremiumDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    PremiumDialogContentProps
>(({ className, children, showCloseButton = true, size = 'lg', ...props }, ref) => {
    const sizeClasses = {
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[calc(100vw-4rem)]',
    };

    return (
        <PremiumDialogPortal>
            <PremiumDialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    'fixed top-[50%] left-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]',
                    sizeClasses[size],
                    'max-h-[90vh]',
                    // Premium glass-morphism card
                    'bg-card/95 dark:bg-card/90',
                    'backdrop-blur-xl',
                    'border border-border/50',
                    // Elegant shadow system
                    'shadow-2xl shadow-black/10 dark:shadow-black/30',
                    // Subtle gradient overlay
                    'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent before:pointer-events-none before:z-[-1]',
                    // Refined border radius
                    'rounded-2xl',
                    // Remove default outline
                    'outline-none',
                    // Animations using Radix data attributes
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                    'duration-200',
                    className
                )}
                {...props}
            >
                {/* Ambient glow effect */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-secondary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

                {children}

                {showCloseButton && (
                    <PremiumDialogClose asChild>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                'absolute top-4 right-4 z-10',
                                'flex items-center justify-center',
                                'h-8 w-8 rounded-lg',
                                'bg-muted/50 hover:bg-muted',
                                'text-muted-foreground hover:text-foreground',
                                'transition-colors duration-150',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                            )}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </motion.button>
                    </PremiumDialogClose>
                )}
            </DialogPrimitive.Content>
        </PremiumDialogPortal>
    );
});
PremiumDialogContent.displayName = 'PremiumDialogContent';

type PremiumDialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
};

function PremiumDialogHeader({ className, gradient = true, ...props }: PremiumDialogHeaderProps) {
    return (
        <div
            className={cn(
                'relative px-6 pt-6 pb-4',
                gradient && [
                    // Subtle gradient background
                    'bg-gradient-to-b from-muted/30 to-transparent',
                    // Bottom border with gradient
                    'after:absolute after:bottom-0 after:left-6 after:right-6 after:h-px',
                    'after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent',
                ],
                className
            )}
            {...props}
        />
    );
}

function PremiumDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'relative px-6 py-4',
                // Top border with gradient
                'before:absolute before:top-0 before:left-6 before:right-6 before:h-px',
                'before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent',
                // Subtle background
                'bg-gradient-to-t from-muted/20 to-transparent',
                className
            )}
            {...props}
        />
    );
}

const PremiumDialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn('text-xl font-semibold tracking-tight text-foreground', className)}
        {...props}
    />
));
PremiumDialogTitle.displayName = 'PremiumDialogTitle';

const PremiumDialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground mt-1.5', className)}
        {...props}
    />
));
PremiumDialogDescription.displayName = 'PremiumDialogDescription';

export {
    PremiumDialog,
    PremiumDialogPortal,
    PremiumDialogOverlay,
    PremiumDialogClose,
    PremiumDialogTrigger,
    PremiumDialogContent,
    PremiumDialogHeader,
    PremiumDialogFooter,
    PremiumDialogTitle,
    PremiumDialogDescription,
};
