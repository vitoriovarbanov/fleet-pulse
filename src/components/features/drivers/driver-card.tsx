"use client";

import { Phone, Truck, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/animated/animated-card";
import type { DriverCard as DriverCardType } from "@/server/api/routers/drivers/repository/drivers.repository.types";

type DriverCardProps = {
  driver: DriverCardType;
  onClick?: () => void;
};

const statusColors: Record<string, string> = {
  AVAILABLE:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ON_DUTY: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  OFF_DUTY: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  ON_REST:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  SICK_LEAVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  VACATION:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export function DriverCard({ driver, onClick }: DriverCardProps) {
  const profile = driver.driverProfile;
  const fullName =
    [driver.firstName, driver.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials =
    [driver.firstName?.[0], driver.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <AnimatedCard
      className="flex flex-col gap-4 hover:shadow-md transition-shadow"
      onClick={onClick}
      enableHover
    >
      {/* Header with avatar and status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {driver.avatarUrl ? (
            <img
              src={driver.avatarUrl}
              alt={fullName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {initials}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-base">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{driver.email}</p>
          </div>
        </div>

        {profile && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusColors[profile.driverStatus] ?? statusColors.OFF_DUTY
            )}
          >
            {profile.driverStatus.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Contact and details */}
      <div className="grid gap-2 text-sm">
        {driver.phoneNumber && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{driver.phoneNumber}</span>
          </div>
        )}

        {profile?.licenseCategories && profile.licenseCategories.length > 0 && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {profile.licenseCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile?.assignedVehicle && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>
              {profile.assignedVehicle.make} {profile.assignedVehicle.model} (
              {profile.assignedVehicle.plateNumber})
            </span>
          </div>
        )}
      </div>

      {/* Availability indicator */}
      {profile && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              profile.isAvailable ? "bg-green-500" : "bg-gray-400"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {profile.isAvailable ? "Available" : "Not available"}
          </span>
        </div>
      )}
    </AnimatedCard>
  );
}
