"use client";

import { AlertTriangle, Award, Shield } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { CountrySelectField } from '../fields/country-select-field';
import { DatePickerField } from '../fields/date-picker-field';
import { FormField } from '../fields/form-field';
import { LicenseCategoriesField } from '../fields/license-categories-field';

import type { CreateDriverFormValues } from "../driver-form.types";

type LicenseDetailsStepProps = {
  form: UseFormReturn<CreateDriverFormValues>;
};

export function LicenseDetailsStep({ form }: LicenseDetailsStepProps) {
  const today = new Date();
  const minExpiryDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">License Details</h3>
          <p className="text-sm text-muted-foreground">
            Driving license and certifications
          </p>
        </div>
      </div>

      <LicenseCategoriesField
        form={form}
        name="licenseCategories"
        required
      />

      {/* License Number and Country */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          form={form}
          name="licenseNumber"
          label="License Number"
          placeholder="B072RRE2I55"
          required
          maxLength={50}
        />

        <CountrySelectField
          form={form}
          name="licenseCountry"
          label="Issuing Country"
          required
        />
      </div>

      {/* Issue and Expiry Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePickerField
          form={form}
          name="licenseIssueDate"
          label="Issue Date"
          required
          maxDate={today}
        />

        <DatePickerField
          form={form}
          name="licenseExpiryDate"
          label="Expiry Date"
          required
          minDate={minExpiryDate}
          description="Must be a future date"
        />
      </div>

      {/* Experience */}
      <FormField
        form={form}
        name="yearsExperience"
        label="Years of Experience"
        type="number"
        placeholder="5"
        description="Professional driving experience"
        className="sm:w-1/2"
      />

      {/* Medical Certificate Section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Medical Certificate (Optional)
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DatePickerField
            form={form}
            name="medicalCertIssueDate"
            label="Issue Date"
            maxDate={today}
          />

          <DatePickerField
            form={form}
            name="medicalCertExpiryDate"
            label="Expiry Date"
          />
        </div>
      </div>

      {/* ADR Certificate Section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            ADR Certificate - Dangerous Goods (Optional)
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            form={form}
            name="adrCertNumber"
            label="ADR Certificate Number"
            placeholder="ADR-2024-12345"
            maxLength={50}
          />

          <DatePickerField
            form={form}
            name="adrExpiryDate"
            label="ADR Expiry Date"
          />
        </div>
      </div>
    </div>
  );
}
