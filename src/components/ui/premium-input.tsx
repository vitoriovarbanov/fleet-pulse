'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type PremiumInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    success?: boolean;
    description?: string;
    icon?: React.ReactNode;
    required?: boolean;
};

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ className, type, label, error, success, description, icon, required, id, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const inputId = id ?? React.useId();

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'block text-sm font-medium transition-colors duration-200',
                            error
                                ? 'text-destructive'
                                : isFocused
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                        )}
                    >
                        {label}
                        {required && <span className="ml-1 text-destructive">*</span>}
                    </label>
                )}

                <div className="relative group">
                    {/* Glow effect on focus */}
                    <motion.div
                        className={cn(
                            'absolute -inset-0.5 rounded-xl opacity-0 blur-sm transition-opacity',
                            error ? 'bg-destructive/20' : success ? 'bg-emerald-500/20' : 'bg-primary/20'
                        )}
                        animate={{
                            opacity: isFocused ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                    />

                    <div className="relative">
                        {icon && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
                        )}

                        <input
                            type={type}
                            id={inputId}
                            ref={ref}
                            onFocus={(e) => {
                                setIsFocused(true);
                                props.onFocus?.(e);
                            }}
                            onBlur={(e) => {
                                setIsFocused(false);
                                props.onBlur?.(e);
                            }}
                            className={cn(
                                // Base styles
                                'flex h-11 w-full rounded-xl border bg-card px-4 py-2 text-sm',
                                'transition-all duration-200',
                                // Placeholder
                                'placeholder:text-muted-foreground/60',
                                // Focus states
                                'focus:outline-none',
                                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                                // Icon padding
                                icon && 'pl-10',
                                // Status indicator padding
                                (error || success) && 'pr-10',
                                // Error state
                                error && ['border-destructive', 'focus:border-destructive focus:ring-destructive/20'],
                                // Success state
                                success &&
                                    !error && ['border-emerald-500', 'focus:border-emerald-500 focus:ring-emerald-500/20'],
                                // Default border
                                !error && !success && 'border-border hover:border-border/80',
                                // Disabled
                                'disabled:cursor-not-allowed disabled:opacity-50',
                                className
                            )}
                            aria-invalid={!!error}
                            aria-describedby={error ? `${inputId}-error` : description ? `${inputId}-desc` : undefined}
                            {...props}
                        />

                        {/* Status icon */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                </motion.div>
                            )}
                            {success && !error && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Error or description */}
                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.p
                            key="error"
                            id={`${inputId}-error`}
                            initial={{ opacity: 0, y: -4, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            className="text-sm text-destructive flex items-center gap-1.5"
                        >
                            {error}
                        </motion.p>
                    ) : description ? (
                        <motion.p
                            key="description"
                            id={`${inputId}-desc`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-muted-foreground"
                        >
                            {description}
                        </motion.p>
                    ) : null}
                </AnimatePresence>
            </div>
        );
    }
);
PremiumInput.displayName = 'PremiumInput';

// Premium Select component
type PremiumSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    error?: string;
    description?: string;
    options: { value: string; label: string }[];
    required?: boolean;
    placeholder?: string;
};

const PremiumSelect = React.forwardRef<HTMLSelectElement, PremiumSelectProps>(
    ({ className, label, error, description, options, required, placeholder, id, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const selectId = id ?? React.useId();

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={selectId}
                        className={cn(
                            'block text-sm font-medium transition-colors duration-200',
                            error
                                ? 'text-destructive'
                                : isFocused
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                        )}
                    >
                        {label}
                        {required && <span className="ml-1 text-destructive">*</span>}
                    </label>
                )}

                <div className="relative group">
                    <motion.div
                        className={cn(
                            'absolute -inset-0.5 rounded-xl opacity-0 blur-sm transition-opacity',
                            error ? 'bg-destructive/20' : 'bg-primary/20'
                        )}
                        animate={{ opacity: isFocused ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    <select
                        id={selectId}
                        ref={ref}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={cn(
                            'flex h-11 w-full rounded-xl border bg-card px-4 py-2 text-sm',
                            'transition-all duration-200 appearance-none cursor-pointer',
                            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                            'pr-10', // Space for chevron
                            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                            !error && 'border-border hover:border-border/80',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            className
                        )}
                        aria-invalid={!!error}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Custom chevron */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.p
                            key="error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-sm text-destructive"
                        >
                            {error}
                        </motion.p>
                    ) : description ? (
                        <motion.p
                            key="description"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-muted-foreground"
                        >
                            {description}
                        </motion.p>
                    ) : null}
                </AnimatePresence>
            </div>
        );
    }
);
PremiumSelect.displayName = 'PremiumSelect';

// Premium Textarea
type PremiumTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
    description?: string;
    required?: boolean;
    maxLength?: number;
    showCount?: boolean;
};

const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
    ({ className, label, error, description, required, maxLength, showCount = false, id, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const textareaId = id ?? React.useId();
        const charCount = typeof value === 'string' ? value.length : 0;

        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={cn(
                            'block text-sm font-medium transition-colors duration-200',
                            error
                                ? 'text-destructive'
                                : isFocused
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                        )}
                    >
                        {label}
                        {required && <span className="ml-1 text-destructive">*</span>}
                    </label>
                )}

                <div className="relative group">
                    <motion.div
                        className={cn(
                            'absolute -inset-0.5 rounded-xl opacity-0 blur-sm transition-opacity',
                            error ? 'bg-destructive/20' : 'bg-primary/20'
                        )}
                        animate={{ opacity: isFocused ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    <textarea
                        id={textareaId}
                        ref={ref}
                        value={value}
                        maxLength={maxLength}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={cn(
                            'flex min-h-[100px] w-full rounded-xl border bg-card px-4 py-3 text-sm',
                            'transition-all duration-200 resize-y',
                            'placeholder:text-muted-foreground/60',
                            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                            !error && 'border-border hover:border-border/80',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            className
                        )}
                        aria-invalid={!!error}
                        {...props}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {error ? (
                            <motion.p
                                key="error"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-sm text-destructive"
                            >
                                {error}
                            </motion.p>
                        ) : description ? (
                            <motion.p
                                key="description"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-muted-foreground"
                            >
                                {description}
                            </motion.p>
                        ) : (
                            <span />
                        )}
                    </AnimatePresence>

                    {showCount && maxLength && (
                        <span
                            className={cn(
                                'text-xs tabular-nums transition-colors',
                                charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-muted-foreground'
                            )}
                        >
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        );
    }
);
PremiumTextarea.displayName = 'PremiumTextarea';

export { PremiumInput, PremiumSelect, PremiumTextarea };
