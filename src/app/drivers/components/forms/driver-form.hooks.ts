"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { CreateDriverInput, UpdateDriverInput } from "@/server/api/routers/drivers/drivers.types";
import type { CreateDriverFormValues, UpdateDriverFormValues } from "./driver-form.types";

type UseCreateDriverOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useCreateDriver(options?: UseCreateDriverOptions) {
  const utils = api.useUtils();

  return api.drivers.create.useMutation({
    onMutate: async (newDriver) => {
      // Cancel any outgoing refetches to prevent race conditions
      await utils.drivers.list.cancel();

      // Snapshot the previous value for rollback
      const previousDrivers = utils.drivers.list.getData({ limit: 50 });

      // Optimistically add driver to the list
      utils.drivers.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;

        // Ensure licenseExpiryDate is a proper Date object
        const rawExpiryDate = newDriver.licenseExpiryDate as Date | string | number;
        const expiryDate = rawExpiryDate instanceof Date
          ? rawExpiryDate
          : new Date(rawExpiryDate);

        const optimisticDriver: (typeof old.drivers)[number] = {
          id: `temp-${Date.now()}`,
          firstName: newDriver.firstName,
          lastName: newDriver.lastName,
          email: newDriver.email,
          avatarUrl: null,
          phoneNumber: newDriver.phoneNumber ?? null,
          status: "ACTIVE",
          driverProfile: {
            id: `temp-profile-${Date.now()}`,
            driverStatus: "AVAILABLE",
            isAvailable: true,
            licenseCategories: newDriver.licenseCategories,
            licenseExpiryDate: expiryDate,
            assignedVehicleId: null,
            assignedVehicle: null,
          },
        };

        return {
          ...old,
          drivers: [optimisticDriver, ...old.drivers],
        };
      });

      return { previousDrivers };
    },

    onError: (error, _newDriver, context) => {
      // Rollback to previous state on error
      if (context?.previousDrivers) {
        utils.drivers.list.setData({ limit: 50 }, context.previousDrivers);
      }
      toast.error(`Failed to create driver: ${error.message}`);
      options?.onError?.(error);
    },

    onSuccess: () => {
      toast.success("Driver created successfully");
      options?.onSuccess?.();
    },

    onSettled: () => {
      // Always refetch to ensure server data consistency
      void utils.drivers.list.invalidate();
    },
  });
}

type UseUpdateDriverOptions = {
  onSuccess?: () => void;
  onError?: (error: { message: string }) => void;
};

