/**
 * Device detection and breakpoint utilities
 */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Check if the current viewport matches a breakpoint
 * Only works on the client side
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= breakpoints[breakpoint];
}

/**
 * Get the current breakpoint based on viewport width
 * Returns the largest breakpoint that matches
 */
export function getCurrentBreakpoint(): Breakpoint | null {
  if (typeof window === "undefined") return null;

  const width = window.innerWidth;
  const entries = Object.entries(breakpoints) as [Breakpoint, number][];

  // Sort by value descending and find first match
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  for (const [key, value] of sorted) {
    if (width >= value) return key;
  }

  return null;
}

/**
 * Device type detection based on user agent
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  return "desktop";
}

/**
 * Check if the device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Check if the device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if the device is in dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
