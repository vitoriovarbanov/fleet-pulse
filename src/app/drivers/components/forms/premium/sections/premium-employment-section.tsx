'use client';

import { CONTRACT_TYPES } from '@/app/constants/contactTypes';
import { PremiumTextarea } from '@/components/ui/premium-input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileText, MapPin } from 'lucide-react';
import { type UseFormReturn, Controller } from 'react-hook-form';
import type { UpdateDriverFormValues } from '../../driver-form.types';
import { CountrySelectField as PremiumCountrySelect } from '../../fields/country-select-field';
import { PremiumDateField, PremiumFormDivider, PremiumFormField } from '../../fields/form-field';

type PremiumEmploymentSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
};

export function PremiumEmploymentSection({ form }: PremiumEmploymentSectionProps) {
    const {
        control,
        formState: { errors },
    } = form;
    const today = new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Work Details */}
            <div className="grid gap-4 sm:grid-cols-2">
                <PremiumFormField
                    form={form}
                    name="employeeId"
                    label="Employee ID"
                    placeholder="EMP-001"
                    maxLength={50}
                    icon="hash"
                />
                <PremiumDateField form={form} name="hireDate" label="Hire Date" maxDate={today} />
            </div>

            {/* Contract Type */}
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Contract Type</label>
                <Controller
                    name="contractType"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {CONTRACT_TYPES.map((type) => {
                                const isSelected = field.value === type.value;
                                return (
                                    <motion.button
                                        key={type.value}
                                        type="button"
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

            <PremiumFormDivider />

            {/* Address */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                </div>

                <PremiumFormField
                    form={form}
                    name="address"
                    label="Street Address"
                    placeholder="123 Main Street"
                    maxLength={255}
                    icon="location"
                />

                <div className="grid gap-4 sm:grid-cols-3">
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
            </div>

            <PremiumFormDivider />

            {/* Notes */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Notes</span>
                </div>

                <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                        <PremiumTextarea
                            label="Additional Notes"
                            placeholder="Any additional information about this driver..."
                            maxLength={2000}
                            showCount
                            error={errors.notes?.message}
                            {...field}
                            value={field.value ?? ''}
                        />
                    )}
                />
            </div>
        </motion.div>
    );
}
