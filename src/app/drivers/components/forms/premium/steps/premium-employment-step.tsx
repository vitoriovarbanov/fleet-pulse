'use client';

import { CONTRACT_TYPES } from '@/app/constants/contactTypes';
import { PremiumTextarea } from '@/components/ui/premium-input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Briefcase, FileText, MapPin, Send } from 'lucide-react';
import { type UseFormReturn, Controller } from 'react-hook-form';
import type { CreateDriverFormValues } from '../../driver-form.types';
import { CountrySelectField as PremiumCountrySelect } from '../../fields/country-select-field';
import { PremiumDateField, PremiumFormDivider, PremiumFormField, PremiumFormSection } from '../../fields/form-field';

type PremiumEmploymentStepProps = {
    form: UseFormReturn<CreateDriverFormValues>;
};

export function PremiumEmploymentStep({ form }: PremiumEmploymentStepProps) {
    const {
        control,
        formState: { errors },
    } = form;
    const today = new Date();

    return (
        <div className="space-y-6">
            <PremiumFormSection title="Work Details" icon={<Briefcase className="h-4 w-4" />} delay={0.1}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <PremiumFormField
                        form={form}
                        name="employeeId"
                        label="Employee ID"
                        placeholder="EMP-001"
                        maxLength={50}
                        description="Internal employee identifier"
                        icon="hash"
                    />
                    <PremiumDateField form={form} name="hireDate" label="Hire Date" maxDate={today} />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Contract Type</label>
                    <Controller
                        name="contractType"
                        control={control}
                        render={({ field }) => (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {CONTRACT_TYPES.map((type, index) => {
                                    const isSelected = field.value === type.value;
                                    return (
                                        <motion.button
                                            key={type.value}
                                            type="button"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => field.onChange(isSelected ? '' : type.value)}
                                            className={cn(
                                                'px-3 py-2 rounded-xl text-sm font-medium',
                                                'border-2 transition-all duration-200',
                                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                isSelected
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border/50 bg-card hover:border-primary/30'
                                            )}
                                        >
                                            {type.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    />
                </div>
            </PremiumFormSection>

            <PremiumFormDivider />

            {/* Address */}
            <PremiumFormSection
                title="Address"
                description="Optional home address"
                icon={<MapPin className="h-4 w-4" />}
                delay={0.2}
            >
                <PremiumFormField
                    form={form}
                    name="address"
                    label="Street Address"
                    placeholder="123 Main Street"
                    maxLength={255}
                    icon="location"
                />

                <div className="grid gap-4 sm:grid-cols-3 mt-4">
                    <PremiumFormField form={form} name="city" label="City" placeholder="Berlin" maxLength={100} />
                    <PremiumFormField
                        form={form}
                        name="postalCode"
                        label="Postal Code"
                        placeholder="10115"
                        maxLength={20}
                    />
                    <PremiumCountrySelect form={form} name="country" label="Country" />
                </div>
            </PremiumFormSection>

            <PremiumFormDivider />

            {/* Notes */}
            <PremiumFormSection
                title="Additional Notes"
                description="Optional comments"
                icon={<FileText className="h-4 w-4" />}
                delay={0.3}
            >
                <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                        <PremiumTextarea
                            placeholder="Any additional information about this driver..."
                            maxLength={2000}
                            showCount
                            error={errors.notes?.message}
                            {...field}
                            value={field.value ?? ''}
                        />
                    )}
                />
            </PremiumFormSection>

            <PremiumFormDivider />

            {/* Invitation toggle */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Controller
                    name="sendInvitation"
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
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/50 bg-card hover:border-primary/30'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'flex items-center justify-center h-10 w-10 rounded-xl',
                                        'transition-colors',
                                        field.value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    <Send className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-foreground">Send Invitation Email</p>
                                    <p className="text-xs text-muted-foreground">
                                        Driver will receive an email to set up their account
                                    </p>
                                </div>
                            </div>

                            {/* Toggle indicator */}
                            <div
                                className={cn(
                                    'relative h-6 w-11 rounded-full transition-colors',
                                    field.value ? 'bg-primary' : 'bg-muted'
                                )}
                            >
                                <motion.div
                                    initial={false}
                                    animate={{
                                        x: field.value ? 20 : 2,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                                />
                            </div>
                        </motion.button>
                    )}
                />
            </motion.div>

            {/* Final tip */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn('flex items-start gap-3 p-4 rounded-xl', 'bg-emerald-500/5 border border-emerald-500/10')}
            >
                <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs text-emerald-600 font-semibold">✓</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Almost Done!</p>
                    <p className="text-xs text-muted-foreground">
                        Review the information and click "Create Driver" to add this driver to your fleet.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
