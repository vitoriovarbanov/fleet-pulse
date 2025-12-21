import { type Variants, type Transition } from "framer-motion";

/**
 * Standard easing curves
 */
export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.45, 0, 0.55, 1] as const,
  spring: { type: "spring", stiffness: 300, damping: 30 } as const,
  springBouncy: { type: "spring", stiffness: 400, damping: 25 } as const,
} as const;

/**
 * Standard durations
 */
export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

/**
 * Fade animation variants
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

/**
 * Slide up animation variants
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

/**
 * Scale animation variants
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

/**
 * Stagger children animation for lists
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * List item variants (use with staggerContainerVariants)
 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.easeOut },
  },
};

/**
 * Page transition variants
 */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

/**
 * Card hover animation
 */
export const cardHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
  tap: {
    scale: 0.98,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

/**
 * Skeleton loading pulse animation
 */
export const skeletonVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Modal/dialog animation variants
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
};

/**
 * Backdrop animation for modals
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast },
  },
};

/**
 * Standard transition config for motion.div
 */
export const defaultTransition: Transition = {
  duration: durations.normal,
  ease: easings.easeOut,
};

/**
 * Reduced motion variants - no animation
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 1 },
};
