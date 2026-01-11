"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function VehiclesLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <StatsCardsSkeleton />
      <SearchBarSkeleton />
      <VehiclesGridSkeleton />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Gradient background */}
      <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent p-4 sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {/* Icon + label */}
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 rounded-xl" />
              <Shimmer className="h-3 w-24 rounded-full" />
            </div>
            {/* Title */}
            <Shimmer className="h-10 w-40" />
            {/* Description */}
            <Shimmer className="h-5 w-80" />
          </div>

          <div className="flex items-center gap-2">
            <Shimmer className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Shimmer className="h-8 w-12" />
              <Shimmer className="h-4 w-20" />
              {i < 3 && <div className="h-8 w-px bg-border/50 ml-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="rounded-2xl p-4 sm:p-5 bg-card border border-border/50"
        >
          <Shimmer className="h-10 w-10 rounded-xl mb-3" />
          <Shimmer className="h-8 w-16 mb-2" />
          <Shimmer className="h-4 w-24" />
        </motion.div>
      ))}
    </div>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Shimmer className="h-11 flex-1 max-w-md rounded-xl" />
      <div className="flex items-center gap-2">
        <Shimmer className="h-11 w-24 rounded-xl" />
        <Shimmer className="h-11 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function VehiclesGridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <VehicleCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

export function VehicleCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden"
    >
      {/* Image placeholder */}
      <Shimmer className="h-36 sm:h-40 w-full rounded-none" />

      {/* Content */}
      <div className="p-4">
        {/* Plate and status */}
        <div className="flex items-start justify-between mb-2">
          <Shimmer className="h-6 w-24" />
          <Shimmer className="h-6 w-20 rounded-lg" />
        </div>

        {/* Make/Model */}
        <Shimmer className="h-5 w-36 mb-3" />

        {/* Type badge and year */}
        <div className="flex items-center gap-2 mb-3">
          <Shimmer className="h-6 w-16 rounded-lg" />
          <Shimmer className="h-5 w-12" />
        </div>

        {/* Assigned driver */}
        <div className="flex items-center gap-2 mb-3">
          <Shimmer className="h-6 w-6 rounded-full" />
          <Shimmer className="h-4 w-28" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shimmer className="h-2 w-2 rounded-full" />
            <Shimmer className="h-3 w-20" />
          </div>
          <Shimmer className="h-6 w-6 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        className
      )}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}
