"use client";

import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Truck,
  Pencil,
  Trash2,
  Clock,
  Award,
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  User,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedSkeleton } from "@/components/animated/animated-card";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

type DriverDetailPanelProps = {
  driverId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onEdit?: () => void;
};

export function DriverDetailPanel({
  driverId,
  open,
  onClose,
  onUpdate,
  onEdit,
}: DriverDetailPanelProps) {
  // Lock body scroll when panel is open to prevent duplicate scrollbars
  useLockBodyScroll(open);

  const {
    data: driver,
    isLoading,
    error,
  } = api.drivers.getById.useQuery(
    { driverId: driverId! },
    { enabled: open && !!driverId }
  );

  const deleteDriver = api.drivers.delete.useMutation({
    onSuccess: () => {
      toast.success("Driver deactivated successfully");
      onUpdate();
      onClose();
    },
    onError: (err) => {
      toast.error(`Failed to delete driver: ${err.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to deactivate this driver?")) {
      if (driverId) {
        deleteDriver.mutate({ driverId });
      }
    }
  };

  const fullName = driver
    ? [driver.firstName, driver.lastName].filter(Boolean).join(" ") || "Unknown"
    : "";

  const initials = driver
    ? [driver.firstName?.[0], driver.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-border">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {isLoading ? (
                      <AnimatedSkeleton className="h-14 w-14 rounded-2xl" />
                    ) : driver?.avatarUrl ? (
                      <img
                        src={driver.avatarUrl}
                        alt={fullName}
                        className="h-14 w-14 rounded-2xl object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-lg ring-2 ring-border">
                        {initials}
                      </div>
                    )}

                    <div>
                      {isLoading ? (
                        <>
                          <AnimatedSkeleton className="h-6 w-32 mb-2" />
                          <AnimatedSkeleton className="h-4 w-48" />
                        </>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold">{fullName}</h2>
                          <p className="text-sm text-muted-foreground">
                            {driver?.email}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-xl hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                {/* Status badge */}
                {!isLoading && driver?.driverProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 flex items-center gap-3"
                  >
                    <StatusBadge status={driver.driverProfile.driverStatus} />
                    <AvailabilityBadge available={driver.driverProfile.isAvailable} />
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-destructive">{error.message}</p>
                  </div>
                ) : isLoading ? (
                  <LoadingSkeleton />
                ) : driver ? (
                  <>
                    {/* Contact Section */}
                    <Section title="Contact Information" icon={User}>
                      <InfoGrid>
                        <InfoItem
                          icon={Mail}
                          label="Email"
                          value={driver.email}
                        />
                        <InfoItem
                          icon={Phone}
                          label="Phone"
                          value={driver.phoneNumber ?? "Not provided"}
                        />
                        <InfoItem
                          icon={MapPin}
                          label="Address"
                          value={
                            [driver.address, driver.city, driver.postalCode]
                              .filter(Boolean)
                              .join(", ") || "Not provided"
                          }
                        />
                        <InfoItem
                          icon={Building}
                          label="Country"
                          value={driver.country}
                        />
                      </InfoGrid>
                    </Section>

                    {/* Employment Section */}
                    <Section title="Employment Details" icon={Briefcase}>
                      <InfoGrid>
                        <InfoItem
                          icon={FileText}
                          label="Employee ID"
                          value={driver.employeeId ?? "Not assigned"}
                        />
                        <InfoItem
                          icon={Calendar}
                          label="Hire Date"
                          value={
                            driver.hireDate
                              ? new Date(driver.hireDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not recorded"
                          }
                        />
                        <InfoItem
                          icon={Briefcase}
                          label="Contract Type"
                          value={driver.contractType?.replace("_", " ") ?? "Full Time"}
                        />
                      </InfoGrid>
                    </Section>

                    {/* License Section */}
                    {driver.driverProfile && (
                      <Section title="License Information" icon={Shield}>
                        <InfoGrid>
                          <InfoItem
                            icon={FileText}
                            label="License Number"
                            value={driver.driverProfile.licenseNumber}
                          />
                          <InfoItem
                            icon={MapPin}
                            label="License Country"
                            value={driver.driverProfile.licenseCountry}
                          />
                          <InfoItem
                            icon={Calendar}
                            label="Expiry Date"
                            value={new Date(
                              driver.driverProfile.licenseExpiryDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                            highlight={
                              new Date(driver.driverProfile.licenseExpiryDate) <
                              new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                            }
                          />
                          {driver.driverProfile.yearsExperience !== null && (
                            <InfoItem
                              icon={Award}
                              label="Experience"
                              value={`${driver.driverProfile.yearsExperience} years`}
                            />
                          )}
                        </InfoGrid>

                        {/* License categories */}
                        {driver.driverProfile.licenseCategories.length > 0 && (
                          <div className="mt-4">
                            <span className="text-sm text-muted-foreground mb-2 block">
                              License Categories
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {driver.driverProfile.licenseCategories.map((cat) => (
                                <span
                                  key={cat}
                                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </Section>
                    )}

                    {/* Assigned Vehicle Section */}
                    {driver.driverProfile?.assignedVehicle && (
                      <Section title="Assigned Vehicle" icon={Truck}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
                        >
                          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">
                              {driver.driverProfile.assignedVehicle.make}{" "}
                              {driver.driverProfile.assignedVehicle.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {driver.driverProfile.assignedVehicle.plateNumber}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </Section>
                    )}

                    {/* Performance Scores */}
                    {driver.driverProfile &&
                      (driver.driverProfile.safetyScore !== null ||
                        driver.driverProfile.onTimeDeliveryRate !== null) && (
                        <Section title="Performance" icon={Award}>
                          <div className="grid grid-cols-2 gap-4">
                            {driver.driverProfile.safetyScore !== null && (
                              <ScoreCard
                                label="Safety Score"
                                value={Number(driver.driverProfile.safetyScore)}
                                max={100}
                                color="emerald"
                              />
                            )}
                            {driver.driverProfile.onTimeDeliveryRate !== null && (
                              <ScoreCard
                                label="On-Time Rate"
                                value={Number(driver.driverProfile.onTimeDeliveryRate)}
                                max={100}
                                color="primary"
                              />
                            )}
                          </div>
                        </Section>
                      )}

                    {/* Notes */}
                    {driver.driverProfile?.notes && (
                      <Section title="Notes" icon={FileText}>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {driver.driverProfile.notes}
                        </p>
                      </Section>
                    )}
                  </>
                ) : null}
              </div>

              {/* Footer actions */}
              {!isLoading && driver && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border-t border-border bg-gradient-to-t from-muted/30 to-transparent"
                >
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={onEdit}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={handleDelete}
                      disabled={deleteDriver.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteDriver.isPending ? "Deleting..." : "Deactivate"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="bg-muted/30 rounded-xl p-4">{children}</div>
    </motion.section>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-card">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p
          className={cn(
            "text-sm font-medium truncate",
            highlight && "text-amber-600 dark:text-amber-400"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    AVAILABLE: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    ON_DUTY: {
      bg: "bg-primary/10 border-primary/20",
      text: "text-primary",
    },
    OFF_DUTY: {
      bg: "bg-muted border-border",
      text: "text-muted-foreground",
    },
    ON_REST: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
    },
    SICK_LEAVE: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-600 dark:text-red-400",
    },
    VACATION: {
      bg: "bg-violet-500/10 border-violet-500/20",
      text: "text-violet-600 dark:text-violet-400",
    },
  };

  const config = statusConfig[status] ?? statusConfig.OFF_DUTY;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
        config.bg,
        config.text
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
        available
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-muted border-border text-muted-foreground"
      )}
    >
      {available ? (
        <>
          <CheckCircle className="h-3 w-3" />
          Available
        </>
      ) : (
        <>
          <Clock className="h-3 w-3" />
          Unavailable
        </>
      )}
    </span>
  );
}

function ScoreCard({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "primary" | "emerald";
}) {
  const percentage = (value / max) * 100;

  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "h-full rounded-full",
            color === "emerald" ? "bg-emerald-500" : "bg-primary"
          )}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <AnimatedSkeleton className="h-4 w-32" />
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-start gap-3">
                  <AnimatedSkeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1">
                    <AnimatedSkeleton className="h-3 w-16 mb-1" />
                    <AnimatedSkeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
