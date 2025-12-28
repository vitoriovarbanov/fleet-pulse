"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/animated/animated-list";
import { AnimatedSkeleton } from "@/components/animated/animated-card";
import { VehicleCard } from "./vehicle-card";
import { VehicleDetailModal } from "./vehicle-detail-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VehicleCard as VehicleCardType } from "@/server/api/routers/vehicles/repository/vehicles.repository.types";

export function VehicleList() {
  const [search, setSearch] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    api.vehicles.list.useQuery(
      { search: search || undefined, limit: 50 },
      { staleTime: 30000 }
    );

  const handleVehicleClick = (vehicle: VehicleCardType) => {
    setSelectedVehicleId(vehicle.id);
  };

  const handleCloseModal = () => {
    setSelectedVehicleId(null);
  };

  const handleRefresh = () => {
    void refetch();
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">
          Error loading vehicles: {error.message}
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and actions bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimatedSkeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {/* Vehicle cards grid */}
      {!isLoading && data && (
        <>
          {data.vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {search
                  ? "No vehicles found matching your search."
                  : "No vehicles yet."}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add your first vehicle
              </Button>
            </div>
          ) : (
            <AnimatedList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.vehicles.map((vehicle) => (
                <AnimatedListItem key={vehicle.id}>
                  <VehicleCard
                    vehicle={vehicle}
                    onClick={() => handleVehicleClick(vehicle)}
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedVehicleId && (
        <VehicleDetailModal
          vehicleId={selectedVehicleId}
          open={!!selectedVehicleId}
          onClose={handleCloseModal}
          onUpdate={handleRefresh}
        />
      )}
    </div>
  );
}
