"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const prefersReducedMotion = useReducedMotion();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="dark fixed inset-0 bg-background">
        <Image
          src="/auth_background1.webp"
          alt="Auth pages background"
          fill
          priority
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="w-full max-w-md px-4">
            <div className="glass-card gradient-border relative rounded-2xl p-1">
              <div className="rounded-xl bg-gradient-to-b from-foreground/[0.02] to-transparent p-4 sm:p-6">
                <div className="flex flex-col items-center space-y-6 py-8">
                  <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-2 w-full">
                    <div className="h-6 w-32 mx-auto animate-pulse rounded bg-muted" />
                    <div className="h-4 w-48 mx-auto animate-pulse rounded bg-muted" />
                  </div>
                  <div className="space-y-4 w-full">
                    <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
                    <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark fixed inset-0 bg-background">
      <Image
        src="/auth_background1.webp"
        alt="Auth pages background"
        fill
        priority
        className="object-cover"
        quality={90}
      />
      <div className="absolute inset-0 bg-background/40" />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{
            background: "oklch(0.62 0.18 250 / 0.15)",
            animation: prefersReducedMotion ? "none" : "glow-pulse 8s ease-in-out infinite",
          }}
        />
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full blur-[140px]"
          style={{
            background: "oklch(0.72 0.14 195 / 0.15)",
            animation: prefersReducedMotion ? "none" : "glow-pulse 20s ease-in-out infinite",
          }}
        />
      </div>

      <div className="noise-texture absolute inset-0" />

      <div className="relative z-10 flex h-full flex-col overflow-hidden">
        <motion.header
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-10 sm:py-4"
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
              <div
                className="absolute inset-0 rounded-xl opacity-90"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.18 250) 0%, oklch(0.55 0.16 250) 50%, oklch(0.72 0.14 195) 100%)"
                }}
              />
              <div className="absolute inset-[2px] rounded-[10px] bg-background" />
              {/* Fleet/GPS Location icon */}
              <svg
                viewBox="0 0 24 24"
                className="relative z-10 h-5 w-5"
                fill="none"
                stroke="url(#iconGradient)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.62 0.18 250)" />
                    <stop offset="100%" stopColor="oklch(0.72 0.14 195)" />
                  </linearGradient>
                </defs>
                {/* Location pin with pulse - represents fleet tracking */}
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
                {/* Signal waves - represents real-time tracking */}
                <path d="M19 9.5c.5-1 .5-2 0-3" opacity="0.6" />
                <path d="M21 10c1-1.5 1-3.5 0-5" opacity="0.4" />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Fleet<span style={{ color: "oklch(0.62 0.18 250)" }}>Pulse</span>
            </span>
          </Link>
        </motion.header>

        <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-4 sm:px-6">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="my-auto w-full max-w-md"
          >
            <div className="relative">
              {/* Glow effect behind card - Sapphire blue */}
              <div
                className="absolute -inset-1 rounded-2xl opacity-60 blur-xl"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.18 250 / 0.3) 0%, oklch(0.72 0.14 195 / 0.2) 50%, oklch(0.62 0.18 250 / 0.3) 100%)"
                }}
              />

              {/* Glass card container */}
              <div className="glass-card gradient-border relative rounded-2xl p-1">
                <div className="rounded-xl bg-gradient-to-b from-foreground/[0.02] to-transparent p-4 sm:p-6">
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="shrink-0 px-4 py-2 text-center sm:px-10 sm:py-3"
        >
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FleetPulse. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
