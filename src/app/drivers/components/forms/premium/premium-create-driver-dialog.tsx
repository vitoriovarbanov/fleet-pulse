'use client';

import {
    PremiumDialog,
    PremiumDialogContent,
    PremiumDialogDescription,
    PremiumDialogFooter,
    PremiumDialogHeader,
    PremiumDialogTitle,
} from '@/components/ui/premium-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, Check, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PremiumButton } from '@/components/ui/premium-button';
import { ProgressArc, StepIndicator } from './step-indicator';
import { PremiumBasicInfoStep } from './steps/premium-basic-info-step';
import { PremiumEmploymentStep } from './steps/premium-employment-step';
import { PremiumLicenseStep } from './steps/premium-license-step';

import { transformCreateFormToApi, useCreateDriver, useWizardStep } from '../driver-form.hooks';
import {
    createDriverDefaultValues,
    createDriverFormSchema,
    licenseDetailsStepSchema,
    STEP_1_FIELDS,
    STEP_2_FIELDS,
    type CreateDriverFormValues,
} from '../driver-form.types';

type PremiumCreateDriverDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const STEPS = [
    {
        id: 1,
        title: 'Basic Info',
        description: 'Personal details',
        icon: User,
    },
    {
        id: 2,
        title: 'License',
        description: 'Driving credentials',
        icon: Shield,
    },
    {
        id: 3,
        title: 'Employment',
        description: 'Work details',
        icon: Briefcase,
    },
] as const;

export function PremiumCreateDriverDialog({ open, onOpenChange }: PremiumCreateDriverDialogProps) {
    const wizard = useWizardStep({ totalSteps: 3 });

    const form = useForm<CreateDriverFormValues>({
        resolver: zodResolver(createDriverFormSchema),
        defaultValues: createDriverDefaultValues,
        mode: 'onChange',
    });

    const createDriver = useCreateDriver({
        onSuccess: () => {
            handleClose();
        },
    });

    const validateCurrentStep = async (): Promise<boolean> => {
        if (wizard.currentStep === 1) {
            return form.trigger(STEP_1_FIELDS);
        }
        if (wizard.currentStep === 2) {
            const values = form.getValues();
            const result = licenseDetailsStepSchema.safeParse({
                licenseNumber: values.licenseNumber,
                licenseCountry: values.licenseCountry,
                licenseIssueDate: values.licenseIssueDate,
                licenseExpiryDate: values.licenseExpiryDate,
                licenseCategories: values.licenseCategories,
                medicalCertIssueDate: values.medicalCertIssueDate,
                medicalCertExpiryDate: values.medicalCertExpiryDate,
                yearsExperience: values.yearsExperience,
                adrCertNumber: values.adrCertNumber,
                adrExpiryDate: values.adrExpiryDate,
            });

            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    const path = issue.path.join('.') as keyof CreateDriverFormValues;
                    form.setError(path, { message: issue.message });
                });
                return false;
            }

            return form.trigger(STEP_2_FIELDS);
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
        createDriver.mutate(apiData);
    });

    const handleClose = () => {
        form.reset(createDriverDefaultValues);
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
                                <PremiumDialogTitle>Add New Driver</PremiumDialogTitle>
                                <PremiumDialogDescription>
                                    Complete the following steps to add a driver to your fleet
                                </PremiumDialogDescription>
                            </div>
                        </div>
                        <ProgressArc currentStep={wizard.currentStep} totalSteps={wizard.totalSteps} />
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
                            {wizard.currentStep === 1 && <PremiumBasicInfoStep form={form} />}
                            {wizard.currentStep === 2 && <PremiumLicenseStep form={form} />}
                            {wizard.currentStep === 3 && <PremiumEmploymentStep form={form} />}
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
                                    loading={createDriver.isPending}
                                    loadingText="Creating..."
                                    icon={!createDriver.isPending ? <Check className="h-4 w-4" /> : undefined}
                                    className="cursor-pointer"
                                >
                                    Create Driver
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
