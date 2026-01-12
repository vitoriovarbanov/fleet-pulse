'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { VehicleWithLocation } from '@/server/api/routers/vehicles/repository/vehicles.repository.types';

type DashboardContextType = {
  // Selected vehicle/driver for highlighting
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;

  // Map viewport state
  mapCenter: { latitude: number; longitude: number } | null;
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void;

  // Zoom to a specific vehicle
  focusVehicle: (vehicle: VehicleWithLocation) => void;

  // Filter state
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const focusVehicle = useCallback((vehicle: VehicleWithLocation) => {
    if (vehicle.latitude && vehicle.longitude) {
      setSelectedVehicleId(vehicle.id);
      setMapCenter({ latitude: vehicle.latitude, longitude: vehicle.longitude });
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        selectedVehicleId,
        setSelectedVehicleId,
        mapCenter,
        setMapCenter,
        focusVehicle,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
