"use client";

import { motion } from "framer-motion";
import { ChevronRight, Building2, Users, Truck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrganizationCard as OrganizationCardType } from "@/server/api/routers/organizations/repository/organizations.repository.types";

type OrganizationCardProps = {
    organization: OrganizationCardType;
    onClick?: () => void;
    index?: number;
};

const PLAN_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    free: {
        label: "Free",
        bgColor: "bg-slate-500/10",
        textColor: "text-slate-600 dark:text-slate-400",
        borderColor: "border-slate-500/20",
    },
    basic: {
        label: "Basic",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-500/20",
    },
    premium: {
        label: "Premium",
        bgColor: "bg-violet-500/10",
        textColor: "text-violet-600 dark:text-violet-400",
        borderColor: "border-violet-500/20",
    },
    enterprise: {
        label: "Enterprise",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-500/20",
    },
};

const STATUS_CONFIG = {
    active: {
        label: "Active",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500/20",
        dotColor: "bg-emerald-500",
    },
    inactive: {
        label: "Inactive",
        bgColor: "bg-red-500/10",
        textColor: "text-red-600 dark:text-red-400",
        borderColor: "border-red-500/20",
        dotColor: "bg-red-500",
    },
};

export function OrganizationCard({
    organization,
    onClick,
    index = 0,
}: OrganizationCardProps) {
    const planConfig = PLAN_CONFIG[organization.planType] ?? PLAN_CONFIG.free;
    const statusConfig = organization.isActive ? STATUS_CONFIG.active : STATUS_CONFIG.inactive;

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

            {/* Header with icon and status */}
            <div className="relative z-10 p-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors duration-200">
                                {organization.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono">
                                {organization.slug}
                            </p>
                        </div>
                    </div>

                    {/* Status badge */}
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                            statusConfig.bgColor,
                            statusConfig.textColor,
                            statusConfig.borderColor
                        )}
                    >
                        <div className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotColor)} />
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-4">
                {/* Plan badge and country */}
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border",
                            planConfig.bgColor,
                            planConfig.textColor,
                            planConfig.borderColor
                        )}
                    >
                        {planConfig.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50">
                        <Globe className="h-3 w-3" />
                        {organization.country}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatItem
                        icon={Users}
                        label="Users"
                        value={organization._count.users}
                    />
                    <StatItem
                        icon={Truck}
                        label="Vehicles"
                        value={organization._count.vehicles}
                    />
                </div>

                {/* Email */}
                {organization.email && (
                    <p className="text-xs text-muted-foreground truncate mb-3">
                        {organization.email}
                    </p>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Created {new Date(organization.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>

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

function StatItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Users;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-card">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-semibold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
