'use client';

import { type UseFormReturn, type FieldPath, type FieldValues, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Truck, Bus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LICENSE_CATEGORIES, type EuLicenseCategory } from '../driver-form.types';

type PremiumLicenseCategoriesProps<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

export function PremiumLicenseCategories<T extends FieldValues>({
    form,
    name,
    required,
    disabled,
    className,
}: PremiumLicenseCategoriesProps<T>) {
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

    // Group categories for visual organization
    const truckCategories = LICENSE_CATEGORIES.filter((c) => ['C1', 'C1E', 'C', 'CE'].includes(c.value));
    const busCategories = LICENSE_CATEGORIES.filter((c) => ['D1', 'D1E', 'D', 'DE'].includes(c.value));

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between">
                <label
                    className={cn(
                        'text-sm font-medium transition-colors',
                        error ? 'text-destructive' : 'text-foreground'
                    )}
                >
                    License Categories
                    {required && <span className="ml-1 text-destructive">*</span>}
                </label>
            </div>

            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const selectedCategories = (field.value ?? []) as EuLicenseCategory[];

                    const toggleCategory = (category: EuLicenseCategory) => {
                        if (disabled) return;

                        const newValue = selectedCategories.includes(category)
                            ? selectedCategories.filter((c) => c !== category)
                            : [...selectedCategories, category];

                        field.onChange(newValue);
                    };

                    return (
                        <div className="space-y-4">
                            {/* Trucks Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <Truck className="h-3.5 w-3.5" />
                                    Trucks
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {truckCategories.map((cat, index) => (
                                        <CategoryButton
                                            key={cat.value}
                                            category={cat}
                                            selected={selectedCategories.includes(cat.value)}
                                            onClick={() => toggleCategory(cat.value)}
                                            disabled={disabled}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <Bus className="h-3.5 w-3.5" />
                                    Buses
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {busCategories.map((cat, index) => (
                                        <CategoryButton
                                            key={cat.value}
                                            category={cat}
                                            selected={selectedCategories.includes(cat.value)}
                                            onClick={() => toggleCategory(cat.value)}
                                            disabled={disabled}
                                            index={index + 4}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Selected summary */}
                            <AnimatePresence>
                                {selectedCategories.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-wrap gap-1.5 pt-2"
                                    >
                                        {selectedCategories.map((cat) => (
                                            <motion.span
                                                key={cat}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
                                                    'bg-primary/10 text-primary text-xs font-medium'
                                                )}
                                            >
                                                <Check className="h-3 w-3" />
                                                {cat}
                                            </motion.span>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                }}
            />

            <AnimatePresence>
                {error?.message && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-sm text-destructive"
                    >
                        {error.message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

// Individual category button
type CategoryButtonProps = {
    category: (typeof LICENSE_CATEGORIES)[number];
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
    index: number;
};

function CategoryButton({ category, selected, onClick, disabled, index }: CategoryButtonProps) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            whileHover={disabled ? undefined : { scale: 1.03 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            className={cn(
                'relative flex flex-col items-center justify-center',
                'p-3 rounded-xl border-2',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                    ? ['border-primary bg-primary/10', 'shadow-md shadow-primary/10']
                    : ['border-border/50 bg-card hover:border-primary/30', 'hover:bg-muted/30']
            )}
        >
            {/* Selection indicator */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-1.5 right-1.5"
                    >
                        <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <span className={cn('text-lg font-bold transition-colors', selected ? 'text-primary' : 'text-foreground')}>
                {category.label}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight mt-1">
                {category.description}
            </span>
        </motion.button>
    );
}
