"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "@/trpc/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DriversPageHeader } from "./drivers-page-header";
import { DriversStatsCards } from "./drivers-stats-cards";
import { DriversSearchBar } from "./drivers-search-bar";
import { PremiumDriverCard } from "./premium-driver-card";
import { DriverDetailPanel } from "./driver-detail-panel";
import { DriversEmptyState } from "./drivers-empty-state";
import { DriversLoadingSkeleton, DriverCardSkeleton } from "./drivers-loading-skeleton";

import type { DriverCard as DriverCardType } from "@/server/api/routers/drivers/repository/drivers.repository.types";

type DriverStatus =
  | "AVAILABLE"
  | "ON_DUTY"
  | "OFF_DUTY"
  | "ON_REST"
  | "SICK_LEAVE"
  | "VACATION";

export function PremiumDriverList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    api.drivers.list.useQuery(
      { search: search || undefined, limit: 50 },
      { staleTime: 30000 }
    );

  // Filter drivers based on local filters
  const filteredDrivers = useMemo(() => {
    if (!data?.drivers) return [];

    return data.drivers.filter((driver) => {
      // Status filter
      if (statusFilter && driver.driverProfile?.driverStatus !== statusFilter) {
        return false;
      }

      // Availability filter
      if (availabilityFilter !== null) {
        const isAvailable = driver.driverProfile?.isAvailable ?? false;
        if (isAvailable !== availabilityFilter) {
          return false;
        }
      }

      return true;
    });
  }, [data?.drivers, statusFilter, availabilityFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const drivers = data?.drivers ?? [];
    return {
      total: drivers.length,
      available: drivers.filter((d) => d.driverProfile?.isAvailable).length,
      onDuty: drivers.filter((d) => d.driverProfile?.driverStatus === "ON_DUTY")
        .length,
      withVehicle: drivers.filter((d) => d.driverProfile?.assignedVehicleId)
        .length,
    };
  }, [data?.drivers]);

  const handleDriverClick = (driver: DriverCardType) => {
    setSelectedDriverId(driver.id);
  };

  const handleClosePanel = () => {
    setSelectedDriverId(null);
  };

  const handleRefresh = () => {
    void refetch();
  };

  const handleClearSearch = () => {
    setSearch("");
    setStatusFilter(null);
    setAvailabilityFilter(null);
  };

  const isSearching = search.length > 0 || statusFilter !== null || availabilityFilter !== null;

  // Full page loading state
  if (isLoading) {
    return <DriversLoadingSkeleton />;
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
      <DriversPageHeader
        totalDrivers={stats.total}
        availableDrivers={stats.available}
        onAddDriver={() => {
          // TODO: Open add driver modal
        }}
        onExport={() => {
          // TODO: Export functionality
        }}
        onFilter={() => {
          // TODO: Advanced filters modal
        }}
      />

      {/* Stats Cards */}
      {stats.total > 0 && (
        <DriversStatsCards
          totalDrivers={stats.total}
          availableDrivers={stats.available}
          onDutyDrivers={stats.onDuty}
          driversWithVehicle={stats.withVehicle}
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DriversSearchBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
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
      {data && data.drivers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span>
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredDrivers.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {data.drivers.length}
            </span>{" "}
            drivers
          </span>
          {isSearching && (
            <span className="text-muted-foreground/60">• filtered</span>
          )}
        </motion.div>
      )}

      {filteredDrivers.length === 0 ? (
        <DriversEmptyState
          isSearching={isSearching}
          searchQuery={search}
          onAddDriver={() => {
            // TODO: Open add driver modal
          }}
          onClearSearch={handleClearSearch}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredDrivers.map((driver, index) => (
            <PremiumDriverCard
              key={driver.id}
              driver={driver}
              index={index}
              onClick={() => handleDriverClick(driver)}
            />
          ))}
        </motion.div>
      )}

      {/* Detail Panel */}
      <DriverDetailPanel
        driverId={selectedDriverId}
        open={!!selectedDriverId}
        onClose={handleClosePanel}
        onUpdate={handleRefresh}
      />
    </div>
  );
}
