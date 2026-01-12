'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDashboard } from '../context/dashboard-context';
import { CompactDriverCard } from './compact-driver-card';
import type { VehicleWithLocation } from '@/server/api/routers/vehicles/repository/vehicles.repository.types';

type DriverSidebarProps = {
  vehicles: VehicleWithLocation[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  className?: string;
};

const statusFilters = [
  { value: null, label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_DUTY', label: 'On Duty' },
  { value: 'AVAILABLE', label: 'Available' },
];

export function DriverSidebar({
  vehicles,
  isLoading,
  isFetching,
  onRefresh,
  className,
}: DriverSidebarProps) {
  const {
    selectedVehicleId,
    focusVehicle,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useDashboard();

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => {
        const driverName = v.assignedDriver?.user
          ? `${v.assignedDriver.user.firstName} ${v.assignedDriver.user.lastName}`.toLowerCase()
          : '';
        return (
          v.plateNumber.toLowerCase().includes(query) ||
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          driverName.includes(query)
        );
      });
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'ACTIVE') {
        result = result.filter(v => v.status === 'ACTIVE');
      } else if (statusFilter === 'ON_DUTY' || statusFilter === 'AVAILABLE') {
        result = result.filter(v => v.assignedDriver?.driverStatus === statusFilter);
      }
    }

    return result;
  }, [vehicles, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const assignedDrivers = vehicles.filter(v => v.assignedDriver).length;
    return { activeVehicles, assignedDrivers, total: vehicles.length };
  }, [vehicles]);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background border-r border-border',
        'w-full md:w-60 lg:w-80',
        className
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Fleet Overview</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8 w-8"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span>{stats.activeVehicles} active</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-emerald-500" />
            <span>{stats.assignedDrivers} drivers</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers or vehicles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {statusFilters.map(filter => (
            <Button
              key={filter.value ?? 'all'}
              variant={statusFilter === filter.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'h-7 px-2.5 text-xs flex-shrink-0',
                statusFilter === filter.value && 'shadow-sm'
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Vehicle/Driver list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-3 bg-muted/50 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filteredVehicles.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No vehicles found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'No vehicles match the current filter'}
            </p>
          </motion.div>
        ) : (
          // Vehicle cards
          filteredVehicles.map((vehicle, index) => (
            <CompactDriverCard
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicleId === vehicle.id}
              onClick={() => focusVehicle(vehicle)}
              index={index}
            />
          ))
        )}
      </div>

      {/* Footer with count */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </p>
      </div>
    </div>
  );
}
