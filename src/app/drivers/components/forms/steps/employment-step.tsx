'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Briefcase, FileText, Mail, MapPin } from 'lucide-react';
import { type UseFormReturn, Controller } from 'react-hook-form';
import type { CreateDriverFormValues } from '../driver-form.types';
import { CountrySelectField } from '../fields/country-select-field';
import { DatePickerField } from '../fields/date-picker-field';
import { FormField } from '../fields/form-field';

type EmploymentStepProps = {
    form: UseFormReturn<CreateDriverFormValues>;
    isEdit?: boolean;
};

const CONTRACT_TYPES = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'TEMPORARY', label: 'Temporary' },
    { value: 'FREELANCE', label: 'Freelance' },
] as const;

export function EmploymentStep({ form, isEdit = false }: EmploymentStepProps) {
    const {
        control,
        formState: { errors },
    } = form;
    const today = new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Employment Details</h3>
                    <p className="text-sm text-muted-foreground">Work-related information</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    form={form}
                    name="employeeId"
                    label="Employee ID"
                    placeholder="EMP-001"
                    maxLength={50}
                    description="Internal employee identifier"
                />

                <DatePickerField form={form} name="hireDate" label="Hire Date" maxDate={today} />
            </div>

            {/* Contract Type */}
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

            {/* Address Section */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Address (Optional)</span>
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

            <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Additional Notes (Optional)</span>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
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

            {/* Invitation Option (only for create) */}
            {!isEdit && (
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Account Setup</span>
                    </div>

                    <Controller
                        name="sendInvitation"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                                <div className="space-y-1">
                                    <Label htmlFor="sendInvitation" className="text-sm font-medium cursor-pointer">
                                        Send invitation email
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Driver will receive an email to set up their account and access the system
                                    </p>
                                </div>
                                <Switch id="sendInvitation" checked={field.value} onCheckedChange={field.onChange} />
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
