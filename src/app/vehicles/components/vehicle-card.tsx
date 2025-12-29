"use client";

import { Truck, User, Wrench, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/animated/animated-card";
import type { VehicleCard as VehicleCardType } from "@/server/api/routers/vehicles/repository/vehicles.repository.types";

type VehicleCardProps = {
  vehicle: VehicleCardType;
  onClick?: () => void;
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  MAINTENANCE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  OUT_OF_SERVICE:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const typeLabels: Record<string, string> = {
  TRUCK: "Truck",
  TRAILER: "Trailer",
  VAN: "Van",
  BUS: "Bus",
};

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const driverName = vehicle.assignedDriver?.user
    ? [
        vehicle.assignedDriver.user.firstName,
        vehicle.assignedDriver.user.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <AnimatedCard
      className="flex flex-col gap-4 hover:shadow-md transition-shadow"
      onClick={onClick}
      enableHover
    >
      {/* Header with plate and status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{vehicle.plateNumber}</h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusColors[vehicle.status] ?? statusColors.ACTIVE
          )}
        >
          {vehicle.status === "MAINTENANCE" && (
            <Wrench className="h-3 w-3 mr-1" />
          )}
          {vehicle.status === "OUT_OF_SERVICE" && (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {vehicle.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Details */}
      <div className="grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
            {typeLabels[vehicle.type] ?? vehicle.type}
          </span>
          {vehicle.year && <span className="text-xs">{vehicle.year}</span>}
        </div>

        {driverName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{driverName}</span>
          </div>
        )}
      </div>

      {/* Assignment indicator */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            vehicle.assignedDriver ? "bg-blue-500" : "bg-gray-400"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {vehicle.assignedDriver ? "Assigned" : "Unassigned"}
        </span>
      </div>
    </AnimatedCard>
  );
}
