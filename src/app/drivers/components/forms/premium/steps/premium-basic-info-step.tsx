'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CircleUserRound, Mail } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';
import type { CreateDriverFormValues } from '../../driver-form.types';
import { PremiumFormDivider, PremiumFormField, PremiumFormSection } from '../../fields/form-field';

type PremiumBasicInfoStepProps = {
    form: UseFormReturn<CreateDriverFormValues>;
};

export function PremiumBasicInfoStep({ form }: PremiumBasicInfoStepProps) {
    return (
        <div className="space-y-6">
            <PremiumFormSection title="Full Name" icon={<CircleUserRound className="h-4 w-4" />} delay={0.1}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <PremiumFormField
                        form={form}
                        name="firstName"
                        label="First Name"
                        placeholder="John"
                        required
                        maxLength={100}
                        icon="user"
                    />
                    <PremiumFormField
                        form={form}
                        name="lastName"
                        label="Last Name"
                        placeholder="Doe"
                        required
                        maxLength={100}
                        icon="user"
                    />
                </div>
            </PremiumFormSection>

            <PremiumFormDivider />

            <PremiumFormSection title="Contact Information" icon={<Mail className="h-4 w-4" />} delay={0.2}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <PremiumFormField
                        form={form}
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="john.doe@company.com"
                        required
                        maxLength={255}
                        description="Used for login and notifications"
                        icon="email"
                    />
                    <PremiumFormField
                        form={form}
                        name="phoneNumber"
                        label="Phone Number"
                        type="tel"
                        placeholder="+49 170 1234567"
                        maxLength={20}
                        description="Include country code"
                        icon="phone"
                    />
                </div>
            </PremiumFormSection>

            {/* Info tip */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn('flex items-start gap-3 p-4 rounded-xl', 'bg-primary/5 border border-primary/10')}
            >
                <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs text-primary font-semibold">i</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Quick Start</p>
                    <p className="text-xs text-muted-foreground">
                        The email address will be used to send an invitation to the driver. Make sure it's a valid and
                        accessible email.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
