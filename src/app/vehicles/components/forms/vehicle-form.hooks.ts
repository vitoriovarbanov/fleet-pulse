"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/server/api/routers/vehicles/vehicles.types";
import type {
  CreateVehicleFormValues,
  UpdateVehicleFormValues,
} from "./vehicle-form.types";

// ============================================
// CREATE VEHICLE HOOK
// ============================================

type UseCreateVehicleOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useCreateVehicle(options?: UseCreateVehicleOptions) {
  const utils = api.useUtils();

  return api.vehicles.create.useMutation({
    onMutate: async (newVehicle) => {
      // Cancel any outgoing refetches to prevent race conditions
      await utils.vehicles.list.cancel();

      // Snapshot the previous value for rollback
      const previousVehicles = utils.vehicles.list.getData({ limit: 50 });

      // Optimistically add vehicle to the list
      utils.vehicles.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;

        const optimisticVehicle: (typeof old.vehicles)[number] = {
          id: `temp-${Date.now()}`,
          plateNumber: newVehicle.plateNumber,
          make: newVehicle.make,
          model: newVehicle.model,
          year: newVehicle.year ?? null,
          type: newVehicle.type,
          status: "ACTIVE",
          imageKey: null,
          assignedDriver: null,
        };

        return {
          ...old,
          vehicles: [optimisticVehicle, ...old.vehicles],
        };
      });

      return { previousVehicles };
    },

    onError: (error, _newVehicle, context) => {
      // Rollback to previous state on error
      if (context?.previousVehicles) {
        utils.vehicles.list.setData({ limit: 50 }, context.previousVehicles);
      }
      toast.error(`Failed to create vehicle: ${error.message}`);
      options?.onError?.(error);
    },

    onSuccess: () => {
      toast.success("Vehicle created successfully");
      options?.onSuccess?.();
    },

    onSettled: () => {
      // Always refetch to ensure server data consistency
      void utils.vehicles.list.invalidate();
      void utils.vehicles.getStatistics.invalidate();
    },
  });
}

// ============================================
// UPDATE VEHICLE HOOK
// ============================================

type UseUpdateVehicleOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useUpdateVehicle(options?: UseUpdateVehicleOptions) {
  const utils = api.useUtils();

  return api.vehicles.update.useMutation({
    onMutate: async (updatedVehicle) => {
      const { vehicleId, ...updateData } = updatedVehicle;

      // Cancel any outgoing refetches
      await Promise.all([
        utils.vehicles.list.cancel(),
        utils.vehicles.getById.cancel({ vehicleId }),
      ]);

      // Snapshot previous values for rollback
      const previousList = utils.vehicles.list.getData({ limit: 50 });
      const previousDetail = utils.vehicles.getById.getData({ vehicleId });

      // Optimistically update the list
      utils.vehicles.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;

        return {
          ...old,
          vehicles: old.vehicles.map((vehicle) => {
            if (vehicle.id !== vehicleId) return vehicle;

            return {
              ...vehicle,
              plateNumber: updateData.plateNumber ?? vehicle.plateNumber,
              make: updateData.make ?? vehicle.make,
              model: updateData.model ?? vehicle.model,
              year: updateData.year !== undefined ? updateData.year : vehicle.year,
              type: updateData.type ?? vehicle.type,
              status: updateData.status ?? vehicle.status,
              imageKey:
                updateData.imageKey !== undefined
                  ? updateData.imageKey
                  : vehicle.imageKey,
            };
          }),
        };
      });

      // Optimistically update detail view if it's cached
      if (previousDetail) {
        utils.vehicles.getById.setData({ vehicleId }, (old) => {
          if (!old) return old;

          return {
            ...old,
            plateNumber: updateData.plateNumber ?? old.plateNumber,
            make: updateData.make ?? old.make,
            model: updateData.model ?? old.model,
            year: updateData.year !== undefined ? updateData.year : old.year,
            type: updateData.type ?? old.type,
            status: updateData.status ?? old.status,
            imageKey:
              updateData.imageKey !== undefined
                ? updateData.imageKey
                : old.imageKey,
            vin: updateData.vin !== undefined ? updateData.vin : old.vin,
            notes: updateData.notes !== undefined ? updateData.notes : old.notes,
          };
        });
      }

      return { previousList, previousDetail, vehicleId };
    },

    onError: (error, _updatedVehicle, context) => {
      // Rollback to previous state on error
      if (context?.previousList) {
        utils.vehicles.list.setData({ limit: 50 }, context.previousList);
      }
      if (context?.previousDetail && context.vehicleId) {
        utils.vehicles.getById.setData(
          { vehicleId: context.vehicleId },
          context.previousDetail
        );
      }
      toast.error(`Failed to update vehicle: ${error.message}`);
      options?.onError?.(error);
    },

    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      options?.onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure server data consistency
      void utils.vehicles.list.invalidate();
      void utils.vehicles.getById.invalidate({ vehicleId: variables.vehicleId });
      void utils.vehicles.getStatistics.invalidate();
    },
  });
}

