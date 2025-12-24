"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, MapPin, Settings, X, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasRole, type UserRoleType } from "@/lib/roles";
import { useAuthSync } from "@/providers/auth-sync-provider";
import { Button } from "@/components/ui/button";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** If undefined, visible to all authenticated users */
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
    // Visible to all
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: Users,
    roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
  },
  {
    label: "Vehicles",
    href: "/dashboard/vehicles",
    icon: Truck,
    // Visible to all
  },
  {
    label: "Tracking",
    href: "/dashboard/tracking",
    icon: MapPin,
    roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN", "FLEET_MANAGER"],
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthSync();

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true; // No restriction = visible to all
    return user && hasRole(user.role, item.roles);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={onClose}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
