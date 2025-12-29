'use client';

import { User } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import type { CreateDriverFormValues } from '../driver-form.types';
import { FormField } from '../fields/form-field';

type BasicInfoStepProps = {
    form: UseFormReturn<CreateDriverFormValues>;
};

export function BasicInfoStep({ form }: BasicInfoStepProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Enter the driver's personal details</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    form={form}
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                    required
                    maxLength={100}
                />

                <FormField form={form} name="lastName" label="Last Name" placeholder="Doe" required maxLength={100} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    form={form}
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="john.doe@company.com"
                    required
                    maxLength={255}
                    description="Used for login and notifications"
                />

                <FormField
                    form={form}
                    name="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    placeholder="+49 170 1234567"
                    maxLength={20}
                    description="Include country code"
                />
            </div>
        </div>
    );
}
