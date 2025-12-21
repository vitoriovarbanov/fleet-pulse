"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { staggerContainerVariants, listItemVariants, reducedMotionVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedMotionVariants : listItemVariants;

  return (
    <motion.div variants={variants} className={cn("w-full", className)}>
      {children}
    </motion.div>
  );
}
