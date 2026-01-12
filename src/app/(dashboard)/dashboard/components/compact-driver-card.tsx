'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, Zap, Shield, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { R2Avatar } from '@/components/shared/r2-avatar';
import { formatDistanceToNow } from 'date-fns';
import type { VehicleWithLocation } from '@/server/api/routers/vehicles/repository/vehicles.repository.types';

type CompactDriverCardProps = {
  vehicle: VehicleWithLocation;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
};

const driverStatusConfig: Record<string, { color: string; bgColor: string; icon: typeof Zap; label: string }> = {
  AVAILABLE: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    icon: Zap,
    label: 'Available',
  },
  ON_DUTY: {
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/20',
    icon: Truck,
    label: 'On Duty',
  },
  OFF_DUTY: {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted border-border',
    icon: Clock,
    label: 'Off Duty',
  },
  ON_REST: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    icon: Clock,
    label: 'On Rest',
  },
  SICK_LEAVE: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    icon: Shield,
    label: 'Sick Leave',
  },
  VACATION: {
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/20',
    icon: MapPin,
    label: 'Vacation',
  },
};

const vehicleStatusConfig: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'text-emerald-600 dark:text-emerald-400', label: 'Active' },
  MAINTENANCE: { color: 'text-amber-600 dark:text-amber-400', label: 'Maintenance' },
  OUT_OF_SERVICE: { color: 'text-red-600 dark:text-red-400', label: 'Out of Service' },
};

export function CompactDriverCard({ vehicle, isSelected, onClick, index = 0 }: CompactDriverCardProps) {
  const driver = vehicle.assignedDriver;
  const user = driver?.user;

  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown' : 'Unassigned';
  const initials = user
    ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'
    : '?';

  const driverStatusKey = driver?.driverStatus ?? 'OFF_DUTY';
  const driverStatus = driverStatusConfig[driverStatusKey] ?? driverStatusConfig.OFF_DUTY;
  const vehicleStatus = vehicleStatusConfig[vehicle.status] ?? vehicleStatusConfig.ACTIVE;
  const StatusIcon = driverStatus.icon;

  const lastUpdate = vehicle.lastLocationUpdate
    ? formatDistanceToNow(new Date(vehicle.lastLocationUpdate), { addSuffix: true })
    : 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer rounded-xl p-3',
        'bg-card border border-border/50',
        'hover:border-primary/30 hover:bg-accent/50',
        'transition-all duration-200 ease-out',
        isSelected && 'border-primary bg-primary/5 ring-1 ring-primary/20'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <R2Avatar
            avatarKey={user?.avatarUrl}
            fallback={initials}
            alt={fullName}
            className="h-9 w-9 ring-1 ring-border/50"
          />
          {driver?.isAvailable && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
            >
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {fullName}
            </h4>
            {/* Driver status badge */}
            {driver && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0',
                  driverStatus.bgColor,
                  driverStatus.color
                )}
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {driverStatus.label}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            {/* Vehicle info */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span className="truncate">{vehicle.plateNumber}</span>
              <span className={cn('hidden sm:inline', vehicleStatus.color)}>
                ({vehicleStatus.label})
              </span>
            </div>

            {/* Last update */}
            <span className="text-[10px] text-muted-foreground/70 flex-shrink-0">
              {lastUpdate}
            </span>
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-r-full"
        />
      )}
    </motion.div>
  );
}
