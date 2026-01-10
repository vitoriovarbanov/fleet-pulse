'use client';

import type { AppRouter } from '@/server/api/root';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink, loggerLink, TRPCClientError } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useRef } from 'react';
import { transformer } from './shared';

/**
 * tRPC React client
 * Use this to call tRPC procedures from Client Components
 */
export const api = createTRPCReact<AppRouter>();

type TRPCReactProviderProps = {
    children: React.ReactNode;
};

/**
 * Inner component that handles auth state changes
 * Must be inside QueryClientProvider to access queryClient
 */
function AuthStateWatcher({ queryClient }: { queryClient: QueryClient }) {
    const { userId, isLoaded } = useAuth();
    const previousUserIdRef = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        // Wait for auth to be loaded
        if (!isLoaded) return;

        // On first load, just store the userId
        if (previousUserIdRef.current === undefined) {
            previousUserIdRef.current = userId;
            return;
        }

        // If userId changed (including sign out: userId becomes null)
        if (previousUserIdRef.current !== userId) {
            // Clear all cached queries when user changes
            // This is critical for security - prevents data leakage between users
            queryClient.clear();
            previousUserIdRef.current = userId;
        }
    }, [userId, isLoaded, queryClient]);

    return null;
}

export function TRPCReactProvider({ children }: TRPCReactProviderProps) {
    const queryClient = React.useMemo(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Don't retry on unauthorized errors
                        retry(failureCount, error) {
                            if (error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED') {
                                return false;
                            }
                            return failureCount < 2;
                        },
                        // Data considered fresh for 30 seconds
                        staleTime: 30 * 1000,
                    },
                },
            }),
        []
    );

    const trpcClient = React.useMemo(
        () =>
            api.createClient({
                links: [
                    // Logger for development debugging
                    loggerLink({
                        enabled: (op) =>
                            process.env.NODE_ENV === 'development' ||
                            (op.direction === 'down' && op.result instanceof Error),
                    }),
                    // HTTP batch link - batches multiple requests into one
                    httpBatchLink({
                        url: '/api/trpc',
                        transformer,
                    }),
                ],
            }),
        []
    );

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                <AuthStateWatcher queryClient={queryClient} />
                {children}
            </api.Provider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