export function useUpdateDriver(options?: UseUpdateDriverOptions) {
  const utils = api.useUtils();

  return api.drivers.update.useMutation({
    onMutate: async (updatedDriver) => {
      const { driverId, ...updateData } = updatedDriver;

      // Cancel any outgoing refetches
      await Promise.all([
        utils.drivers.list.cancel(),
        utils.drivers.getById.cancel({ driverId }),
      ]);

      // Snapshot previous values for rollback
      const previousList = utils.drivers.list.getData({ limit: 50 });
      const previousDetail = utils.drivers.getById.getData({ driverId });

      // Optimistically update the list
      utils.drivers.list.setData({ limit: 50 }, (old) => {
        if (!old) return old;

        return {
          ...old,
          drivers: old.drivers.map((driver) => {
            if (driver.id !== driverId) return driver;

            // Helper to ensure dates are Date objects
            const toDate = (value: unknown): Date => {
              if (value instanceof Date) return value;
              return new Date(value as string | number);
            };

            const newExpiryDate = updateData.licenseExpiryDate
              ? toDate(updateData.licenseExpiryDate)
              : driver.driverProfile?.licenseExpiryDate;

            return {
              ...driver,
              firstName: updateData.firstName ?? driver.firstName,
              lastName: updateData.lastName ?? driver.lastName,
              phoneNumber: updateData.phoneNumber ?? driver.phoneNumber,
              driverProfile: driver.driverProfile
                ? {
                    ...driver.driverProfile,
                    driverStatus:
                      updateData.driverStatus ?? driver.driverProfile.driverStatus,
                    isAvailable:
                      updateData.isAvailable ?? driver.driverProfile.isAvailable,
                    licenseCategories:
                      updateData.licenseCategories ??
                      driver.driverProfile.licenseCategories,
                    licenseExpiryDate: newExpiryDate ?? driver.driverProfile.licenseExpiryDate,
                  }
                : driver.driverProfile,
            };
          }),
        };
      });

      // Optimistically update detail view if it's cached
      if (previousDetail) {
        utils.drivers.getById.setData({ driverId }, (old) => {
          if (!old) return old;

          // Helper to ensure dates are Date objects
          const toDate = (value: unknown): Date | undefined => {
            if (value === undefined || value === null) return undefined;
            if (value instanceof Date) return value;
            return new Date(value as string | number);
          };

          return {
            ...old,
            firstName: (updateData.firstName as string | undefined) ?? old.firstName,
            lastName: (updateData.lastName as string | undefined) ?? old.lastName,
            phoneNumber: (updateData.phoneNumber as string | null | undefined) ?? old.phoneNumber,
            employeeId: (updateData.employeeId as string | null | undefined) ?? old.employeeId,
            address: (updateData.address as string | null | undefined) ?? old.address,
            city: (updateData.city as string | null | undefined) ?? old.city,
            postalCode: (updateData.postalCode as string | null | undefined) ?? old.postalCode,
            country: (updateData.country as string | undefined) ?? old.country,
            contractType: (updateData.contractType as string | null | undefined) ?? old.contractType,
            hireDate: toDate(updateData.hireDate) ?? old.hireDate,
            avatarUrl: (updateData.avatarUrl as string | null | undefined) ?? old.avatarUrl,
            driverProfile: old.driverProfile
              ? {
                  ...old.driverProfile,
                  licenseNumber:
                    (updateData.licenseNumber as string | undefined) ?? old.driverProfile.licenseNumber,
                  licenseCountry:
                    (updateData.licenseCountry as string | undefined) ?? old.driverProfile.licenseCountry,
                  licenseIssueDate:
                    toDate(updateData.licenseIssueDate) ?? old.driverProfile.licenseIssueDate,
                  licenseExpiryDate:
                    toDate(updateData.licenseExpiryDate) ?? old.driverProfile.licenseExpiryDate,
                  licenseCategories:
                    updateData.licenseCategories ??
                    old.driverProfile.licenseCategories,
                  medicalCertIssueDate:
                    toDate(updateData.medicalCertIssueDate) ?? old.driverProfile.medicalCertIssueDate,
                  medicalCertExpiryDate:
                    toDate(updateData.medicalCertExpiryDate) ?? old.driverProfile.medicalCertExpiryDate,
                  yearsExperience:
                    (updateData.yearsExperience as number | null | undefined) ?? old.driverProfile.yearsExperience,
                  adrCertNumber:
                    (updateData.adrCertNumber as string | null | undefined) ?? old.driverProfile.adrCertNumber,
                  adrExpiryDate:
                    toDate(updateData.adrExpiryDate) ?? old.driverProfile.adrExpiryDate,
                  notes: (updateData.notes as string | null | undefined) ?? old.driverProfile.notes,
                  driverStatus:
                    updateData.driverStatus ?? old.driverProfile.driverStatus,
                  isAvailable:
                    (updateData.isAvailable as boolean | undefined) ?? old.driverProfile.isAvailable,
                  // safetyScore and onTimeDeliveryRate are Decimal types, keep original values
                  // as they can only be updated via server response
                }
              : old.driverProfile,
          };
        });
      }

      return { previousList, previousDetail, driverId };
    },

    onError: (error, _updatedDriver, context) => {
      // Rollback to previous state on error
      if (context?.previousList) {
        utils.drivers.list.setData({ limit: 50 }, context.previousList);
      }
      if (context?.previousDetail && context.driverId) {
        utils.drivers.getById.setData(
          { driverId: context.driverId },
          context.previousDetail
        );
      }
      toast.error(`Failed to update driver: ${error.message}`);
      options?.onError?.(error);
    },

    onSuccess: () => {
      toast.success("Driver updated successfully");
      options?.onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure server data consistency
      void utils.drivers.list.invalidate();
      void utils.drivers.getById.invalidate({ driverId: variables.driverId });
    },
  });
}

type UseWizardStepOptions = {
  totalSteps: number;
  initialStep?: number;
};

export function useWizardStep({ totalSteps, initialStep = 1 }: UseWizardStepOptions) {
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
  formData: CreateDriverFormValues
): CreateDriverInput {
  return {
    // Required fields
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    licenseNumber: formData.licenseNumber,
    licenseCountry: formData.licenseCountry ?? "DE",
    licenseIssueDate: formData.licenseIssueDate,
    licenseExpiryDate: formData.licenseExpiryDate,
    licenseCategories: formData.licenseCategories,
    country: formData.country ?? "DE",
    sendInvitation: formData.sendInvitation ?? true,
    // Optional fields - convert empty strings and null to undefined
    phoneNumber: formData.phoneNumber || undefined,
    employeeId: formData.employeeId || undefined,
    address: formData.address || undefined,
    city: formData.city || undefined,
    postalCode: formData.postalCode || undefined,
    contractType: formData.contractType || undefined,
    notes: formData.notes || undefined,
    adrCertNumber: formData.adrCertNumber || undefined,
    // Convert null dates to undefined
    medicalCertIssueDate: formData.medicalCertIssueDate ?? undefined,
    medicalCertExpiryDate: formData.medicalCertExpiryDate ?? undefined,
    adrExpiryDate: formData.adrExpiryDate ?? undefined,
    hireDate: formData.hireDate ?? undefined,
    yearsExperience: formData.yearsExperience ?? undefined,
  };
}

/**
 * Transform form values to API payload for update
 */
export function transformUpdateFormToApi(
  formData: Partial<UpdateDriverFormValues>,
  driverId: string
): UpdateDriverInput {
  const payload: UpdateDriverInput = { driverId };

  // Only include fields that are defined and not empty strings
  for (const [key, value] of Object.entries(formData)) {
    if (key === "driverId") continue;

    if (value !== undefined && value !== "") {
      (payload as Record<string, unknown>)[key] = value;
    } else if (value === "") {
      // Convert empty strings to null for nullable fields
      (payload as Record<string, unknown>)[key] = null;
    }
  }

  return payload;
}
