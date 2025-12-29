'use client';

import { type UseFormReturn, Controller } from 'react-hook-form';
import { MapPin, FileText } from 'lucide-react';
import { FormField } from '../fields/form-field';
import { DatePickerField } from '../fields/date-picker-field';
import { CountrySelectField } from '../fields/country-select-field';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { UpdateDriverFormValues } from '../driver-form.types';

type EmploymentSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
};

const CONTRACT_TYPES = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'TEMPORARY', label: 'Temporary' },
    { value: 'FREELANCE', label: 'Freelance' },
] as const;

export function EmploymentSection({ form }: EmploymentSectionProps) {
    const {
        control,
        formState: { errors },
    } = form;
    const today = new Date();

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField form={form} name="employeeId" label="Employee ID" placeholder="EMP-001" maxLength={50} />

                <DatePickerField form={form} name="hireDate" label="Hire Date" maxDate={today} />
            </div>

            <div className="space-y-2 sm:w-1/2">
                <Label htmlFor="contractType">Contract Type</Label>
                <Controller
                    name="contractType"
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <SelectTrigger id="contractType">
                                <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Not specified</SelectItem>
                                {CONTRACT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                </div>

                <div className="space-y-4">
                    <FormField
                        form={form}
                        name="address"
                        label="Street Address"
                        placeholder="123 Main Street"
                        maxLength={255}
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormField form={form} name="city" label="City" placeholder="Berlin" maxLength={100} />

                        <FormField
                            form={form}
                            name="postalCode"
                            label="Postal Code"
                            placeholder="10115"
                            maxLength={20}
                        />

                        <CountrySelectField form={form} name="country" label="Country" />
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Notes</span>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                id="notes"
                                placeholder="Any additional information about this driver..."
                                className={cn('min-h-[100px] resize-y', errors.notes && 'border-destructive')}
                                maxLength={2000}
                                {...field}
                                value={field.value ?? ''}
                            />
                        )}
                    />
                    <p className="text-xs text-muted-foreground">Max 2000 characters</p>
                </div>
            </div>
        </div>
    );
}
