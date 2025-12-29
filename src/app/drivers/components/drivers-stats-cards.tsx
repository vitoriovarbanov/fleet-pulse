"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, UserCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardData = {
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: typeof Users;
  color: "primary" | "emerald" | "amber" | "violet";
};

type DriversStatsCardsProps = {
  totalDrivers: number;
  availableDrivers: number;
  onDutyDrivers: number;
  driversWithVehicle: number;
};

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    glow: "shadow-primary/10",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/10",
  },
};

export function DriversStatsCards({
  totalDrivers,
  availableDrivers,
  onDutyDrivers,
  driversWithVehicle,
}: DriversStatsCardsProps) {
  const stats: StatCardData[] = [
    {
      label: "Total Drivers",
      value: totalDrivers,
      icon: Users,
      color: "primary",
    },
    {
      label: "Available",
      value: availableDrivers,
      change: totalDrivers > 0 ? Math.round((availableDrivers / totalDrivers) * 100) : 0,
      changeLabel: "of total",
      icon: UserCheck,
      color: "emerald",
    },
    {
      label: "On Duty",
      value: onDutyDrivers,
      icon: Truck,
      color: "violet",
    },
    {
      label: "With Vehicle",
      value: driversWithVehicle,
      change: totalDrivers > 0 ? Math.round((driversWithVehicle / totalDrivers) * 100) : 0,
      changeLabel: "assigned",
      icon: Truck,
      color: "amber",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </motion.div>
  );
}

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  const colors = colorClasses[stat.color];
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.4 + index * 0.1,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4 sm:p-5",
        "bg-card border border-border/50",
        "hover:border-border hover:shadow-lg transition-all duration-300",
        colors.glow
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-br from-transparent via-transparent to-primary/5"
        )}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className={cn(
            "inline-flex items-center justify-center h-10 w-10 rounded-xl mb-3",
            colors.bg,
            "transition-transform duration-200 group-hover:scale-110"
          )}
        >
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>

        {/* Value */}
        <div className="mb-1">
          <AnimatedNumber value={stat.value} className="text-3xl font-bold" />
        </div>

        {/* Label and change */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          {stat.change !== undefined && (
            <span className={cn("text-xs font-medium", colors.text)}>
              {stat.change}% {stat.changeLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (value - startValue) * easeProgress);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span className={className}>{displayValue}</span>;
}
