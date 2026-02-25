"use client";

import { AnimatedSkeleton } from "@/components/animated/animated-card";
import { motion } from "framer-motion";

export function OrganizationsLoadingSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/3 to-transparent p-4 sm:p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <AnimatedSkeleton className="h-10 w-10 rounded-xl" />
                        <AnimatedSkeleton className="h-4 w-24" />
                    </div>
                    <AnimatedSkeleton className="h-10 w-48" />
                    <AnimatedSkeleton className="h-5 w-64" />
                    <div className="flex gap-6 mt-6">
                        <AnimatedSkeleton className="h-8 w-32" />
                        <AnimatedSkeleton className="h-8 w-24" />
                    </div>
                </div>
            </div>

            {/* Search skeleton */}
            <div className="flex items-center gap-4">
                <AnimatedSkeleton className="h-10 flex-1 max-w-sm rounded-xl" />
                <AnimatedSkeleton className="h-10 w-10 rounded-xl" />
            </div>

            {/* Grid skeleton */}
            <OrganizationsGridSkeleton />
        </div>
    );
}

export function OrganizationsGridSkeleton() {
    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <OrganizationCardSkeleton key={i} index={i} />
            ))}
        </div>
    );
}

function OrganizationCardSkeleton({ index }: { index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <AnimatedSkeleton className="h-12 w-12 rounded-xl" />
                        <div>
                            <AnimatedSkeleton className="h-5 w-32 mb-1" />
                            <AnimatedSkeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <AnimatedSkeleton className="h-6 w-16 rounded-lg" />
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex gap-2 mb-4">
                    <AnimatedSkeleton className="h-6 w-16 rounded-lg" />
                    <AnimatedSkeleton className="h-6 w-12 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <AnimatedSkeleton className="h-14 rounded-lg" />
                    <AnimatedSkeleton className="h-14 rounded-lg" />
                </div>

                <AnimatedSkeleton className="h-3 w-40 mb-3" />

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <AnimatedSkeleton className="h-3 w-28" />
                    <AnimatedSkeleton className="h-6 w-6 rounded-lg" />
                </div>
            </div>
        </motion.div>
    );
}
