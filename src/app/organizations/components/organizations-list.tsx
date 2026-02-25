"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "@/trpc/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { OrganizationsPageHeader } from "./organizations-page-header";
import { OrganizationsSearchBar } from "./organizations-search-bar";
import { OrganizationCard } from "./organization-card";
import { OrganizationDetailPanel } from "./organization-detail-panel";
import { OrganizationsEmptyState } from "./organizations-empty-state";
import {
    OrganizationsLoadingSkeleton,
    OrganizationsGridSkeleton,
} from "./organizations-loading-skeleton";
import { CreateOrganizationDialog } from "./forms/create-organization-dialog";

import type { OrganizationCard as OrganizationCardType } from "@/server/api/routers/organizations/repository/organizations.repository.types";

export function OrganizationsList() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const { data, isLoading, isError, error, refetch, isFetching } =
        api.organizations.list.useQuery(
            {
                search: search || undefined,
                isActive: statusFilter ?? undefined,
                limit: 100,
            },
            {
                staleTime: 30000,
                placeholderData: (previousData) => previousData,
            }
        );

    const isInitialLoading = isLoading && !data;

    // Calculate stats
    const stats = useMemo(() => {
        const organizations = data?.organizations ?? [];
        return {
            total: organizations.length,
            active: organizations.filter((o) => o.isActive).length,
        };
    }, [data?.organizations]);

    const handleOrganizationClick = (organization: OrganizationCardType) => {
        setSelectedOrganizationId(organization.id);
    };

    const handleClosePanel = () => {
        setSelectedOrganizationId(null);
    };

    const handleRefresh = () => {
        void refetch();
    };

    const handleClearSearch = () => {
        setSearch("");
        setStatusFilter(null);
    };

    const handleAddOrganization = () => {
        setCreateDialogOpen(true);
    };

    const isSearching = search.length > 0 || statusFilter !== null;

    if (isInitialLoading) {
        return <OrganizationsLoadingSkeleton />;
    }

    // Error state
    if (isError) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                    <span className="text-destructive text-2xl">!</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-6 max-w-md">{error.message}</p>
                <Button onClick={handleRefresh} variant="outline" className="rounded-xl">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 overflow-hidden">
            <OrganizationsPageHeader
                totalOrganizations={stats.total}
                activeOrganizations={stats.active}
                onAddOrganization={handleAddOrganization}
            />

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <OrganizationsSearchBar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className="rounded-xl hover:bg-muted"
                    >
                        <RefreshCw
                            className={cn(
                                "h-4 w-4 transition-transform",
                                isFetching && "animate-spin"
                            )}
                        />
                        <span className="sr-only">Refresh</span>
                    </Button>
                </motion.div>
            </div>

            {/* Results count */}
            {data && data.organizations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                    <span>
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {data.organizations.length}
                        </span>{" "}
                        organizations
                    </span>
                    {isSearching && (
                        <span className="text-muted-foreground/60">• filtered</span>
                    )}
                </motion.div>
            )}

            {isFetching && data ? (
                <OrganizationsGridSkeleton />
            ) : data?.organizations.length === 0 ? (
                <OrganizationsEmptyState
                    isSearching={isSearching}
                    searchQuery={search}
                    onAddOrganization={handleAddOrganization}
                    onClearSearch={handleClearSearch}
                />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {data?.organizations.map((organization, index) => (
                        <OrganizationCard
                            key={organization.id}
                            organization={organization}
                            index={index}
                            onClick={() => handleOrganizationClick(organization)}
                        />
                    ))}
                </motion.div>
            )}

            <OrganizationDetailPanel
                organizationId={selectedOrganizationId}
                open={!!selectedOrganizationId}
                onClose={handleClosePanel}
                onUpdate={handleRefresh}
            />

            <CreateOrganizationDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
