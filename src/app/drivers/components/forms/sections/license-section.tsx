'use client';

import { type UseFormReturn } from 'react-hook-form';
import { Award, AlertTriangle } from 'lucide-react';
import { FormField } from '../fields/form-field';
import { DatePickerField } from '../fields/date-picker-field';
import { LicenseCategoriesField } from '../fields/license-categories-field';
import { CountrySelectField } from '../fields/country-select-field';
import type { UpdateDriverFormValues } from '../driver-form.types';

type LicenseSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
};

export function LicenseSection({ form }: LicenseSectionProps) {
    const today = new Date();

    return (
        <div className="space-y-6">
            <LicenseCategoriesField form={form} name="licenseCategories" />

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    form={form}
                    name="licenseNumber"
                    label="License Number"
                    placeholder="B072RRE2I55"
                    maxLength={50}
                />

                <CountrySelectField form={form} name="licenseCountry" label="Issuing Country" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <DatePickerField form={form} name="licenseIssueDate" label="Issue Date" maxDate={today} />

                <DatePickerField form={form} name="licenseExpiryDate" label="Expiry Date" />
            </div>

            {/* Experience */}
            <FormField
                form={form}
                name="yearsExperience"
                label="Years of Experience"
                type="number"
                placeholder="5"
                className="sm:w-1/2"
            />

            {/* Medical Certificate Section */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Medical Certificate</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <DatePickerField form={form} name="medicalCertIssueDate" label="Issue Date" maxDate={today} />

                    <DatePickerField form={form} name="medicalCertExpiryDate" label="Expiry Date" />
                </div>
            </div>

            {/* ADR Certificate Section */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">ADR Certificate - Dangerous Goods</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        form={form}
                        name="adrCertNumber"
                        label="ADR Certificate Number"
                        placeholder="ADR-2024-12345"
                        maxLength={50}
                    />

                    <DatePickerField form={form} name="adrExpiryDate" label="ADR Expiry Date" />
                </div>
            </div>
        </div>
    );
}
