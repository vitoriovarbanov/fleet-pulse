'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle, Award } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import type { UpdateDriverFormValues } from '../../driver-form.types';
import { CountrySelectField as PremiumCountrySelect } from '../../fields/country-select-field';
import { PremiumLicenseCategories } from '../../fields/license-categories-field';
import { PremiumDateField, PremiumFormDivider, PremiumFormField } from '../../fields/form-field';

type PremiumLicenseSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
};

export function PremiumLicenseSection({ form }: PremiumLicenseSectionProps) {
    const today = new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <PremiumLicenseCategories form={form} name="licenseCategories" />

            <PremiumFormDivider />

            <div className="grid gap-4 sm:grid-cols-2">
                <PremiumFormField
                    form={form}
                    name="licenseNumber"
                    label="License Number"
                    placeholder="B072RRE2I55"
                    maxLength={50}
                    icon="hash"
                />
                <PremiumCountrySelect form={form} name="licenseCountry" label="Issuing Country" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <PremiumDateField form={form} name="licenseIssueDate" label="Issue Date" maxDate={today} />
                <PremiumDateField form={form} name="licenseExpiryDate" label="Expiry Date" />
            </div>

            <div className="sm:w-1/2">
                <PremiumFormField
                    form={form}
                    name="yearsExperience"
                    label="Years of Experience"
                    type="number"
                    placeholder="5"
                />
            </div>

            <PremiumFormDivider />

            {/* Optional Certificates */}
            <div className="space-y-4">
                {/* Medical Certificate */}
                <div className={cn('p-4 rounded-xl border border-border/50 bg-muted/20', 'space-y-4')}>
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Medical Certificate</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <PremiumDateField form={form} name="medicalCertIssueDate" label="Issue Date" maxDate={today} />
                        <PremiumDateField form={form} name="medicalCertExpiryDate" label="Expiry Date" />
                    </div>
                </div>

                {/* ADR Certificate */}
                <div className={cn('p-4 rounded-xl border border-border/50 bg-muted/20', 'space-y-4')}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">ADR Certificate</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <PremiumFormField
                            form={form}
                            name="adrCertNumber"
                            label="Certificate Number"
                            placeholder="ADR-2024-12345"
                            maxLength={50}
                            icon="hash"
                        />
                        <PremiumDateField form={form} name="adrExpiryDate" label="Expiry Date" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
