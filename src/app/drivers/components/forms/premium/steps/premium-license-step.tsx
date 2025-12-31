'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle, Award, Clock, Shield } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import type { CreateDriverFormValues } from '../../driver-form.types';
import { CountrySelectField as PremiumCountrySelect } from '../../fields/country-select-field';
import { PremiumDateField, PremiumFormDivider, PremiumFormField, PremiumFormSection } from '../../fields/form-field';
import { PremiumLicenseCategories } from '../../fields/license-categories-field';

type PremiumLicenseStepProps = {
    form: UseFormReturn<CreateDriverFormValues>;
};

export function PremiumLicenseStep({ form }: PremiumLicenseStepProps) {
    const today = new Date();
    const minExpiryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return (
        <div className="space-y-6">
            <PremiumFormSection
                title="License Categories"
                description="Select all applicable categories"
                icon={<Shield className="h-4 w-4" />}
                delay={0.1}
            >
                <PremiumLicenseCategories form={form} name="licenseCategories" required />
            </PremiumFormSection>

            <PremiumFormDivider />

            <PremiumFormSection title="License Information" icon={<Clock className="h-4 w-4" />} delay={0.2}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <PremiumFormField
                        form={form}
                        name="licenseNumber"
                        label="License Number"
                        placeholder="B072RRE2I55"
                        required
                        maxLength={50}
                        icon="hash"
                    />
                    <PremiumCountrySelect form={form} name="licenseCountry" label="Issuing Country" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <PremiumDateField form={form} name="licenseIssueDate" label="Issue Date" required maxDate={today} />
                    <PremiumDateField
                        form={form}
                        name="licenseExpiryDate"
                        label="Expiry Date"
                        required
                        minDate={minExpiryDate}
                        description="Must be a future date"
                    />
                </div>

                {/* Years of Experience */}
                <div className="mt-4 sm:w-1/2">
                    <PremiumFormField
                        form={form}
                        name="yearsExperience"
                        label="Years of Experience"
                        type="number"
                        placeholder="5"
                        description="Professional driving experience"
                    />
                </div>
            </PremiumFormSection>

            <PremiumFormDivider />

            {/* Optional Certificates */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Optional Certificates
                    </span>
                </div>

                {/* Medical Certificate */}
                <div className={cn('p-4 rounded-xl border border-border/50 bg-muted/20', 'space-y-4 mb-4')}>
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Medical Certificate</span>
                        <span className="text-xs text-muted-foreground">(Optional)</span>
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
                        <span className="text-sm font-medium">ADR Certificate - Dangerous Goods</span>
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <PremiumFormField
                            form={form}
                            name="adrCertNumber"
                            label="ADR Certificate Number"
                            placeholder="ADR-2024-12345"
                            maxLength={50}
                            icon="hash"
                        />
                        <PremiumDateField form={form} name="adrExpiryDate" label="ADR Expiry Date" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
