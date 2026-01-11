"use client";

import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";
import {
  X,
  Truck,
  FileText,
  Calendar,
  User,
  Building,
  Pencil,
  Trash2,
  AlertCircle,
  UserMinus,
  Hash,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedSkeleton } from "@/components/animated/animated-card";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { R2VehicleImage } from "./r2-vehicle-image";
import { R2Avatar } from "@/components/shared/r2-avatar";
import {
  getVehicleTypeConfig,
  getVehicleStatusConfig,
  VEHICLE_TYPES,
  VEHICLE_STATUS_OPTIONS,
} from "./forms/vehicle-form.types";
import {
  useDeleteVehicle,
  useUnassignDriver,
} from "./forms/vehicle-form.hooks";

type VehicleDetailPanelProps = {
  vehicleId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onEdit?: () => void;
};

export function VehicleDetailPanel({
  vehicleId,
  open,
  onClose,
  onUpdate,
  onEdit,
}: VehicleDetailPanelProps) {
  // Lock body scroll when panel is open
  useLockBodyScroll(open);

  const {
    data: vehicle,
    isLoading,
    error,
  } = api.vehicles.getById.useQuery(
    { vehicleId: vehicleId! },
    { enabled: open && !!vehicleId }
  );

  const deleteVehicle = useDeleteVehicle({
    onSuccess: () => {
      onUpdate();
      onClose();
    },
  });

  const unassignDriver = useUnassignDriver({
    onSuccess: () => {
      onUpdate();
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to mark this vehicle as out of service?")) {
      if (vehicleId) {
        deleteVehicle.mutate({ vehicleId });
      }
    }
  };

  const handleUnassignDriver = () => {
    if (confirm("Are you sure you want to unassign the driver from this vehicle?")) {
      if (vehicleId) {
        unassignDriver.mutate({ vehicleId });
      }
    }
  };

  // Get configs
  const typeConfig = vehicle
    ? getVehicleTypeConfig(vehicle.type) ?? VEHICLE_TYPES[0]
    : VEHICLE_TYPES[0];
  const statusConfig = vehicle
    ? getVehicleStatusConfig(vehicle.status) ?? VEHICLE_STATUS_OPTIONS[0]
    : VEHICLE_STATUS_OPTIONS[0];

  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  // Driver info
  const hasDriver = !!vehicle?.assignedDriver;
  const driverName = hasDriver
    ? [
        vehicle?.assignedDriver?.user.firstName,
        vehicle?.assignedDriver?.user.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "Unknown"
    : null;
  const driverInitials = hasDriver
    ? [
        vehicle?.assignedDriver?.user.firstName?.[0],
        vehicle?.assignedDriver?.user.lastName?.[0],
      ]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"
    : null;

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
              {/* Header with vehicle image */}
              <div className="relative">
                {/* Vehicle image */}
                <div className="relative h-48">
                  {isLoading ? (
                    <AnimatedSkeleton className="h-full w-full" />
                  ) : (
                    <R2VehicleImage
                      imageKey={vehicle?.imageKey}
                      vehicleType={vehicle?.type ?? "TRUCK"}
                      alt={`${vehicle?.make} ${vehicle?.model}`}
                      size="xl"
                      aspectRatio="wide"
                      className="h-full w-full rounded-none"
                    />
                  )}

                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>

                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
                </div>

                {/* Title section overlapping image */}
                <div className="relative px-6 -mt-12 pb-4">
                  <div className="flex items-end justify-between">
                    <div>
                      {isLoading ? (
                        <>
                          <AnimatedSkeleton className="h-8 w-32 mb-2" />
                          <AnimatedSkeleton className="h-5 w-48" />
                        </>
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold">
                            {vehicle?.plateNumber}
                          </h2>
                          <p className="text-muted-foreground">
                            {vehicle?.make} {vehicle?.model}
                            {vehicle?.year && ` (${vehicle.year})`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status and type badges */}
                  {!isLoading && vehicle && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 flex items-center gap-3"
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                          statusConfig.bgColor,
                          statusConfig.textColor,
                          statusConfig.borderColor
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                          typeConfig.bgColor,
                          typeConfig.textColor,
                          typeConfig.borderColor
                        )}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {typeConfig.label}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                {error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-destructive">{error.message}</p>
                  </div>
                ) : isLoading ? (
                  <LoadingSkeleton />
                ) : vehicle ? (
                  <>
                    {/* Vehicle Information Section */}
                    <Section title="Vehicle Information" icon={Truck}>
                      <InfoGrid>
                        <InfoItem
                          icon={Hash}
                          label="Plate Number"
                          value={vehicle.plateNumber}
                        />
                        {vehicle.vin && (
                          <InfoItem
                            icon={FileText}
                            label="VIN"
                            value={vehicle.vin}
                          />
                        )}
                        <InfoItem
                          icon={Settings}
                          label="Make"
                          value={vehicle.make}
                        />
                        <InfoItem
                          icon={Settings}
                          label="Model"
                          value={vehicle.model}
                        />
                        {vehicle.year && (
                          <InfoItem
                            icon={Calendar}
                            label="Year"
                            value={String(vehicle.year)}
                          />
                        )}
                        <InfoItem
                          icon={Building}
                          label="Organization"
                          value={vehicle.organization.name}
                        />
                      </InfoGrid>
                    </Section>

                    {/* Assigned Driver Section */}
                    <Section title="Assigned Driver" icon={User}>
                      {hasDriver ? (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
                        >
                          <R2Avatar
                            avatarKey={vehicle.assignedDriver?.user.avatarUrl}
                            fallback={driverInitials ?? "?"}
                            alt={driverName ?? "Driver"}
                            className="h-12 w-12"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{driverName}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.assignedDriver?.user.email}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnassignDriver}
                            disabled={unassignDriver.isPending}
                            className="rounded-xl"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            {unassignDriver.isPending ? "..." : "Unassign"}
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted">
                            <User className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-muted-foreground">
                              No driver assigned
                            </p>
                            <p className="text-sm text-muted-foreground/60">
                              This vehicle is available for assignment
                            </p>
                          </div>
                        </div>
                      )}
                    </Section>

                    {/* Notes Section */}
                    {vehicle.notes && (
                      <Section title="Notes" icon={FileText}>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {vehicle.notes}
                        </p>
                      </Section>
                    )}

                    {/* Record Information */}
                    <Section title="Record Information" icon={Calendar}>
                      <InfoGrid>
                        <InfoItem
                          icon={Calendar}
                          label="Created"
                          value={new Date(vehicle.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        />
                        <InfoItem
                          icon={Calendar}
                          label="Last Updated"
                          value={new Date(vehicle.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        />
                      </InfoGrid>
                    </Section>
                  </>
                ) : null}
              </div>

              {/* Footer actions */}
              {!isLoading && vehicle && (
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
                      disabled={deleteVehicle.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteVehicle.isPending ? "..." : "Out of Service"}
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
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-card">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium truncate">{value}</p>
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
