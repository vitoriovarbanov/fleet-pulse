'use client';

import { motion } from 'framer-motion';
import { Truck, AlertTriangle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleWithLocation } from '@/server/api/routers/vehicles/repository/vehicles.repository.types';

type VehicleMarkerProps = {
  vehicle: VehicleWithLocation;
  isSelected?: boolean;
};

// Status colors matching the premium card design
const statusConfig = {
  ACTIVE: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    shadow: 'shadow-emerald-500/50',
    pulse: 'bg-emerald-400',
  },
  MAINTENANCE: {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    shadow: 'shadow-amber-500/50',
    pulse: 'bg-amber-400',
  },
  OUT_OF_SERVICE: {
    bg: 'bg-red-500',
    border: 'border-red-400',
    shadow: 'shadow-red-500/50',
    pulse: 'bg-red-400',
  },
};

// Driver status for the inner indicator
const driverStatusConfig: Record<string, { color: string }> = {
  AVAILABLE: { color: 'bg-emerald-400' },
  ON_DUTY: { color: 'bg-primary' },
  OFF_DUTY: { color: 'bg-muted-foreground' },
  ON_REST: { color: 'bg-amber-400' },
  SICK_LEAVE: { color: 'bg-red-400' },
  VACATION: { color: 'bg-violet-400' },
};

export function VehicleMarker({ vehicle, isSelected }: VehicleMarkerProps) {
  const status = statusConfig[vehicle.status] || statusConfig.ACTIVE;
  const driverStatus = vehicle.assignedDriver?.driverStatus;
  const driverConfig = driverStatus ? driverStatusConfig[driverStatus] : null;
  const hasDriver = !!vehicle.assignedDriver;

  const StatusIcon =
    vehicle.status === 'MAINTENANCE'
      ? Wrench
      : vehicle.status === 'OUT_OF_SERVICE'
        ? AlertTriangle
        : Truck;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer"
    >
      {/* Pulse ring for selected state */}
      {isSelected && (
        <motion.div
          className={cn(
            'absolute -inset-2 rounded-full',
            status.bg,
            'opacity-30'
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Main marker */}
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full border-2',
          'bg-card shadow-lg transition-all duration-200',
          status.border,
          isSelected && ['ring-2 ring-offset-2 ring-offset-background', `ring-${status.bg.replace('bg-', '')}`],
          isSelected && status.shadow
        )}
      >
        <StatusIcon
          className={cn(
            'h-5 w-5 transition-colors duration-200',
            isSelected ? status.bg.replace('bg-', 'text-') : 'text-foreground'
          )}
        />

        {/* Driver status indicator dot */}
        {hasDriver && driverConfig && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card',
              driverConfig.color
            )}
          >
            {/* Active pulse for available drivers */}
            {driverStatus === 'AVAILABLE' && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            )}
          </motion.div>
        )}

        {/* No driver indicator */}
        {!hasDriver && (
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-muted-foreground/40" />
        )}
      </div>

      {/* Vehicle plate tooltip on hover/select */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
        >
          <div className="rounded-lg bg-card px-2 py-1 text-xs font-medium shadow-lg border border-border">
            <span className="text-foreground">{vehicle.plateNumber}</span>
            {vehicle.assignedDriver && (
              <span className="text-muted-foreground ml-1">
                ({vehicle.assignedDriver.user.firstName})
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
