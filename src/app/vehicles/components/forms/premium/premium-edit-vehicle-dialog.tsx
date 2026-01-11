"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  FileText,
  ImageIcon,
  Activity,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import {
  PremiumDialog,
  PremiumDialogContent,
  PremiumDialogHeader,
  PremiumDialogFooter,
  PremiumDialogTitle,
  PremiumDialogDescription,
} from "@/components/ui/premium-dialog";
import { PremiumTabs, TabPanel } from "@/components/ui/premium-tabs";
import { PremiumButton } from "@/components/ui/premium-button";
import { PremiumInput, PremiumSelect, PremiumTextarea } from "@/components/ui/premium-input";
import { PremiumImageUpload } from "./premium-image-upload";

import { useUpdateVehicle, extractDirtyFields } from "../vehicle-form.hooks";
import {
  updateVehicleFormSchema,
  getUpdateVehicleDefaultValues,
  VEHICLE_TYPES,
  VEHICLE_STATUS_OPTIONS,
  type UpdateVehicleFormValues,
} from "../vehicle-form.types";

type PremiumEditVehicleDialogProps = {
  vehicleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TABS = [
  { id: "details", label: "Details", icon: <Truck className="h-4 w-4" /> },
  { id: "image", label: "Image", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "status", label: "Status", icon: <Activity className="h-4 w-4" /> },
];

export function PremiumEditVehicleDialog({
  vehicleId,
  open,
  onOpenChange,
}: PremiumEditVehicleDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  // Fetch vehicle data
  const { data: vehicle, isLoading } = api.vehicles.getById.useQuery(
    { vehicleId: vehicleId! },
    { enabled: open && !!vehicleId }
  );

  const form = useForm<UpdateVehicleFormValues>({
    resolver: zodResolver(updateVehicleFormSchema),
    defaultValues: getUpdateVehicleDefaultValues(vehicleId ?? ""),
    mode: "onChange",
  });

  const { control, register, formState: { errors, isDirty, dirtyFields } } = form;

  // Populate form when vehicle data loads
  useEffect(() => {
    if (vehicle && vehicleId) {
      form.reset({
        vehicleId,
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year ?? null,
        type: vehicle.type,
        vin: vehicle.vin ?? "",
        notes: vehicle.notes ?? "",
        imageKey: vehicle.imageKey ?? null,
        status: vehicle.status,
      });
    }
  }, [vehicle, vehicleId, form]);

  const updateVehicle = useUpdateVehicle({
    onSuccess: () => {
      handleClose();
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!vehicleId) return;

    const changedData = extractDirtyFields(data, dirtyFields);

    const payload: UpdateVehicleFormValues = {
      vehicleId,
      ...changedData,
    };

    // Convert empty strings to null for nullable fields
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    ) as UpdateVehicleFormValues;

    updateVehicle.mutate(cleanedPayload);
  });

  const handleClose = () => {
    form.reset();
    setActiveTab("details");
    onOpenChange(false);
  };

  const displayName = vehicle
    ? `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model}`
    : "Loading...";

  return (
    <PremiumDialog open={open} onOpenChange={handleClose}>
      <PremiumDialogContent size="lg" className="overflow-hidden flex flex-col">
        <PremiumDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <PremiumDialogTitle>Edit Vehicle</PremiumDialogTitle>
              <PremiumDialogDescription>{displayName}</PremiumDialogDescription>
            </div>
          </div>

          {/* Unsaved changes indicator */}
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </PremiumDialogHeader>

        {/* Tabs */}
        <div className="px-6">
          <PremiumTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Details Tab */}
              <TabPanel key="details" isActive={activeTab === "details"}>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Vehicle Information
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <PremiumInput
                        id="plateNumber"
                        label="Plate Number"
                        required
                        error={errors.plateNumber?.message}
                        {...register("plateNumber")}
                      />
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <PremiumSelect
                            id="type"
                            label="Vehicle Type"
                            error={errors.type?.message}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            options={VEHICLE_TYPES.map((type) => ({
                              value: type.value,
                              label: type.label,
                            }))}
                          />
                        )}
                      />
                      <PremiumInput
                        id="make"
                        label="Make"
                        required
                        error={errors.make?.message}
                        {...register("make")}
                      />
                      <PremiumInput
                        id="model"
                        label="Model"
                        required
                        error={errors.model?.message}
                        {...register("model")}
                      />
                      <PremiumInput
                        id="year"
                        label="Year"
                        type="number"
                        error={errors.year?.message}
                        {...register("year", { valueAsNumber: true })}
                      />
                      <PremiumInput
                        id="vin"
                        label="VIN"
                        description="Vehicle Identification Number (17 characters)"
                        error={errors.vin?.message}
                        {...register("vin")}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Additional Notes
                    </h3>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <PremiumTextarea
                          id="notes"
                          label="Notes"
                          placeholder="Add any additional information..."
                          maxLength={2000}
                          showCount
                          rows={4}
                          error={errors.notes?.message}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabPanel>

              {/* Image Tab */}
              <TabPanel key="image" isActive={activeTab === "image"}>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Vehicle Image
                  </h3>
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
                </div>
              </TabPanel>

              {/* Status Tab */}
              <TabPanel key="status" isActive={activeTab === "status"}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Vehicle Status
                    </h3>

                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-3">
                          {VEHICLE_STATUS_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isSelected = field.value === option.value;

                            return (
                              <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={cn(
                                  "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                                  isSelected
                                    ? cn(
                                        "border-2",
                                        option.borderColor,
                                        option.bgColor
                                      )
                                    : "border-border/50 hover:border-border bg-card"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex items-center justify-center h-10 w-10 rounded-xl",
                                    option.bgColor
                                  )}
                                >
                                  <Icon
                                    className={cn("h-5 w-5", option.textColor)}
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium">{option.label}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {option.value === "ACTIVE" &&
                                      "Vehicle is operational and available"}
                                    {option.value === "MAINTENANCE" &&
                                      "Vehicle is undergoing maintenance"}
                                    {option.value === "OUT_OF_SERVICE" &&
                                      "Vehicle is no longer in use"}
                                  </p>
                                </div>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={cn(
                                      "h-6 w-6 rounded-full flex items-center justify-center",
                                      option.bgColor
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "h-3 w-3 rounded-full",
                                        option.value === "ACTIVE"
                                          ? "bg-emerald-500"
                                          : option.value === "MAINTENANCE"
                                            ? "bg-amber-500"
                                            : "bg-red-500"
                                      )}
                                    />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </TabPanel>
            </AnimatePresence>
          )}
        </div>

        <PremiumDialogFooter>
          <div className="flex items-center justify-end w-full gap-3">
            <PremiumButton
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              type="button"
              variant="primary"
              onClick={handleSubmit}
              loading={updateVehicle.isPending}
              loadingText="Saving..."
              disabled={!isDirty}
              icon={!updateVehicle.isPending ? <Save className="h-4 w-4" /> : undefined}
              className="cursor-pointer"
            >
              Save Changes
            </PremiumButton>
          </div>
        </PremiumDialogFooter>
      </PremiumDialogContent>
    </PremiumDialog>
  );
}
