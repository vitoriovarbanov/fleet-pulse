"use client";

import { type ReactNode, createContext, useContext } from "react";
import { api } from "@/trpc/react";

type AuthUser = {
    id: string;
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    role: "ADMIN" | "DISPATCHER" | "DRIVER" | "FLEET_MANAGER";
    status: "ACTIVE" | "INACTIVE";
    organization: {
        id: string;
        name: string;
        slug: string;
    };
};

type AuthSyncContextValue = {
    user: AuthUser | null | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
};

const AuthSyncContext = createContext<AuthSyncContextValue | null>(null);

export function useAuthSync() {
    const context = useContext(AuthSyncContext);
    if (!context) {
        throw new Error("useAuthSync must be used within an AuthSyncProvider");
    }
    return context;
}

type AuthSyncProviderProps = {
    children: ReactNode;
};

/**
 * AuthSyncProvider
 *
 * Wraps protected pages and automatically calls auth.me on mount.
 * This triggers the lazy sync for new users who signed up via Clerk invitation.
 */
export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
    const { data: user, isLoading, isError, error } = api.auth.me.useQuery(undefined, {
        retry: false,
        staleTime: 30 * 1000, // 30 seconds - reduced from 5 minutes for security
        refetchOnWindowFocus: true, // Re-fetch when user returns to tab
    });

    return (
        <AuthSyncContext.Provider
            value={{
                user,
                isLoading,
                isError,
                error: error as Error | null,
            }}
        >
            {children}
        </AuthSyncContext.Provider>
    );
}
