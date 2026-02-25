"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
    Building2,
    User,
    Mail,
    Check,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    PremiumDialog,
    PremiumDialogContent,
    PremiumDialogDescription,
    PremiumDialogFooter,
    PremiumDialogHeader,
    PremiumDialogTitle,
} from "@/components/ui/premium-dialog";
import { PremiumButton } from "@/components/ui/premium-button";
import {
    ProgressArc,
    StepIndicator,
} from "@/app/drivers/components/forms/premium/step-indicator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Form schema - match the types exactly
const createOrganizationFormSchema = z.object({
    // Organization fields
    name: z.string().min(1, "Name is required").max(200),
    slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, {
        message: "Slug must be lowercase letters, numbers, and hyphens only",
    }),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().length(2, "Country code must be 2 characters"),
    planType: z.enum(["free", "basic", "premium", "enterprise"]),

    // Admin fields
    adminEmail: z.string().email("Invalid email"),
    adminFirstName: z.string().min(1, "First name is required").max(100),
    adminLastName: z.string().min(1, "Last name is required").max(100),
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationFormSchema>;

const defaultValues: CreateOrganizationFormValues = {
    name: "",
    slug: "",
    email: "",
    phone: "",
    country: "DE",
    planType: "free",
    adminEmail: "",
    adminFirstName: "",
    adminLastName: "",
};

const STEP_1_FIELDS = ["name", "slug", "email", "phone", "country", "planType"] as const;
const STEP_2_FIELDS = ["adminEmail", "adminFirstName", "adminLastName"] as const;

const STEPS = [
    {
        id: 1,
        title: "Organization",
        description: "Basic details",
        icon: Building2,
    },
    {
        id: 2,
        title: "Admin",
        description: "Fleet manager",
        icon: User,
    },
] as const;

const COUNTRIES = [
    { code: "DE", name: "Germany" },
    { code: "AT", name: "Austria" },
    { code: "CH", name: "Switzerland" },
    { code: "NL", name: "Netherlands" },
    { code: "BE", name: "Belgium" },
    { code: "FR", name: "France" },
    { code: "PL", name: "Poland" },
    { code: "CZ", name: "Czech Republic" },
    { code: "IT", name: "Italy" },
    { code: "ES", name: "Spain" },
];

const PLAN_TYPES = [
    { value: "free", label: "Free" },
    { value: "basic", label: "Basic" },
    { value: "premium", label: "Premium" },
    { value: "enterprise", label: "Enterprise" },
];

type CreateOrganizationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function CreateOrganizationDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateOrganizationDialogProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    const form = useForm<CreateOrganizationFormValues>({
        resolver: zodResolver(createOrganizationFormSchema),
        defaultValues,
        mode: "onChange",
    });

    const createOrganization = api.organizations.create.useMutation({
        onSuccess: (result) => {
            const message = result.invitationSent
                ? `Organization "${result.organization.name}" created and invitation sent to ${result.admin.email}`
                : `Organization "${result.organization.name}" created but invitation failed to send`;
            toast.success(message);
            handleClose();
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const validateCurrentStep = async (): Promise<boolean> => {
        if (currentStep === 1) {
            return form.trigger(STEP_1_FIELDS as unknown as (keyof CreateOrganizationFormValues)[]);
        }
        if (currentStep === 2) {
            return form.trigger(STEP_2_FIELDS as unknown as (keyof CreateOrganizationFormValues)[]);
        }
        return true;
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid && currentStep < totalSteps) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = form.handleSubmit((data) => {
        createOrganization.mutate({
            name: data.name,
            slug: data.slug,
            email: data.email || undefined,
            phone: data.phone || undefined,
            country: data.country,
            planType: data.planType,
            adminEmail: data.adminEmail,
            adminFirstName: data.adminFirstName,
            adminLastName: data.adminLastName,
        });
    });

    const handleClose = () => {
        form.reset(defaultValues);
        setCurrentStep(1);
        onOpenChange(false);
    };

    const handleStepClick = (stepId: number) => {
        if (stepId < currentStep) {
            setCurrentStep(stepId);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        form.setValue("name", name);
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        form.setValue("slug", slug);
    };

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <PremiumDialog open={open} onOpenChange={handleClose}>
            <PremiumDialogContent size="lg" className="overflow-hidden flex flex-col">
                <PremiumDialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <PremiumDialogTitle>Create Organization</PremiumDialogTitle>
                                <PremiumDialogDescription>
                                    Set up a new organization with a fleet manager
                                </PremiumDialogDescription>
                            </div>
                        </div>
                        <ProgressArc currentStep={currentStep} totalSteps={totalSteps} />
                    </div>
                </PremiumDialogHeader>

                <div className="px-6 py-4">
                    <StepIndicator
                        steps={STEPS}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                        allowNavigation
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {currentStep === 1 && (
                                <OrganizationStep
                                    form={form}
                                    onNameChange={handleNameChange}
                                />
                            )}
                            {currentStep === 2 && <AdminStep form={form} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <PremiumDialogFooter>
                    <div className="flex items-center justify-between w-full">
                        <PremiumButton
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={isFirstStep}
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

                            {isLastStep ? (
                                <PremiumButton
                                    type="button"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    loading={createOrganization.isPending}
                                    loadingText="Creating..."
                                    icon={
                                        !createOrganization.isPending ? (
                                            <Check className="h-4 w-4" />
                                        ) : undefined
                                    }
                                    className="cursor-pointer"
                                >
                                    Create Organization
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

function OrganizationStep({
    form,
    onNameChange,
}: {
    form: ReturnType<typeof useForm<CreateOrganizationFormValues>>;
    onNameChange: (name: string) => void;
}) {
    const errors = form.formState.errors;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Organization Details
                </h3>
                <p className="text-sm text-muted-foreground">
                    Enter the basic information for the organization.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="name">
                        Organization Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="Acme Logistics"
                        {...form.register("name")}
                        onChange={(e) => onNameChange(e.target.value)}
                        className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                </div>

                <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="slug">
                        Slug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="slug"
                        placeholder="acme-logistics"
                        {...form.register("slug")}
                        className={cn("font-mono", errors.slug && "border-destructive")}
                    />
                    <p className="text-xs text-muted-foreground">
                        URL-friendly identifier (lowercase, hyphens only)
                    </p>
                    {errors.slug && (
                        <p className="text-xs text-destructive">{errors.slug.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="contact@acme.com"
                        {...form.register("email")}
                        className={cn(errors.email && "border-destructive")}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+49 123 456 789"
                        {...form.register("phone")}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                        value={form.watch("country")}
                        onValueChange={(value) => form.setValue("country", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            {COUNTRIES.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                    {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="planType">Plan Type</Label>
                    <Select
                        value={form.watch("planType")}
                        onValueChange={(value: "free" | "basic" | "premium" | "enterprise") =>
                            form.setValue("planType", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                            {PLAN_TYPES.map((plan) => (
                                <SelectItem key={plan.value} value={plan.value}>
                                    {plan.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function AdminStep({
    form,
}: {
    form: ReturnType<typeof useForm<CreateOrganizationFormValues>>;
}) {
    const errors = form.formState.errors;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Fleet Manager
                </h3>
                <p className="text-sm text-muted-foreground">
                    Create the admin user who will manage this organization.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="adminFirstName">
                        First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="adminFirstName"
                        placeholder="John"
                        {...form.register("adminFirstName")}
                        className={cn(errors.adminFirstName && "border-destructive")}
                    />
                    {errors.adminFirstName && (
                        <p className="text-xs text-destructive">
                            {errors.adminFirstName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="adminLastName">
                        Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="adminLastName"
                        placeholder="Doe"
                        {...form.register("adminLastName")}
                        className={cn(errors.adminLastName && "border-destructive")}
                    />
                    {errors.adminLastName && (
                        <p className="text-xs text-destructive">
                            {errors.adminLastName.message}
                        </p>
                    )}
                </div>

                <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="adminEmail">
                        Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="adminEmail"
                            type="email"
                            placeholder="john.doe@acme.com"
                            {...form.register("adminEmail")}
                            className={cn("pl-9", errors.adminEmail && "border-destructive")}
                        />
                    </div>
                    {errors.adminEmail && (
                        <p className="text-xs text-destructive">{errors.adminEmail.message}</p>
                    )}
                </div>

            </div>

            {/* Info box */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> The fleet manager will
                    be created with <strong>PENDING</strong> status. Once they accept the
                    invitation and sign up, their account will be activated automatically.
                </p>
            </div>
        </div>
    );
}
