"use client";

import {
  PremiumDialog,
  PremiumDialogContent,
  PremiumDialogDescription,
  PremiumDialogFooter,
  PremiumDialogHeader,
  PremiumDialogTitle,
} from "@/components/ui/premium-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  FileText,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { PremiumButton } from "@/components/ui/premium-button";
import {
  ProgressArc,
  StepIndicator,
} from "@/app/drivers/components/forms/premium/step-indicator";
import { PremiumBasicInfoStep } from "./steps/premium-basic-info-step";
import { PremiumDetailsStep } from "./steps/premium-details-step";

import {
  transformCreateFormToApi,
  useCreateVehicle,
  useWizardStep,
} from "../vehicle-form.hooks";
import {
  createVehicleDefaultValues,
  createVehicleFormSchema,
  STEP_1_FIELDS,
  type CreateVehicleFormValues,
} from "../vehicle-form.types";

type PremiumCreateVehicleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    description: "Vehicle details",
    icon: Truck,
  },
  {
    id: 2,
    title: "Details",
    description: "VIN & Image",
    icon: FileText,
  },
] as const;

export function PremiumCreateVehicleDialog({
  open,
  onOpenChange,
}: PremiumCreateVehicleDialogProps) {
  const wizard = useWizardStep({ totalSteps: 2 });

  const form = useForm<CreateVehicleFormValues>({
    resolver: zodResolver(createVehicleFormSchema),
    defaultValues: createVehicleDefaultValues,
    mode: "onChange",
  });

  const createVehicle = useCreateVehicle({
    onSuccess: () => {
      handleClose();
    },
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    if (wizard.currentStep === 1) {
      return form.trigger(STEP_1_FIELDS);
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      wizard.nextStep();
    }
  };

  const handleBack = () => {
    wizard.prevStep();
  };

  const handleSubmit = form.handleSubmit((data) => {
    const apiData = transformCreateFormToApi(data);
    createVehicle.mutate(apiData);
  });

  const handleClose = () => {
    form.reset(createVehicleDefaultValues);
    wizard.reset();
    onOpenChange(false);
  };

  // Step navigation (allow going back to completed steps)
  const handleStepClick = (stepId: number) => {
    if (stepId < wizard.currentStep) {
      wizard.goToStep(stepId);
    }
  };

  return (
    <PremiumDialog open={open} onOpenChange={handleClose}>
      <PremiumDialogContent size="lg" className="overflow-hidden flex flex-col">
        <PremiumDialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <PremiumDialogTitle>Add New Vehicle</PremiumDialogTitle>
                <PremiumDialogDescription>
                  Complete the following steps to add a vehicle to your fleet
                </PremiumDialogDescription>
              </div>
            </div>
            <ProgressArc
              currentStep={wizard.currentStep}
              totalSteps={wizard.totalSteps}
            />
          </div>
        </PremiumDialogHeader>

        <div className="px-6 py-4">
          <StepIndicator
            steps={STEPS}
            currentStep={wizard.currentStep}
            onStepClick={handleStepClick}
            allowNavigation
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={wizard.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {wizard.currentStep === 1 && (
                <PremiumBasicInfoStep form={form} />
              )}
              {wizard.currentStep === 2 && <PremiumDetailsStep form={form} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <PremiumDialogFooter>
          <div className="flex items-center justify-between w-full">
            <PremiumButton
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={wizard.isFirstStep}
              icon={<ChevronLeft className="h-4 w-4" />}
              className="cursor-pointer"
            >
              Back
            </PremiumButton>

            <div className="flex items-center gap-3">
              <PremiumButton
                type="button"
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Cancel
              </PremiumButton>

              {wizard.isLastStep ? (
                <PremiumButton
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  loading={createVehicle.isPending}
                  loadingText="Creating..."
                  icon={
                    !createVehicle.isPending ? (
                      <Check className="h-4 w-4" />
                    ) : undefined
                  }
                  className="cursor-pointer"
                >
                  Create Vehicle
                </PremiumButton>
              ) : (
                <PremiumButton
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  icon={<ChevronRight className="h-4 w-4" />}
                  iconPosition="right"
                  className="cursor-pointer"
                >
                  Continue
                </PremiumButton>
              )}
            </div>
          </div>
        </PremiumDialogFooter>
      </PremiumDialogContent>
    </PremiumDialog>
  );
}