// ============================================
// DELETE VEHICLE HOOK
// ============================================

type UseDeleteVehicleOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useDeleteVehicle(options?: UseDeleteVehicleOptions) {
  const utils = api.useUtils();

  return api.vehicles.delete.useMutation({
    onMutate: async ({ vehicleId }) => {
      // Cancel any outgoing refetches
      await utils.vehicles.list.cancel();

      // Snapshot previous value
      const previousVehicles = utils.vehicles.list.getData({ limit: 50 });

      // Optimistically mark as OUT_OF_SERVICE in the list
      utils.vehicles.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;

        return {
          ...old,
          vehicles: old.vehicles.map((vehicle) =>
            vehicle.id === vehicleId
              ? { ...vehicle, status: "OUT_OF_SERVICE" as const }
              : vehicle
          ),
        };
      });

      return { previousVehicles };
    },

    onError: (error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousVehicles) {
        utils.vehicles.list.setData({ limit: 50 }, context.previousVehicles);
      }
      toast.error(`Failed to remove vehicle: ${error.message}`);
      options?.onError?.(error);
    },

    onSuccess: () => {
      toast.success("Vehicle marked as out of service");
      options?.onSuccess?.();
    },

    onSettled: () => {
      void utils.vehicles.list.invalidate();
      void utils.vehicles.getStatistics.invalidate();
    },
  });
}

// ============================================
// ASSIGN DRIVER HOOK
// ============================================

type UseAssignDriverOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useAssignDriver(options?: UseAssignDriverOptions) {
  const utils = api.useUtils();

  return api.vehicles.assignDriver.useMutation({
    onSuccess: () => {
      toast.success("Driver assignment updated");
      options?.onSuccess?.();
    },

    onError: (error) => {
      toast.error(`Failed to assign driver: ${error.message}`);
      options?.onError?.(error);
    },

    onSettled: (_data, _error, variables) => {
      void utils.vehicles.list.invalidate();
      void utils.vehicles.getById.invalidate({ vehicleId: variables.vehicleId });
      void utils.drivers.list.invalidate();
    },
  });
}

// ============================================
// UNASSIGN DRIVER HOOK
// ============================================

type UseUnassignDriverOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useUnassignDriver(options?: UseUnassignDriverOptions) {
  const utils = api.useUtils();

  return api.vehicles.unassignDriver.useMutation({
    onSuccess: () => {
      toast.success("Driver unassigned successfully");
      options?.onSuccess?.();
    },

    onError: (error) => {
      toast.error(`Failed to unassign driver: ${error.message}`);
      options?.onError?.(error);
    },

    onSettled: (_data, _error, variables) => {
      void utils.vehicles.list.invalidate();
      void utils.vehicles.getById.invalidate({ vehicleId: variables.vehicleId });
      void utils.drivers.list.invalidate();
    },
  });
}

