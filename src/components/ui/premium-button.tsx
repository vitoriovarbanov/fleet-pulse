'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PremiumButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type PremiumButtonSize = 'sm' | 'default' | 'lg' | 'icon';

type PremiumButtonProps = HTMLMotionProps<'button'> & {
    variant?: PremiumButtonVariant;
    size?: PremiumButtonSize;
    loading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
};

const variantStyles: Record<PremiumButtonVariant, string> = {
    primary: cn(
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        'shadow-lg shadow-primary/20',
        'border border-primary/20'
    ),
    secondary: cn(
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80',
        'shadow-md shadow-secondary/10',
        'border border-secondary/20'
    ),
    ghost: cn('bg-transparent text-foreground', 'hover:bg-muted', 'border border-transparent'),
    outline: cn('bg-transparent text-foreground', 'hover:bg-muted/50', 'border border-border', 'shadow-sm'),
    destructive: cn(
        'bg-destructive text-destructive-foreground',
        'hover:bg-destructive/90',
        'shadow-lg shadow-destructive/20',
        'border border-destructive/20'
    ),
};

const sizeStyles: Record<PremiumButtonSize, string> = {
    sm: 'h-9 px-3 text-xs gap-1.5 rounded-lg',
    default: 'h-11 px-5 text-sm gap-2 rounded-xl',
    lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
    icon: 'h-10 w-10 rounded-xl',
};

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'default',
            loading = false,
            loadingText,
            icon,
            iconPosition = 'left',
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <motion.button
                ref={ref}
                disabled={isDisabled}
                whileHover={isDisabled ? undefined : { scale: 1.02 }}
                whileTap={isDisabled ? undefined : { scale: 0.98 }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
                className={cn(
                    // Base styles
                    'relative inline-flex items-center justify-center font-medium',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                    // Variant and size
                    variantStyles[variant],
                    sizeStyles[size],
                    // Loading state
                    loading && 'cursor-wait',
                    className
                )}
                {...props}
            >
                {/* Shimmer effect for primary variant */}
                {variant === 'primary' && !isDisabled && (
                    <motion.div
                        className="absolute inset-0 rounded-xl overflow-hidden"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                )}

                {/* Content */}
                <span className="relative inline-flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {loadingText ?? children}
                        </>
                    ) : (
                        <>
                            {icon && iconPosition === 'left' && icon}
                            {children}
                            {icon && iconPosition === 'right' && icon}
                        </>
                    )}
                </span>
            </motion.button>
        );
    }
);
PremiumButton.displayName = 'PremiumButton';

// Icon button variant
type PremiumIconButtonProps = Omit<PremiumButtonProps, 'icon' | 'iconPosition' | 'children'> & {
    icon: React.ReactNode;
    label: string; // For accessibility
};

const PremiumIconButton = React.forwardRef<HTMLButtonElement, PremiumIconButtonProps>(
    ({ icon, label, variant = 'ghost', ...props }, ref) => {
        return (
            <PremiumButton ref={ref} variant={variant} size="icon" aria-label={label} {...props}>
                {icon}
            </PremiumButton>
        );
    }
);
PremiumIconButton.displayName = 'PremiumIconButton';

// Pill button for selections
type PremiumPillProps = HTMLMotionProps<'button'> & {
    selected?: boolean;
    children: React.ReactNode;
};

const PremiumPill = React.forwardRef<HTMLButtonElement, PremiumPillProps>(
    ({ className, selected = false, children, disabled, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                type="button"
                disabled={disabled}
                initial={false}
                animate={{
                    scale: selected ? 1 : 0.98,
                }}
                whileHover={disabled ? undefined : { scale: 1.02 }}
                whileTap={disabled ? undefined : { scale: 0.96 }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
                className={cn(
                    'relative px-4 py-2 rounded-full text-sm font-medium',
                    'transition-all duration-200',
                    'border-2',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    selected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                        : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
PremiumPill.displayName = 'PremiumPill';

export { PremiumButton, PremiumIconButton, PremiumPill };
