"use client";

import { motion } from "framer-motion";
import { ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { R2Avatar } from "@/components/shared/r2-avatar";
import { CompactVehicleImage } from "./r2-vehicle-image";
import {
  getVehicleTypeConfig,
  getVehicleStatusConfig,
  VEHICLE_TYPES,
  VEHICLE_STATUS_OPTIONS,
} from "./forms/vehicle-form.types";
import type { VehicleCard as VehicleCardType } from "@/server/api/routers/vehicles/repository/vehicles.repository.types";

type PremiumVehicleCardProps = {
  vehicle: VehicleCardType;
  onClick?: () => void;
  index?: number;
};

export function PremiumVehicleCard({
  vehicle,
  onClick,
  index = 0,
}: PremiumVehicleCardProps) {
  // Get type and status configs
  const typeConfig = getVehicleTypeConfig(vehicle.type) ?? VEHICLE_TYPES[0];
  const statusConfig =
    getVehicleStatusConfig(vehicle.status) ?? VEHICLE_STATUS_OPTIONS[0];

  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  // Driver info
  const hasDriver = !!vehicle.assignedDriver;
  const driverName = hasDriver
    ? [
        vehicle.assignedDriver?.user.firstName,
        vehicle.assignedDriver?.user.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "Unknown"
    : null;
  const driverInitials = hasDriver
    ? [
        vehicle.assignedDriver?.user.firstName?.[0],
        vehicle.assignedDriver?.user.lastName?.[0],
      ]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-2xl",
        "bg-card border border-border/50",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        "transition-all duration-300 ease-out",
        "overflow-hidden"
      )}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Glow effect on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

      {/* Vehicle Image */}
      <div className="relative">
        <CompactVehicleImage
          imageKey={vehicle.imageKey}
          vehicleType={vehicle.type}
          alt={`${vehicle.make} ${vehicle.model}`}
        />

        {/* Status badge overlay on image */}
        <div className="absolute top-3 right-3 z-20">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
              "backdrop-blur-md bg-black/40 border",
              statusConfig.borderColor,
              statusConfig.textColor
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Plate and Make/Model */}
        <div className="mb-3">
          <h3 className="font-bold text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors duration-200">
            {vehicle.plateNumber}
          </h3>
          <p className="text-sm text-muted-foreground">
            {vehicle.make} {vehicle.model}
          </p>
        </div>

        {/* Type badge and year */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border",
              typeConfig.bgColor,
              typeConfig.textColor,
              typeConfig.borderColor
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {typeConfig.label}
          </span>
          {vehicle.year && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {vehicle.year}
            </span>
          )}
        </div>

        {/* Assigned Driver */}
        <div className="flex items-center gap-2.5 mb-3">
          {hasDriver ? (
            <>
              <R2Avatar
                avatarKey={vehicle.assignedDriver?.user.avatarUrl}
                fallback={driverInitials ?? "?"}
                alt={driverName ?? "Driver"}
                className="h-6 w-6 text-xs"
              />
              <span className="text-sm text-foreground truncate">
                {driverName}
              </span>
            </>
          ) : (
            <>
              <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <span className="text-sm text-muted-foreground/60 italic">
                Unassigned
              </span>
            </>
          )}
        </div>

        {/* Footer - Assignment indicator */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full flex-shrink-0 transition-colors duration-200",
                hasDriver
                  ? "bg-primary shadow-sm shadow-primary/50"
                  : "bg-muted-foreground/40"
              )}
            />
            <span className="text-xs text-muted-foreground truncate">
              {hasDriver ? "Driver assigned" : "Available for assignment"}
            </span>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="flex items-center justify-center h-6 w-6 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200"
            whileHover={{ x: 2 }}
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
