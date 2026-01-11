"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Truck, Hash } from "lucide-react";
import { type UseFormReturn, Controller } from "react-hook-form";
import type { CreateVehicleFormValues } from "../../vehicle-form.types";
import { VEHICLE_TYPES } from "../../vehicle-form.types";
import {
  PremiumFormDivider,
  PremiumFormField,
  PremiumFormSection,
} from "@/app/drivers/components/forms/fields/form-field";
import { PremiumSelect } from "@/components/ui/premium-input";

type PremiumBasicInfoStepProps = {
  form: UseFormReturn<CreateVehicleFormValues>;
};

export function PremiumBasicInfoStep({ form }: PremiumBasicInfoStepProps) {
  const { control, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {/* Plate Number Section */}
      <PremiumFormSection
        title="Vehicle Identification"
        icon={<Hash className="h-4 w-4" />}
        delay={0.1}
      >
        <PremiumFormField
          form={form}
          name="plateNumber"
          label="Plate Number"
          placeholder="ABC-1234"
          required
          maxLength={20}
          icon="hash"
          description="The license plate number of the vehicle"
        />
      </PremiumFormSection>

      <PremiumFormDivider />

      {/* Make and Model Section */}
      <PremiumFormSection
        title="Vehicle Details"
        icon={<Truck className="h-4 w-4" />}
        delay={0.2}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <PremiumFormField
            form={form}
            name="make"
            label="Make"
            placeholder="Mercedes-Benz"
            required
            maxLength={100}
            description="Vehicle manufacturer"
          />
          <PremiumFormField
            form={form}
            name="model"
            label="Model"
            placeholder="Actros"
            required
            maxLength={100}
            description="Vehicle model"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PremiumFormField
            form={form}
            name="year"
            label="Year"
            type="number"
            placeholder="2024"
            maxLength={4}
            icon="calendar"
            description="Manufacturing year"
          />

          {/* Vehicle Type Select */}
          <div className="space-y-2">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <PremiumSelect
                  id="type"
                  label="Vehicle Type"
                  required
                  error={errors.type?.message}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  options={VEHICLE_TYPES.map((type) => ({
                    value: type.value,
                    label: type.label,
                  }))}
                />
              )}
            />
          </div>
        </div>
      </PremiumFormSection>

      {/* Info tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "flex items-start gap-3 p-4 rounded-xl",
          "bg-primary/5 border border-primary/10"
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs text-primary font-semibold">i</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Vehicle Types</p>
          <p className="text-xs text-muted-foreground">
            <strong>Truck:</strong> Heavy goods vehicles. <strong>Trailer:</strong> Towed units. <strong>Van:</strong> Light commercial vehicles. <strong>Bus:</strong> Passenger transport.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
