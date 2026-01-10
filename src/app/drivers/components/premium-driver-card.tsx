'use client';

import { motion } from 'framer-motion';
import { Phone, Truck, Shield, Clock, ChevronRight, Zap, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { R2Avatar } from '@/components/shared/r2-avatar';
import type { DriverCard as DriverCardType } from '@/server/api/routers/drivers/repository/drivers.repository.types';

type PremiumDriverCardProps = {
    driver: DriverCardType;
    onClick?: () => void;
    index?: number;
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Zap; label: string }> = {
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

export function PremiumDriverCard({ driver, onClick, index = 0 }: PremiumDriverCardProps) {
    const profile = driver.driverProfile;
    const fullName = [driver.firstName, driver.lastName].filter(Boolean).join(' ') || 'Unknown';
    const initials = [driver.firstName?.[0], driver.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

    const statusKey = profile?.driverStatus ?? 'OFF_DUTY';
    const status = statusConfig[statusKey] ?? statusConfig.OFF_DUTY;
    const StatusIcon = status.icon;

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
                'group relative cursor-pointer rounded-2xl p-4 sm:p-5',
                'bg-card border border-border/50',
                'hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
                'transition-all duration-300 ease-out',
                'overflow-hidden'
            )}
        >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Glow effect on hover */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <R2Avatar
                                    avatarKey={driver.avatarUrl}
                                    fallback={initials}
                                    alt={fullName}
                                    className="h-12 w-12 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300"
                                />
                            </motion.div>
                            {profile?.isAvailable && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card"
                                >
                                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                </motion.div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors duration-200">
                                {fullName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{driver.email}</p>
                        </div>
                    </div>

                    {/* Arrow indicator */}
                    <motion.div
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200"
                        whileHover={{ x: 2 }}
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                            status.bgColor,
                            status.color
                        )}
                    >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </span>
                </div>

                {/* Details grid */}
                <div className="space-y-2.5">
                    {driver.phoneNumber && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted/50">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="text-muted-foreground">{driver.phoneNumber}</span>
                        </div>
                    )}

                    {profile?.licenseCategories && profile.licenseCategories.length > 0 && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted/50">
                                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {profile.licenseCategories.slice(0, 4).map((cat) => (
                                    <span
                                        key={cat}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary-foreground"
                                    >
                                        {cat}
                                    </span>
                                ))}
                                {profile.licenseCategories.length > 4 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{profile.licenseCategories.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {profile?.assignedVehicle && (
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
                                <Truck className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-foreground font-medium">
                                {profile.assignedVehicle.make} {profile.assignedVehicle.model}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                ({profile.assignedVehicle.plateNumber})
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer availability indicator */}
                <div className="mt-3 sm:mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'h-2 w-2 rounded-full flex-shrink-0 transition-colors duration-200',
                                profile?.isAvailable
                                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                    : 'bg-muted-foreground/40'
                            )}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                            {profile?.isAvailable ? 'Ready for assignment' : 'Currently unavailable'}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
