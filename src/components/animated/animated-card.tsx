"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cardHoverVariants, scaleVariants, reducedMotionVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  enableHover = true,
  onClick,
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={cn("rounded-lg border bg-card p-4", className)}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={enableHover ? cardHoverVariants : scaleVariants}
      initial={enableHover ? "initial" : "hidden"}
      animate={enableHover ? "initial" : "visible"}
      whileHover={enableHover ? "hover" : undefined}
      whileTap={enableHover && onClick ? "tap" : undefined}
      className={cn(
        "rounded-lg border bg-card p-4",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedSkeletonProps {
  className?: string;
}

export function AnimatedSkeleton({ className }: AnimatedSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn("rounded-md bg-muted", className)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={cn("rounded-md bg-muted", className)}
    />
  );
}
