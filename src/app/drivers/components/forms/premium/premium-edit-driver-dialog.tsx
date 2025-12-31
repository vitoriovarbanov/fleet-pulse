"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Briefcase, Activity, Save, Loader2, Edit3 } from "lucide-react";
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
import { PremiumBasicInfoSection } from "./sections/premium-basic-info-section";
import { PremiumLicenseSection } from "./sections/premium-license-section";
import { PremiumEmploymentSection } from "./sections/premium-employment-section";
import { PremiumStatusSection } from "./sections/premium-status-section";

import { useUpdateDriver, extractDirtyFields } from "../driver-form.hooks";
import {
  updateDriverFormSchema,
  getUpdateDriverDefaultValues,
  type UpdateDriverFormValues,
} from "../driver-form.types";

type PremiumEditDriverDialogProps = {
  driverId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TABS = [
  { id: "basic", label: "Basic Info", icon: <User className="h-4 w-4" /> },
  { id: "license", label: "License", icon: <Shield className="h-4 w-4" /> },
  { id: "employment", label: "Employment", icon: <Briefcase className="h-4 w-4" /> },
  { id: "status", label: "Status", icon: <Activity className="h-4 w-4" /> },
];

export function PremiumEditDriverDialog({
  driverId,
  open,
  onOpenChange,
}: PremiumEditDriverDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch driver data
  const { data: driver, isLoading } = api.drivers.getById.useQuery(
    { driverId: driverId! },
    { enabled: open && !!driverId }
  );

  const form = useForm<UpdateDriverFormValues>({
    resolver: zodResolver(updateDriverFormSchema),
    defaultValues: getUpdateDriverDefaultValues(driverId ?? ""),
    mode: "onChange",
  });

  // Populate form when driver data loads
  useEffect(() => {
    if (driver && driverId) {
      form.reset({
        driverId,
        firstName: driver.firstName ?? "",
        lastName: driver.lastName ?? "",
        phoneNumber: driver.phoneNumber ?? "",
        employeeId: driver.employeeId ?? "",
        hireDate: driver.hireDate ? new Date(driver.hireDate) : null,
        address: driver.address ?? "",
        city: driver.city ?? "",
        postalCode: driver.postalCode ?? "",
        country: driver.country ?? "DE",
        contractType: driver.contractType ?? "",
        avatarUrl: driver.avatarUrl,
        licenseNumber: driver.driverProfile?.licenseNumber ?? "",
        licenseCountry: driver.driverProfile?.licenseCountry ?? "DE",
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
        adrCertNumber: driver.driverProfile?.adrCertNumber ?? "",
        adrExpiryDate: driver.driverProfile?.adrExpiryDate
          ? new Date(driver.driverProfile.adrExpiryDate)
          : null,
        notes: driver.driverProfile?.notes ?? "",
        driverStatus: driver.driverProfile?.driverStatus,
        isAvailable: driver.driverProfile?.isAvailable,
        safetyScore: driver.driverProfile?.safetyScore
          ? Number(driver.driverProfile.safetyScore)
          : null,
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

    const dirtyFields = form.formState.dirtyFields;
    const changedData = extractDirtyFields(data, dirtyFields);

    const payload: UpdateDriverFormValues = {
      driverId,
      ...changedData,
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    ) as UpdateDriverFormValues;

    updateDriver.mutate(cleanedPayload);
  });

  const handleClose = () => {
    form.reset();
    setActiveTab("basic");
    onOpenChange(false);
  };

  const fullName = driver
    ? `${driver.firstName ?? ""} ${driver.lastName ?? ""}`.trim() || "Unknown"
    : "Loading...";

  return (
    <PremiumDialog open={open} onOpenChange={handleClose}>
      <PremiumDialogContent size="lg" className="overflow-hidden flex flex-col">
        {/* Header */}
        <PremiumDialogHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-xl",
                "bg-gradient-to-br from-secondary to-secondary/80",
                "shadow-lg shadow-secondary/20"
              )}
            >
              <Edit3 className="h-5 w-5 text-secondary-foreground" />
            </motion.div>
            <div>
              <PremiumDialogTitle>Edit Driver</PremiumDialogTitle>
              <PremiumDialogDescription>
                Update information for {fullName}
              </PremiumDialogDescription>
            </div>
          </div>
        </PremiumDialogHeader>

        <div className="px-6 py-2">
          <PremiumTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {isLoading ? (
            <LoadingSkeleton />
          ) : driver ? (
            <form id="edit-driver-form" onSubmit={handleSubmit}>
              <TabPanel isActive={activeTab === "basic"}>
                <PremiumBasicInfoSection form={form} email={driver.email} />
              </TabPanel>
              <TabPanel isActive={activeTab === "license"}>
                <PremiumLicenseSection form={form} />
              </TabPanel>
              <TabPanel isActive={activeTab === "employment"}>
                <PremiumEmploymentSection form={form} />
              </TabPanel>
              <TabPanel isActive={activeTab === "status"}>
                <PremiumStatusSection form={form} />
              </TabPanel>
            </form>
          ) : null}
        </div>

        {/* Footer */}
        {!isLoading && driver && (
          <PremiumDialogFooter>
            <div className="flex items-center justify-between w-full">
              {/* Change indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {form.formState.isDirty && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Unsaved changes</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <PremiumButton
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  type="submit"
                  form="edit-driver-form"
                  variant="primary"
                  loading={updateDriver.isPending}
                  loadingText="Saving..."
                  disabled={!form.formState.isDirty}
                  icon={!updateDriver.isPending ? <Save className="h-4 w-4" /> : undefined}
                >
                  Save Changes
                </PremiumButton>
              </div>
            </div>
          </PremiumDialogFooter>
        )}
      </PremiumDialogContent>
    </PremiumDialog>
  );
}

// Loading skeleton with premium styling
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
