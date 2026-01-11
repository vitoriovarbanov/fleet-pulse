"use client";

import { motion } from "framer-motion";
import { Plus, Truck, Sparkles, ArrowRight, Wrench, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type VehiclesEmptyStateProps = {
  isSearching?: boolean;
  searchQuery?: string;
  onAddVehicle?: () => void;
  onClearSearch?: () => void;
};

export function VehiclesEmptyState({
  isSearching,
  searchQuery,
  onAddVehicle,
  onClearSearch,
}: VehiclesEmptyStateProps) {
  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="relative mb-6"
        >
          <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Truck className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center"
          >
            <span className="text-lg">?</span>
          </motion.div>
        </motion.div>

        <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          No vehicles match your search for &quot;{searchQuery}&quot;. Try
          adjusting your filters or search terms.
        </p>

        <Button
          variant="outline"
          onClick={onClearSearch}
          className="rounded-xl"
        >
          Clear search
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Animated illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative mb-8"
      >
        {/* Main icon container */}
        <div className="relative">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="h-32 w-32 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center shadow-xl shadow-primary/10"
          >
            <Truck className="h-16 w-16 text-primary" />
          </motion.div>

          {/* Sparkles decoration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -top-3 -right-3"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center"
            >
              <Sparkles className="h-5 w-5 text-secondary" />
            </motion.div>
          </motion.div>

          {/* Plus decoration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute -bottom-2 -left-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 text-emerald-500" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative z-10"
      >
        <h3 className="text-2xl font-bold mb-3">No vehicles yet</h3>
        <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
          Get started by adding your first vehicle to the fleet. You&apos;ll be
          able to track status, schedule maintenance, and assign drivers.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={onAddVehicle}
            className="cursor-pointer group relative overflow-hidden rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="h-5 w-5 mr-2" />
            Add your first vehicle
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Feature list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl"
      >
        {[
          { icon: Truck, label: "Track fleet status" },
          { icon: Wrench, label: "Manage maintenance" },
          { icon: Users, label: "Assign drivers" },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/30 border border-border/50"
          >
            <feature.icon className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {feature.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
