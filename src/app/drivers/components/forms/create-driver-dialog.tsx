'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Loader2, User, Shield, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

import { BasicInfoStep } from './steps/basic-info-step';
import { EmploymentStep } from './steps/employment-step';
import { LicenseDetailsStep } from './steps/license-details-step';

import { useCreateDriver, useWizardStep } from './driver-form.hooks';
import {
    createDriverFormSchema,
    basicInfoStepSchema,
    licenseDetailsStepSchema,
    createDriverDefaultValues,
    STEP_1_FIELDS,
    STEP_2_FIELDS,
    type CreateDriverFormValues,
} from './driver-form.types';
import { transformCreateFormToApi } from './driver-form.hooks';

type CreateDriverDialogProps = {
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

export function CreateDriverDialog({ open, onOpenChange }: CreateDriverDialogProps) {
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
            // For step 2, we need to validate the refined schema
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
                // Set errors manually for refinement errors
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

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-0">
                    <DialogTitle>Add New Driver</DialogTitle>
                    <DialogDescription>
                        Complete the following steps to add a new driver to your fleet.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="px-6 py-4 border-b border-border">
                    <StepProgress steps={STEPS} currentStep={wizard.currentStep} />
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={wizard.currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {wizard.currentStep === 1 && <BasicInfoStep form={form} />}
                            {wizard.currentStep === 2 && <LicenseDetailsStep form={form} />}
                            {wizard.currentStep === 3 && <EmploymentStep form={form} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={wizard.isFirstStep}
                        className="rounded-xl"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" onClick={handleClose} className="rounded-xl">
                            Cancel
                        </Button>

                        {wizard.isLastStep ? (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={createDriver.isPending}
                                className="rounded-xl"
                            >
                                {createDriver.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Create Driver
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleNext} className="rounded-xl">
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// STEP PROGRESS COMPONENT
// ============================================

type StepProgressProps = {
    steps: typeof STEPS;
    currentStep: number;
};

function StepProgress({ steps, currentStep }: StepProgressProps) {
    return (
        <div className="flex items-center justify-between">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isUpcoming = currentStep < step.id;

                return (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isCompleted
                                        ? 'hsl(var(--primary))'
                                        : isCurrent
                                        ? 'hsl(var(--primary))'
                                        : 'hsl(var(--muted))',
                                }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    'flex items-center justify-center h-10 w-10 rounded-xl transition-colors',
                                    isCurrent && 'ring-4 ring-primary/20'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5 text-primary-foreground" />
                                ) : (
                                    <Icon
                                        className={cn(
                                            'h-5 w-5',
                                            isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                                        )}
                                    />
                                )}
                            </motion.div>

                            <div className="hidden sm:block">
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        isUpcoming ? 'text-muted-foreground' : 'text-foreground'
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                                <div
                                    className={cn(
                                        'h-0.5 rounded-full transition-colors',
                                        currentStep > step.id ? 'bg-primary' : 'bg-muted'
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
