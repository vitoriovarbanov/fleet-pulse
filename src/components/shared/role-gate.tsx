"use client";

import { type ReactNode } from "react";
import { useAuthSync } from "@/providers/auth-sync-provider";
import { hasRole, type UserRoleType } from "@/lib/roles";

type RoleGateProps = {
    /** Roles that are allowed to see the children */
    allowedRoles: UserRoleType[];
    /** Content to render if user has required role */
    children: ReactNode;
    /** Optional fallback content when role check fails */
    fallback?: ReactNode;
};

/**
 * RoleGate - Conditionally render content based on user role
 *
 * @example
 * // Only admins can see this
 * <RoleGate allowedRoles={["ADMIN", "FLEET_MANAGER"]}>
 *   <AdminPanel />
 * </RoleGate>
 *
 * @example
 * // With fallback
 * <RoleGate allowedRoles={["ADMIN"]} fallback={<p>Access denied</p>}>
 *   <SecretContent />
 * </RoleGate>
 */
export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
    const { user, isLoading } = useAuthSync();

    // Don't render anything while loading to prevent flash
    if (isLoading) return null;

    if (!user || !hasRole(user.role, allowedRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
