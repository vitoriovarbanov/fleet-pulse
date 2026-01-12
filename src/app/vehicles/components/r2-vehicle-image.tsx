"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  type VehicleType,
  getVehicleTypeConfig,
  VEHICLE_TYPES,
} from "./forms/vehicle-form.types";

type R2VehicleImageProps = {
  /** R2 storage key or full URL */
  imageKey: string | null | undefined;
  /** Vehicle type for placeholder icon */
  vehicleType?: VehicleType;
  /** Alt text for the image */
  alt: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional classes */
  className?: string;
  /** Aspect ratio class */
  aspectRatio?: "video" | "square" | "wide";
  /** Whether to show loading shimmer */
  showShimmer?: boolean;
};

const sizeClasses = {
  sm: "h-24",
  md: "h-32",
  lg: "h-40",
  xl: "h-48",
};

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[2/1]",
};

/**
 * Vehicle image component that handles R2 storage keys
 * - If imageKey looks like a URL (starts with http), uses it directly
 * - If imageKey is an R2 key, fetches a presigned download URL
 * - Shows a premium placeholder with vehicle type icon when no image
 */
export function R2VehicleImage({
  imageKey,
  vehicleType = "TRUCK",
  alt,
  size = "md",
  className,
  aspectRatio = "video",
  showShimmer = true,
}: R2VehicleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Reset states when imageKey changes
  useEffect(() => {
    setImageError(false);
    setIsImageLoaded(false);
  }, [imageKey]);

  // Determine if we need to fetch a presigned URL
  const isR2Key = imageKey && !imageKey.startsWith("http");

  // Fetch presigned URL for R2 keys
  const { data: downloadData, isLoading } = api.files.getDownloadUrl.useQuery(
    { key: imageKey! },
    {
      enabled: !!isR2Key && !imageError,
      staleTime: 50 * 60 * 1000, // 50 minutes
      gcTime: 55 * 60 * 1000, // 55 minutes
      retry: 1,
    }
  );

  // Determine the final image URL
  const imageUrl = isR2Key ? downloadData?.downloadUrl : imageKey;

  // Get vehicle type config for placeholder
  const typeConfig = getVehicleTypeConfig(vehicleType) ?? VEHICLE_TYPES[0];
  const PlaceholderIcon = typeConfig.icon;

  // Show placeholder if no image, error, or still loading R2 URL
  const showPlaceholder =
    !imageUrl || imageError || (isR2Key && isLoading && !downloadData);

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          aspectClasses[aspectRatio],
          sizeClasses[size],
          className
        )}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40" />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient mesh effect */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-2xl" />
        </div>

        {/* Icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex items-center justify-center rounded-2xl p-4",
              "bg-gradient-to-br from-muted/50 to-transparent",
              "border border-border/30"
            )}
          >
            <PlaceholderIcon
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12",
                "text-muted-foreground/60"
              )}
              strokeWidth={1.5}
            />
          </motion.div>
        </div>

        {/* Loading shimmer */}
        {showShimmer && isLoading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Border overlay */}
        <div className="absolute inset-0 rounded-xl border border-border/30" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        aspectClasses[aspectRatio],
        sizeClasses[size],
        className
      )}
    >
      {/* Loading shimmer while image loads */}
      {!isImageLoaded && showShimmer && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual image */}
      <motion.img
        src={imageUrl}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: isImageLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 h-full w-full object-cover"
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setImageError(true)}
      />

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Border overlay */}
      <div className="absolute inset-0 rounded-xl border border-white/10" />
    </div>
  );
}

// ============================================
// COMPACT IMAGE VARIANT (for cards)
// ============================================

type CompactVehicleImageProps = Omit<R2VehicleImageProps, "size" | "aspectRatio"> & {
  /** Height class override */
  heightClass?: string;
};

export function CompactVehicleImage({
  imageKey,
  vehicleType = "TRUCK",
  alt,
  className,
  heightClass = "h-36 sm:h-40",
  showShimmer = true,
}: CompactVehicleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setIsImageLoaded(false);
  }, [imageKey]);

  const isR2Key = imageKey && !imageKey.startsWith("http");

  const { data: downloadData, isLoading } = api.files.getDownloadUrl.useQuery(
    { key: imageKey! },
    {
      enabled: !!isR2Key && !imageError,
      staleTime: 50 * 60 * 1000,
      gcTime: 55 * 60 * 1000,
      retry: 1,
    }
  );

  const imageUrl = isR2Key ? downloadData?.downloadUrl : imageKey;
  const typeConfig = getVehicleTypeConfig(vehicleType) ?? VEHICLE_TYPES[0];
  const PlaceholderIcon = typeConfig.icon;

  const showPlaceholder =
    !imageUrl || imageError || (isR2Key && isLoading && !downloadData);

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-t-xl",
          heightClass,
          className
        )}
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-slate-950/90" />

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Centered icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <PlaceholderIcon
              className="h-16 w-16 text-slate-600/80"
              strokeWidth={1}
            />
          </motion.div>
        </div>

        {/* Loading shimmer */}
        {showShimmer && isLoading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-t-xl",
        heightClass,
        className
      )}
    >
      {/* Loading state */}
      {!isImageLoaded && showShimmer && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse" />
      )}

      {/* Image */}
      <motion.img
        src={imageUrl}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: isImageLoaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 h-full w-full object-contain"
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setImageError(true)}
      />

      {/* Bottom gradient for card content */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}
