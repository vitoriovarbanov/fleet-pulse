"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DriversLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />

      <StatsCardsSkeleton />

      <SearchBarSkeleton />

      <DriversGridSkeleton />
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="relative">
      {/* Ambient gradient background */}
      <div className="absolute -inset-x-6 -top-6 h-48 overflow-hidden rounded-t-3xl opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Shimmer className="h-6 w-32 rounded-full" />
          <Shimmer className="h-10 w-48" />
          <Shimmer className="h-5 w-80" />
        </div>

        <div className="flex items-center gap-2">
          <Shimmer className="h-9 w-24 rounded-xl" />
          <Shimmer className="h-9 w-24 rounded-xl" />
          <Shimmer className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="h-8 w-12" />
            <Shimmer className="h-4 w-20" />
            {i < 3 && <div className="h-8 w-px bg-border/50 ml-4" />}
          </div>
        ))}
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
        <Shimmer className="h-11 w-28 rounded-xl" />
        <Shimmer className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function DriversGridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
          className="rounded-2xl p-5 bg-card border border-border/50"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shimmer className="h-12 w-12 rounded-xl" />
              <div>
                <Shimmer className="h-5 w-28 mb-2" />
                <Shimmer className="h-4 w-36" />
              </div>
            </div>
            <Shimmer className="h-8 w-8 rounded-lg" />
          </div>

          {/* Status */}
          <Shimmer className="h-6 w-24 rounded-lg mb-4" />

          {/* Details */}
          <div className="space-y-2.5">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-2.5">
                <Shimmer className="h-7 w-7 rounded-lg" />
                <Shimmer className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
            <Shimmer className="h-2 w-2 rounded-full" />
            <Shimmer className="h-3 w-28" />
          </div>
        </motion.div>
      ))}
    </div>
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

export function DriverCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-2xl p-5 bg-card border border-border/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shimmer className="h-12 w-12 rounded-xl" />
          <div>
            <Shimmer className="h-5 w-28 mb-2" />
            <Shimmer className="h-4 w-36" />
          </div>
        </div>
        <Shimmer className="h-8 w-8 rounded-lg" />
      </div>

      {/* Status */}
      <Shimmer className="h-6 w-24 rounded-lg mb-4" />

      {/* Details */}
      <div className="space-y-2.5">
        {[1, 2, 3].map((j) => (
          <div key={j} className="flex items-center gap-2.5">
            <Shimmer className="h-7 w-7 rounded-lg" />
            <Shimmer className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
        <Shimmer className="h-2 w-2 rounded-full" />
        <Shimmer className="h-3 w-28" />
      </div>
    </motion.div>
  );
}
