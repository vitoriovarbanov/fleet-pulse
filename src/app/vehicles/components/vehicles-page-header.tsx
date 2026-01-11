"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Truck } from "lucide-react";

type VehiclesPageHeaderProps = {
  totalVehicles?: number;
  activeVehicles?: number;
  maintenanceVehicles?: number;
  onAddVehicle?: () => void;
};

export function VehiclesPageHeader({
  totalVehicles = 0,
  activeVehicles = 0,
  maintenanceVehicles = 0,
  onAddVehicle,
}: VehiclesPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Gradient container */}
      <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent p-4 sm:p-6">
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative truck silhouette */}
        <div className="absolute -right-8 -bottom-4 opacity-[0.03] pointer-events-none">
          <Truck className="h-48 w-48 sm:h-64 sm:w-64" strokeWidth={0.5} />
        </div>

        {/* Header content */}
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Fleet Management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Vehicles
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-muted-foreground max-w-md text-sm sm:text-base"
            >
              Monitor your fleet vehicles, track maintenance status, and manage
              driver assignments efficiently.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap items-center gap-2"
          >
            <Button
              size="sm"
              onClick={onAddVehicle}
              className="cursor-pointer group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </motion.div>
        </div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative z-10 mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm"
        >
          <QuickStat
            label="Total Fleet"
            value={totalVehicles}
            delay={0.5}
          />
          <div className="h-8 w-px bg-border/50 hidden sm:block" />
          <QuickStat
            label="Active"
            value={activeVehicles}
            highlight
            delay={0.55}
          />
          <div className="h-8 w-px bg-border/50 hidden sm:block" />
          <QuickStat
            label="In Maintenance"
            value={maintenanceVehicles}
            warning={maintenanceVehicles > 0}
            delay={0.6}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

type QuickStatProps = {
  label: string;
  value: number;
  highlight?: boolean;
  warning?: boolean;
  delay?: number;
};

function QuickStat({ label, value, highlight, warning, delay = 0 }: QuickStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <span
        className={cn(
          "text-2xl font-semibold tabular-nums",
          highlight && "text-emerald-600 dark:text-emerald-400",
          warning && "text-amber-600 dark:text-amber-400",
          !highlight && !warning && "text-foreground"
        )}
      >
        <AnimatedCounter value={value} />
      </span>
      <span className="text-muted-foreground">{label}</span>
    </motion.div>
  );
}

function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  );
}
