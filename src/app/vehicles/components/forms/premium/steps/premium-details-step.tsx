"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, ImageIcon } from "lucide-react";
import { type UseFormReturn, Controller } from "react-hook-form";
import type { CreateVehicleFormValues } from "../../vehicle-form.types";
import {
  PremiumFormDivider,
  PremiumFormField,
  PremiumFormSection,
} from "@/app/drivers/components/forms/fields/form-field";
import { PremiumTextarea } from "@/components/ui/premium-input";
import { PremiumImageUpload } from "../premium-image-upload";

type PremiumDetailsStepProps = {
  form: UseFormReturn<CreateVehicleFormValues>;
};

export function PremiumDetailsStep({ form }: PremiumDetailsStepProps) {
  const { control, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {/* VIN Section */}
      <PremiumFormSection
        title="Technical Details"
        icon={<FileText className="h-4 w-4" />}
        delay={0.1}
      >
        <PremiumFormField
          form={form}
          name="vin"
          label="VIN (Vehicle Identification Number)"
          placeholder="WDB9630321Y123456"
          maxLength={17}
          icon="document"
          description="Optional - 17-character unique identifier"
        />
      </PremiumFormSection>

      <PremiumFormDivider />

      {/* Image Upload Section */}
      <PremiumFormSection
        title="Vehicle Image"
        icon={<ImageIcon className="h-4 w-4" />}
        delay={0.2}
      >
        <Controller
          name="imageKey"
          control={control}
          render={({ field }) => (
            <PremiumImageUpload
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </PremiumFormSection>

      <PremiumFormDivider />

      {/* Notes Section */}
      <PremiumFormSection
        title="Additional Notes"
        icon={<FileText className="h-4 w-4" />}
        delay={0.3}
      >
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <PremiumTextarea
              id="notes"
              label="Notes"
              placeholder="Add any additional information about the vehicle..."
              maxLength={2000}
              showCount
              rows={4}
              error={errors.notes?.message}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </PremiumFormSection>

      {/* Info tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl",
          "bg-emerald-500/5 border border-emerald-500/10"
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Almost Done!</p>
          <p className="text-xs text-muted-foreground">
            Review the information and click "Create Vehicle" to add this
            vehicle to your fleet. You can edit these details later.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
