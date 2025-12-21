"use client";

import { useState, useEffect } from "react";
import { breakpoints, type Breakpoint, getDeviceType, isTouchDevice } from "@/lib/device";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  breakpoint: Breakpoint | null;
}

/**
 * Hook to get device information
 * @returns Device info including type and current breakpoint
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    breakpoint: null,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const deviceType = getDeviceType();
      const width = window.innerWidth;

      // Determine breakpoint
      let currentBreakpoint: Breakpoint | null = null;
      const entries = Object.entries(breakpoints) as [Breakpoint, number][];
      const sorted = entries.sort((a, b) => b[1] - a[1]);
      for (const [key, value] of sorted) {
        if (width >= value) {
          currentBreakpoint = key;
          break;
        }
      }

      setDeviceInfo({
        isMobile: deviceType === "mobile",
        isTablet: deviceType === "tablet",
        isDesktop: deviceType === "desktop",
        isTouch: isTouchDevice(),
        breakpoint: currentBreakpoint,
      });
    };

    // Initial check
    updateDeviceInfo();

    // Listen for resize
    window.addEventListener("resize", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}
