'use client';

import { useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDashboard } from '../context/dashboard-context';
import { CompactDriverCard } from './compact-driver-card';
import type { VehicleWithLocation } from '@/server/api/routers/vehicles/repository/vehicles.repository.types';

type MobileDriverSheetProps = {
  vehicles: VehicleWithLocation[];
  isLoading?: boolean;
  className?: string;
};

const statusFilters = [
  { value: null, label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_DUTY', label: 'On Duty' },
];

export function MobileDriverSheet({ vehicles, isLoading, className }: MobileDriverSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => {
        const driverName = v.assignedDriver?.user
          ? `${v.assignedDriver.user.firstName} ${v.assignedDriver.user.lastName}`.toLowerCase()
          : '';
        return (
          v.plateNumber.toLowerCase().includes(query) ||
          v.make.toLowerCase().includes(query) ||
          driverName.includes(query)
        );
      });
    }

    if (statusFilter) {
      if (statusFilter === 'ACTIVE') {
        result = result.filter(v => v.status === 'ACTIVE');
      } else if (statusFilter === 'ON_DUTY') {
        result = result.filter(v => v.assignedDriver?.driverStatus === statusFilter);
      }
    }

    return result;
  }, [vehicles, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const assignedDrivers = vehicles.filter(v => v.assignedDriver).length;
    return { activeVehicles, assignedDrivers };
  }, [vehicles]);

  const handleVehicleClick = (vehicle: VehicleWithLocation) => {
    focusVehicle(vehicle);
    setIsOpen(false); // Close drawer after selection on mobile
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      snapPoints={[0.15, 0.5, 0.9]}
      activeSnapPoint={isOpen ? undefined : 0.15}
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
            'bg-background border-t border-border rounded-t-2xl',
            'max-h-[90vh] outline-none',
            className
          )}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <Drawer.Handle className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Peek header (always visible) */}
          <div className="px-4 pb-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-medium">{stats.activeVehicles}</span>
                  <span className="text-muted-foreground text-xs">active</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">{stats.assignedDrivers}</span>
                  <span className="text-muted-foreground text-xs">drivers</span>
                </div>
              </div>
              <ChevronUp
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Search and filters */}
                <div className="px-4 pb-3 space-y-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {statusFilters.map(filter => (
                      <Button
                        key={filter.value ?? 'all'}
                        variant={statusFilter === filter.value ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setStatusFilter(filter.value)}
                        className="h-7 px-2.5 text-xs flex-shrink-0"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Vehicle list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-xl p-3 bg-muted/50 animate-pulse">
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
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No vehicles found
                    </div>
                  ) : (
                    filteredVehicles.map((vehicle, index) => (
                      <CompactDriverCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        isSelected={selectedVehicleId === vehicle.id}
                        onClick={() => handleVehicleClick(vehicle)}
                        index={index}
                      />
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground text-center">
                    {filteredVehicles.length} vehicles
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
