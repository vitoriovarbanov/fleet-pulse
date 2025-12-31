'use client';

import { motion } from 'framer-motion';
import { type UseFormReturn } from 'react-hook-form';
import { PremiumFormField, PremiumReadOnlyField } from '../../fields/form-field';
import type { UpdateDriverFormValues } from '../../driver-form.types';

type PremiumBasicInfoSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
    email?: string;
};

export function PremiumBasicInfoSection({ form, email }: PremiumBasicInfoSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <PremiumFormField
                    form={form}
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                    maxLength={100}
                    icon="user"
                />
                <PremiumFormField
                    form={form}
                    name="lastName"
                    label="Last Name"
                    placeholder="Doe"
                    maxLength={100}
                    icon="user"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <PremiumReadOnlyField label="Email Address" value={email} description="Email cannot be changed" />
                <PremiumFormField
                    form={form}
                    name="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    placeholder="+49 170 1234567"
                    maxLength={20}
                    icon="phone"
                />
            </div>
        </motion.div>
    );
}
