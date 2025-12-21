"use client";

import { useMediaQuery } from "./use-media-query";

/**
 * Hook to check if the user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
