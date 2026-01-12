"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Settings,
  X,
  Users,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasRole, type UserRoleType } from "@/lib/roles";
import { useAuthSync } from "@/providers/auth-sync-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useState, useCallback } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  roles?: UserRoleType[];
};

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: Users,
    description: "Manage fleet drivers",
    roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: Truck,
    description: "Fleet inventory",
    roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
  },
  // {
  //   label: "Tracking",
  //   href: "/dashboard/tracking",
  //   icon: MapPin,
  //   description: "Real-time location",
  //   roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
  // },
  // {
  //   label: "Settings",
  //   href: "/dashboard/settings",
  //   icon: Settings,
  //   description: "Configuration",
  //   roles: ["ADMIN", "FLEET_MANAGER"],
  // },
];

function NavLink({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        "hover:bg-sidebar-accent/80",
        isActive
          ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
      )}
    >
      {/* Active indicator glow */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
          style={{
            boxShadow: "inset 0 0 20px oklch(0.62 0.18 250 / 0.15)",
          }}
        />
      )}

      {/* Left edge accent for active state */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
          style={{
            boxShadow: "0 0 12px 2px oklch(0.62 0.18 250 / 0.5)",
          }}
        />
      )}

      {/* Icon container */}
      <div
        className={cn(
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground/60 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px]",
            isActive && "drop-shadow-[0_0_8px_oklch(0.62_0.18_250/0.5)]"
          )}
        />
      </div>

      {/* Label */}
      {!isCollapsed && (
        <div className="relative z-10 flex flex-col overflow-hidden">
          <span className="truncate font-medium tracking-tight">
            {item.label}
          </span>
          {item.description && (
            <span className="truncate text-[11px] font-normal text-sidebar-foreground/50">
              {item.description}
            </span>
          )}
        </div>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="flex flex-col gap-0.5 border border-sidebar-border/50 bg-sidebar/95 px-3 py-2 text-sidebar-foreground shadow-xl backdrop-blur-xl"
        >
          <span className="font-medium">{item.label}</span>
          {item.description && (
            <span className="text-[11px] text-sidebar-foreground/60">
              {item.description}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthSync();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && hasRole(user.role, item.roles);
  });

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-200 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 ease-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[72px]" : "w-[260px]",
          // Premium glass-morphism styling
          "border-r border-sidebar-border/50",
          "bg-sidebar/80 backdrop-blur-xl",
          "[box-shadow:inset_-1px_0_0_oklch(1_0_0/0.02),_inset_1px_0_0_oklch(1_0_0/0.02)]"
        )}
        style={{
          background:
            "linear-gradient(180deg, oklch(0.11 0.018 250 / 0.95) 0%, oklch(0.13 0.02 250 / 0.98) 100%)",
        }}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border/30 px-4">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              {/* Logo mark */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-primary"
                  style={{
                    filter: "drop-shadow(0 0 6px oklch(0.62 0.18 250 / 0.4))",
                  }}
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Brand text */}
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  <span className="text-primary">Fleet</span>
                  <span className="text-sidebar-foreground/90">Pulse</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
                  Fleet Management
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary"
                style={{
                  filter: "drop-shadow(0 0 6px oklch(0.62 0.18 250 / 0.4))",
                }}
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onClick={onClose}
                />
              );
            })}
          </div>
        </nav>

        {/* Footer with collapse toggle */}
        <div className="border-t border-sidebar-border/30 p-3">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapse}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  "text-sidebar-foreground/50 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/50 transition-colors duration-150 group-hover:bg-sidebar-accent">
                  <ChevronLeft
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isCollapsed && "rotate-180"
                    )}
                  />
                </div>
                {!isCollapsed && <span className="truncate">Collapse</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent
                side="right"
                sideOffset={12}
                className="border border-sidebar-border/50 bg-sidebar/95 px-3 py-2 text-sidebar-foreground shadow-xl backdrop-blur-xl"
              >
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
