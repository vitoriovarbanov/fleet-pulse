/**
 * Role-based access control utilities
 *
 * Use these utilities with useAuthSync() to conditionally render UI
 * based on user roles. No extra API calls - uses cached auth data.
 */

export const UserRole = {
    ADMIN: "ADMIN",
    FLEET_MANAGER: "FLEET_MANAGER",
    DISPATCHER: "DISPATCHER",
    DRIVER: "DRIVER",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Role hierarchy for permission checks
 * Higher index = more permissions
 */
const ROLE_HIERARCHY: UserRoleType[] = [
    UserRole.DRIVER,
    UserRole.DISPATCHER,
    UserRole.FLEET_MANAGER,
    UserRole.ADMIN,
];

/**
 * Check if a user role has access to a feature that requires certain roles
 */
export function hasRole(userRole: UserRoleType | undefined, allowedRoles: UserRoleType[]): boolean {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
}

/**
 * Check if user role is at least the minimum required level
 * Uses role hierarchy: DRIVER < DISPATCHER < FLEET_MANAGER < ADMIN
 */
export function hasMinimumRole(userRole: UserRoleType | undefined, minimumRole: UserRoleType): boolean {
    if (!userRole) return false;
    const userLevel = ROLE_HIERARCHY.indexOf(userRole);
    const requiredLevel = ROLE_HIERARCHY.indexOf(minimumRole);
    return userLevel >= requiredLevel;
}

/**
 * Check if user is an admin (ADMIN or FLEET_MANAGER)
 */
export function isAdmin(userRole: UserRoleType | undefined): boolean {
    return hasRole(userRole, [UserRole.ADMIN, UserRole.FLEET_MANAGER]);
}

/**
 * Check if user can manage drivers (not a driver themselves)
 */
export function canManageDrivers(userRole: UserRoleType | undefined): boolean {
    return hasRole(userRole, [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DISPATCHER]);
}

/**
 * Check if user can view tracking data
 */
export function canViewTracking(userRole: UserRoleType | undefined): boolean {
    return hasRole(userRole, [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DISPATCHER]);
}

/**
 * Check if user can access settings
 */
export function canAccessSettings(userRole: UserRoleType | undefined): boolean {
    return hasRole(userRole, [UserRole.ADMIN, UserRole.FLEET_MANAGER]);
}
