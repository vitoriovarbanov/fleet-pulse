'use client';

import { PremiumInput } from '@/components/ui/premium-input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, FileText, Hash, Mail, MapPin, Phone, User } from 'lucide-react';
import { type FieldPath, type FieldValues, type UseFormReturn, Controller } from 'react-hook-form';

type PremiumFormFieldProps<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    label: string;
    type?: 'text' | 'email' | 'tel' | 'number' | 'date';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    description?: string;
    maxLength?: number;
    icon?: 'user' | 'email' | 'phone' | 'calendar' | 'hash' | 'location' | 'document';
};

const iconMap = {
    user: User,
    email: Mail,
    phone: Phone,
    calendar: Calendar,
    hash: Hash,
    location: MapPin,
    document: FileText,
};

export function PremiumFormField<T extends FieldValues>({
    form,
    name,
    label,
    type = 'text',
    placeholder,
    required,
    disabled,
    className,
    description,
    maxLength,
    icon,
}: PremiumFormFieldProps<T>) {
    const {
        register,
        formState: { errors },
    } = form;

    const getNestedError = () => {
        const parts = name.split('.');
        let current: unknown = errors;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = (current as Record<string, unknown>)[part];
            } else {
                return undefined;
            }
        }
        return current as { message?: string } | undefined;
    };

    const error = getNestedError();
    const IconComponent = icon ? iconMap[icon] : null;

    return (
        <div className={cn('space-y-2', className)}>
            <PremiumInput
                id={name}
                type={type}
                label={label}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                required={required}
                error={error?.message}
                description={description}
                icon={IconComponent ? <IconComponent className="h-4 w-4" /> : undefined}
                {...register(name, {
                    valueAsNumber: type === 'number',
                })}
            />
        </div>
    );
}

// Premium Date Field with enhanced styling
type PremiumDateFieldProps<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    label: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    description?: string;
    minDate?: Date;
    maxDate?: Date;
};

export function PremiumDateField<T extends FieldValues>({
    form,
    name,
    label,
    required,
    disabled,
    className,
    description,
    minDate,
    maxDate,
}: PremiumDateFieldProps<T>) {
    const {
        control,
        formState: { errors },
    } = form;

    const getNestedError = () => {
        const parts = name.split('.');
        let current: unknown = errors;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = (current as Record<string, unknown>)[part];
            } else {
                return undefined;
            }
        }
        return current as { message?: string } | undefined;
    };

    const error = getNestedError();

    const formatDateForInput = (date: Date | null | undefined): string => {
        if (!date) return '';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().split('T')[0] ?? '';
        } catch {
            return '';
        }
    };

    const formatDateAttribute = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        return date.toISOString().split('T')[0];
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <PremiumInput
                        type="date"
                        id={name}
                        label={label}
                        disabled={disabled}
                        required={required}
                        error={error?.message}
                        description={description}
                        icon={<Calendar className="h-4 w-4" />}
                        min={formatDateAttribute(minDate)}
                        max={formatDateAttribute(maxDate)}
                        value={formatDateForInput(field.value as Date | null | undefined)}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                                field.onChange(new Date(value));
                            } else {
                                field.onChange(null);
                            }
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                    />
                )}
            />
        </div>
    );
}

// Read-only field display
type PremiumReadOnlyFieldProps = {
    label: string;
    value: string | null | undefined;
    description?: string;
    className?: string;
};

export function PremiumReadOnlyField({ label, value, description, className }: PremiumReadOnlyFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <label className="block text-sm font-medium text-muted-foreground">{label}</label>
            <div
                className={cn(
                    'flex h-11 w-full items-center rounded-xl',
                    'border border-border/50 bg-muted/30 px-4',
                    'text-sm text-muted-foreground'
                )}
            >
                {value ?? '—'}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}

// Form section with animated header
type PremiumFormSectionProps = {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    delay?: number;
};

export function PremiumFormSection({
    title,
    description,
    icon,
    children,
    className,
    delay = 0,
}: PremiumFormSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            className={cn('space-y-4', className)}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: delay + 0.1 }}
                        className={cn(
                            'flex items-center justify-center h-10 w-10 rounded-xl',
                            'bg-gradient-to-br from-primary/20 to-primary/5',
                            'border border-primary/10'
                        )}
                    >
                        <div className="text-primary">{icon}</div>
                    </motion.div>
                )}
                <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>

            <div className="space-y-4">{children}</div>
        </motion.div>
    );
}

// Form divider
export function PremiumFormDivider({ className }: { className?: string }) {
    return <div className={cn('h-px bg-gradient-to-r from-transparent via-border to-transparent my-6', className)} />;
}
