'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save, User, Shield, Briefcase, Activity } from 'lucide-react';
import { api } from '@/trpc/react';
import { AnimatedSkeleton } from '@/components/animated/animated-card';

import { CollapsibleSection } from './sections/collapsible-section';
import { BasicInfoSection } from './sections/basic-info-section';
import { LicenseSection } from './sections/license-section';
import { EmploymentSection } from './sections/employment-section';
import { StatusSection } from './sections/status-section';
import { useUpdateDriver, extractDirtyFields } from './driver-form.hooks';
import { updateDriverFormSchema, getUpdateDriverDefaultValues, type UpdateDriverFormValues } from './driver-form.types';

type EditDriverDialogProps = {
    driverId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function EditDriverDialog({ driverId, open, onOpenChange }: EditDriverDialogProps) {
    // Fetch driver data
    const { data: driver, isLoading } = api.drivers.getById.useQuery(
        { driverId: driverId! },
        { enabled: open && !!driverId }
    );

    const form = useForm<UpdateDriverFormValues>({
        resolver: zodResolver(updateDriverFormSchema),
        defaultValues: getUpdateDriverDefaultValues(driverId ?? ''),
        mode: 'onChange',
    });

    // Populate form when driver data loads
    useEffect(() => {
        if (driver && driverId) {
            form.reset({
                driverId,
                firstName: driver.firstName ?? '',
                lastName: driver.lastName ?? '',
                phoneNumber: driver.phoneNumber ?? '',
                employeeId: driver.employeeId ?? '',
                hireDate: driver.hireDate ? new Date(driver.hireDate) : null,
                address: driver.address ?? '',
                city: driver.city ?? '',
                postalCode: driver.postalCode ?? '',
                country: driver.country ?? 'DE',
                contractType: driver.contractType ?? '',
                avatarUrl: driver.avatarUrl,
                // Driver profile fields
                licenseNumber: driver.driverProfile?.licenseNumber ?? '',
                licenseCountry: driver.driverProfile?.licenseCountry ?? 'DE',
                licenseIssueDate: driver.driverProfile?.licenseIssueDate
                    ? new Date(driver.driverProfile.licenseIssueDate)
                    : undefined,
                licenseExpiryDate: driver.driverProfile?.licenseExpiryDate
                    ? new Date(driver.driverProfile.licenseExpiryDate)
                    : undefined,
                licenseCategories: driver.driverProfile?.licenseCategories ?? [],
                medicalCertIssueDate: driver.driverProfile?.medicalCertIssueDate
                    ? new Date(driver.driverProfile.medicalCertIssueDate)
                    : null,
                medicalCertExpiryDate: driver.driverProfile?.medicalCertExpiryDate
                    ? new Date(driver.driverProfile.medicalCertExpiryDate)
                    : null,
                yearsExperience: driver.driverProfile?.yearsExperience ?? null,
                adrCertNumber: driver.driverProfile?.adrCertNumber ?? '',
                adrExpiryDate: driver.driverProfile?.adrExpiryDate
                    ? new Date(driver.driverProfile.adrExpiryDate)
                    : null,
                notes: driver.driverProfile?.notes ?? '',
                driverStatus: driver.driverProfile?.driverStatus,
                isAvailable: driver.driverProfile?.isAvailable,
                safetyScore: driver.driverProfile?.safetyScore ? Number(driver.driverProfile.safetyScore) : null,
                onTimeDeliveryRate: driver.driverProfile?.onTimeDeliveryRate
                    ? Number(driver.driverProfile.onTimeDeliveryRate)
                    : null,
            });
        }
    }, [driver, driverId, form]);

    const updateDriver = useUpdateDriver({
        onSuccess: () => {
            handleClose();
        },
    });

    const handleSubmit = form.handleSubmit((data) => {
        if (!driverId) return;

        // Only send changed fields to reduce payload
        const dirtyFields = form.formState.dirtyFields;
        const changedData = extractDirtyFields(data, dirtyFields);

        // Always include driverId
        const payload: UpdateDriverFormValues = {
            driverId,
            ...changedData,
        };

        // Clean up empty strings to null for nullable fields
        const cleanedPayload = Object.fromEntries(
            Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value])
        ) as UpdateDriverFormValues;

        updateDriver.mutate(cleanedPayload);
    });

    const handleClose = () => {
        form.reset();
        onOpenChange(false);
    };

    const fullName = driver ? `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() || 'Unknown' : 'Loading...';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-0">
                    <DialogTitle>Edit Driver</DialogTitle>
                    <DialogDescription>Update information for {fullName}</DialogDescription>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : driver ? (
                        <form id="edit-driver-form" onSubmit={handleSubmit} className="space-y-4">
                            <CollapsibleSection title="Basic Information" icon={User} defaultOpen>
                                <BasicInfoSection form={form} email={driver.email} />
                            </CollapsibleSection>

                            <CollapsibleSection title="License Details" icon={Shield} defaultOpen>
                                <LicenseSection form={form} />
                            </CollapsibleSection>

                            <CollapsibleSection title="Employment" icon={Briefcase}>
                                <EmploymentSection form={form} />
                            </CollapsibleSection>

                            <CollapsibleSection title="Status & Performance" icon={Activity}>
                                <StatusSection form={form} />
                            </CollapsibleSection>
                        </form>
                    ) : null}
                </div>

                {/* Footer Actions */}
                {!isLoading && driver && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
                        <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="edit-driver-form"
                            disabled={updateDriver.isPending || !form.formState.isDirty}
                            className="rounded-xl"
                        >
                            {updateDriver.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// LOADING SKELETON
// ============================================

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <AnimatedSkeleton className="h-8 w-8 rounded-lg" />
                        <AnimatedSkeleton className="h-5 w-32" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="space-y-2">
                                <AnimatedSkeleton className="h-4 w-20" />
                                <AnimatedSkeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
