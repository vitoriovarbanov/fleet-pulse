'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { DRIVER_STATUS_OPTIONS, type UpdateDriverFormValues } from '../../driver-form.types';
import { PremiumFormDivider, PremiumFormField } from '../../fields/form-field';

type PremiumStatusSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
};

export function PremiumStatusSection({ form }: PremiumStatusSectionProps) {
    const { control } = form;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Driver Status</span>
                </div>

                <Controller
                    name="driverStatus"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {DRIVER_STATUS_OPTIONS.map((status, index) => {
                                const isSelected = field.value === status.value;

                                return (
                                    <motion.button
                                        key={status.value}
                                        type="button"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => field.onChange(status.value)}
                                        className={cn(
                                            'flex items-center gap-2 px-4 py-3 rounded-xl',
                                            'border-2 transition-all duration-200',
                                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border/50 bg-card hover:border-primary/30'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-2.5 w-2.5 rounded-full',
                                                status.color === 'emerald' && 'bg-emerald-500',
                                                status.color === 'primary' && 'bg-primary',
                                                status.color === 'muted' && 'bg-muted-foreground',
                                                status.color === 'amber' && 'bg-amber-500',
                                                status.color === 'red' && 'bg-red-500',
                                                status.color === 'violet' && 'bg-violet-500'
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                isSelected ? 'text-primary' : 'text-foreground'
                                            )}
                                        >
                                            {status.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                />
            </div>

            {/* Availability Toggle */}
            <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                    <motion.button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                            'w-full flex items-center justify-between p-4 rounded-xl',
                            'border-2 transition-all duration-200',
                            field.value
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-border/50 bg-card hover:border-primary/30'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex items-center justify-center h-10 w-10 rounded-xl',
                                    'transition-colors',
                                    field.value
                                        ? 'bg-emerald-500/20 text-emerald-600'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-foreground">Available for Assignment</p>
                                <p className="text-xs text-muted-foreground">Can be assigned to new trips</p>
                            </div>
                        </div>

                        {/* Toggle */}
                        <div
                            className={cn(
                                'relative h-6 w-11 rounded-full transition-colors',
                                field.value ? 'bg-emerald-500' : 'bg-muted'
                            )}
                        >
                            <motion.div
                                initial={false}
                                animate={{ x: field.value ? 20 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                            />
                        </div>
                    </motion.button>
                )}
            />

            <PremiumFormDivider />

            {/* Performance Metrics */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Performance Metrics</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <PremiumFormField
                            form={form}
                            name="safetyScore"
                            label="Safety Score"
                            type="number"
                            placeholder="0-100"
                            description="Overall safety rating (0-100)"
                        />
                        {/* Visual indicator */}
                        <Controller
                            name="safetyScore"
                            control={control}
                            render={({ field }) => {
                                const score = Number(field.value) || 0;
                                const color =
                                    score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';

                                return (
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className={cn('h-full rounded-full', color)}
                                        />
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <PremiumFormField
                            form={form}
                            name="onTimeDeliveryRate"
                            label="On-Time Delivery Rate"
                            type="number"
                            placeholder="0-100"
                            description="Percentage of on-time deliveries"
                        />
                        {/* Visual indicator */}
                        <Controller
                            name="onTimeDeliveryRate"
                            control={control}
                            render={({ field }) => {
                                const rate = Number(field.value) || 0;
                                const color =
                                    rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-amber-500' : 'bg-red-500';

                                return (
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className={cn('h-full rounded-full', color)}
                                        />
                                    </div>
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