// ============================================
// CHANGE STATUS HOOK
// ============================================

type UseChangeStatusOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useChangeStatus(options?: UseChangeStatusOptions) {
  const utils = api.useUtils();

  return api.vehicles.changeStatus.useMutation({
    onMutate: async ({ vehicleId, status }) => {
      // Cancel any outgoing refetches
      await Promise.all([
        utils.vehicles.list.cancel(),
        utils.vehicles.getById.cancel({ vehicleId }),
      ]);

      // Snapshot previous values
      const previousList = utils.vehicles.list.getData({ limit: 50 });
      const previousDetail = utils.vehicles.getById.getData({ vehicleId });

      // Optimistically update the list
      utils.vehicles.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;

        return {
          ...old,
          vehicles: old.vehicles.map((vehicle) =>
            vehicle.id === vehicleId ? { ...vehicle, status } : vehicle
          ),
        };
      });

      // Optimistically update detail view
      if (previousDetail) {
        utils.vehicles.getById.setData({ vehicleId }, (old) =>
          old ? { ...old, status } : old
        );
      }

      return { previousList, previousDetail, vehicleId };
    },

    onError: (error, _variables, context) => {
      // Rollback
      if (context?.previousList) {
        utils.vehicles.list.setData({ limit: 50 }, context.previousList);
      }
      if (context?.previousDetail && context.vehicleId) {
        utils.vehicles.getById.setData(
          { vehicleId: context.vehicleId },
          context.previousDetail
        );
      }
      toast.error(`Failed to change status: ${error.message}`);
      options?.onError?.(error);
    },

    onSuccess: () => {
      toast.success("Vehicle status updated");
      options?.onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      void utils.vehicles.list.invalidate();
      void utils.vehicles.getById.invalidate({ vehicleId: variables.vehicleId });
      void utils.vehicles.getStatistics.invalidate();
    },
  });
}

// ============================================
// WIZARD STEP HOOK (reusable)
// ============================================

type UseWizardStepOptions = {
  totalSteps: number;
  initialStep?: number;
};

export function useWizardStep({
  totalSteps,
  initialStep = 1,
}: UseWizardStepOptions) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = () => {
    setCurrentStep((step) => Math.min(step + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
  };

  const reset = () => {
    setCurrentStep(initialStep);
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    totalSteps,
    progress: (currentStep / totalSteps) * 100,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract only changed fields from form data for partial updates
 */
export function extractDirtyFields<T extends Record<string, unknown>>(
  data: T,
  dirtyFields: Partial<Record<keyof T, boolean | object>>
): Partial<T> {
  const changedData: Partial<T> = {};

  for (const key of Object.keys(dirtyFields) as Array<keyof T>) {
    if (dirtyFields[key]) {
      changedData[key] = data[key];
    }
  }

  return changedData;
}

/**
 * Transform form values to API payload for create
 */
export function transformCreateFormToApi(
  formData: CreateVehicleFormValues
): CreateVehicleInput {
  return {
    plateNumber: formData.plateNumber,
    make: formData.make,
    model: formData.model,
    type: formData.type,
    // Optional fields - convert empty strings and null to undefined
    year: formData.year ?? undefined,
    vin: formData.vin || undefined,
    notes: formData.notes || undefined,
  };
}

/**
 * Transform form values to API payload for update
 */
export function transformUpdateFormToApi(
  formData: Partial<UpdateVehicleFormValues>,
  vehicleId: string
): UpdateVehicleInput {
  const payload: UpdateVehicleInput = { vehicleId };

  // Only include fields that are defined
  for (const [key, value] of Object.entries(formData)) {
    if (key === "vehicleId") continue;

    if (value !== undefined && value !== "") {
      (payload as Record<string, unknown>)[key] = value;
    } else if (value === "") {
      // Convert empty strings to null for nullable fields
      (payload as Record<string, unknown>)[key] = null;
    }
  }

  return payload;
}
