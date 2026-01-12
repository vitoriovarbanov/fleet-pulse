"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "@/trpc/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { VehiclesPageHeader } from "./vehicles-page-header";
import { VehiclesStatsCards } from "./vehicles-stats-cards";
import { VehiclesSearchBar } from "./vehicles-search-bar";
import { PremiumVehicleCard } from "./premium-vehicle-card";
import { VehicleDetailPanel } from "./vehicle-detail-panel";
import { VehiclesEmptyState } from "./vehicles-empty-state";
import {
  VehiclesLoadingSkeleton,
  VehiclesGridSkeleton,
} from "./vehicles-loading-skeleton";
import { PremiumCreateVehicleDialog } from "./forms/premium/premium-create-vehicle-dialog";
import { PremiumEditVehicleDialog } from "./forms/premium/premium-edit-vehicle-dialog";

import type { VehicleCard as VehicleCardType } from "@/server/api/routers/vehicles/repository/vehicles.repository.types";
import type { VehicleType, VehicleStatus } from "./forms/vehicle-form.types";

export function PremiumVehicleList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<VehicleType | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    api.vehicles.list.useQuery(
      { search: search || undefined, limit: 100 },
      {
        staleTime: 30000,
        placeholderData: (previousData) => previousData,
      }
    );

  const isInitialLoading = isLoading && !data;

  // Filter vehicles based on local filters
  const filteredVehicles = useMemo(() => {
    if (!data?.vehicles) return [];

    return data.vehicles.filter((vehicle) => {
      // Status filter
      if (statusFilter && vehicle.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter && vehicle.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [data?.vehicles, statusFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const vehicles = data?.vehicles ?? [];
    return {
      total: vehicles.length,
      active: vehicles.filter((v) => v.status === "ACTIVE").length,
      maintenance: vehicles.filter((v) => v.status === "MAINTENANCE").length,
      outOfService: vehicles.filter((v) => v.status === "OUT_OF_SERVICE")
        .length,
    };
  }, [data?.vehicles]);

  const handleVehicleClick = (vehicle: VehicleCardType) => {
    setSelectedVehicleId(vehicle.id);
  };

  const handleClosePanel = () => {
    setSelectedVehicleId(null);
  };

  const handleRefresh = () => {
    void refetch();
  };

  const handleClearSearch = () => {
    setSearch("");
    setStatusFilter(null);
    setTypeFilter(null);
  };

  const handleAddVehicle = () => {
    setCreateDialogOpen(true);
  };

  const handleEditVehicle = (vehicleId: string) => {
    setEditingVehicleId(vehicleId);
    setEditDialogOpen(true);
    // Close the detail panel when opening edit dialog
    setSelectedVehicleId(null);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingVehicleId(null);
    }
  };

  const isSearching =
    search.length > 0 || statusFilter !== null || typeFilter !== null;

  if (isInitialLoading) {
    return <VehiclesLoadingSkeleton />;
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
      <VehiclesPageHeader
        totalVehicles={stats.total}
        activeVehicles={stats.active}
        onAddVehicle={handleAddVehicle}
      />

      {/* Stats Cards */}
      {stats.total > 0 && (
        <VehiclesStatsCards
          totalVehicles={stats.total}
          activeVehicles={stats.active}
          maintenanceVehicles={stats.maintenance}
          outOfServiceVehicles={stats.outOfService}
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <VehiclesSearchBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
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
      {data && data.vehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span>
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredVehicles.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {data.vehicles.length}
            </span>{" "}
            vehicles
          </span>
          {isSearching && (
            <span className="text-muted-foreground/60">• filtered</span>
          )}
        </motion.div>
      )}

      {isFetching && data ? (
        <VehiclesGridSkeleton />
      ) : filteredVehicles.length === 0 ? (
        <VehiclesEmptyState
          isSearching={isSearching}
          searchQuery={search}
          onAddVehicle={handleAddVehicle}
          onClearSearch={handleClearSearch}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredVehicles.map((vehicle, index) => (
            <PremiumVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              index={index}
              onClick={() => handleVehicleClick(vehicle)}
            />
          ))}
        </motion.div>
      )}

      <VehicleDetailPanel
        vehicleId={selectedVehicleId}
        open={!!selectedVehicleId}
        onClose={handleClosePanel}
        onUpdate={handleRefresh}
        onEdit={() => selectedVehicleId && handleEditVehicle(selectedVehicleId)}
      />

      <PremiumCreateVehicleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <PremiumEditVehicleDialog
        vehicleId={editingVehicleId}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
      />
    </div>
  );
}
