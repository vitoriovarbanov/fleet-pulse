'use client';

import { COUNTRIES } from '@/app/constants/countries';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type FieldPath, type FieldValues, type UseFormReturn, Controller } from 'react-hook-form';

type PremiumCountrySelectProps<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: FieldPath<T>;
    label: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    description?: string;
};

export function CountrySelectField<T extends FieldValues>({
    form,
    name,
    label,
    required,
    disabled,
    className,
    description,
}: PremiumCountrySelectProps<T>) {
    const {
        control,
        formState: { errors },
    } = form;

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredCountries = COUNTRIES.filter(
        (country) =>
            country.name.toLowerCase().includes(search.toLowerCase()) ||
            country.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn('space-y-2', className)} ref={containerRef}>
            <label
                className={cn(
                    'block text-sm font-medium transition-colors',
                    error ? 'text-destructive' : 'text-muted-foreground'
                )}
            >
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </label>

            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const selectedCountry = COUNTRIES.find((c) => c.code === field.value);

                    return (
                        <div className="relative">
                            {/* Trigger button */}
                            <motion.button
                                type="button"
                                disabled={disabled}
                                onClick={() => setIsOpen(!isOpen)}
                                whileTap={disabled ? undefined : { scale: 0.99 }}
                                className={cn(
                                    'flex items-center justify-between w-full h-11 px-4 rounded-xl',
                                    'border bg-card text-sm',
                                    'transition-all duration-200',
                                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                                    error
                                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                                        : 'border-border hover:border-border/80',
                                    disabled && 'opacity-50 cursor-not-allowed',
                                    isOpen && 'border-primary ring-2 ring-primary/20'
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {selectedCountry ? (
                                        <>
                                            <span className="text-base">{selectedCountry.flag}</span>
                                            <span>{selectedCountry.name}</span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                ({selectedCountry.code})
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">Select country</span>
                                    )}
                                </span>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </motion.div>
                            </motion.button>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className={cn(
                                            'absolute z-50 top-full left-0 right-0 mt-2',
                                            'bg-card border border-border rounded-xl',
                                            'shadow-xl shadow-black/10',
                                            'overflow-hidden'
                                        )}
                                    >
                                        {/* Search input */}
                                        <div className="p-2 border-b border-border">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    placeholder="Search countries..."
                                                    className={cn(
                                                        'w-full h-9 pl-9 pr-4 rounded-lg',
                                                        'bg-muted/50 border border-transparent',
                                                        'text-sm placeholder:text-muted-foreground',
                                                        'focus:outline-none focus:border-primary/50'
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Countries list */}
                                        <div className="max-h-56 overflow-y-auto p-1">
                                            {filteredCountries.length === 0 ? (
                                                <div className="py-4 text-center text-sm text-muted-foreground">
                                                    No countries found
                                                </div>
                                            ) : (
                                                filteredCountries.map((country, index) => {
                                                    const isSelected = field.value === country.code;

                                                    return (
                                                        <motion.button
                                                            key={country.code}
                                                            type="button"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.02 }}
                                                            onClick={() => {
                                                                field.onChange(country.code);
                                                                setIsOpen(false);
                                                                setSearch('');
                                                            }}
                                                            className={cn(
                                                                'flex items-center justify-between w-full px-3 py-2 rounded-lg',
                                                                'text-sm transition-colors',
                                                                isSelected
                                                                    ? 'bg-primary/10 text-primary'
                                                                    : 'hover:bg-muted/50'
                                                            )}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span className="text-base">{country.flag}</span>
                                                                <span>{country.name}</span>
                                                                <span className="text-xs text-muted-foreground font-mono">
                                                                    {country.code}
                                                                </span>
                                                            </span>
                                                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                                                        </motion.button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                }}
            />

            <AnimatePresence mode="wait">
                {error ? (
                    <motion.p
                        key="error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-sm text-destructive"
                    >
                        {error.message}
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
