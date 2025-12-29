"use client";

import { type ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthSyncProvider } from "@/providers/auth-sync-provider";
import { useSidebar } from "@/providers/sidebar-provider";

type AppLayoutContentProps = {
    children: ReactNode;
};

/**
 * Inner layout that consumes sidebar context
 */
function AppLayoutContent({ children }: AppLayoutContentProps) {
    const { isOpen, open, close } = useSidebar();

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={isOpen} onClose={close} />
            <div className="flex flex-1 flex-col">
                <Header onMenuClick={open} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">{children}</main>
            </div>
        </div>
    );
}

type AppLayoutProps = {
    children: ReactNode;
};

/**
 * Reusable app layout with sidebar, header, and auth context.
 * Use this in any route group that needs the standard app shell.
 * Note: SidebarProvider is in root layout for global state persistence.
 */
export function AppLayout({ children }: AppLayoutProps) {
    return (
        <AuthSyncProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
        </AuthSyncProvider>
    );
}
