"use client";

import { type UseFormReturn } from "react-hook-form";
import { FormField } from "../fields/form-field";
import type { UpdateDriverFormValues } from "../driver-form.types";

type BasicInfoSectionProps = {
  form: UseFormReturn<UpdateDriverFormValues>;
  email?: string;
};

export function BasicInfoSection({ form, email }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          form={form}
          name="firstName"
          label="First Name"
          placeholder="John"
          maxLength={100}
        />

        <FormField
          form={form}
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          maxLength={100}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email is read-only in edit mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
            {email ?? "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <FormField
          form={form}
          name="phoneNumber"
          label="Phone Number"
          type="tel"
          placeholder="+49 170 1234567"
          maxLength={20}
        />
      </div>
    </div>
  );
}
