'use client';

import { DashboardProvider } from './context/dashboard-context';
import { DashboardLayout } from './components/dashboard-layout';
import { DriverSidebar } from './components/driver-sidebar';
import { FleetMap } from './components/fleet-map';
import { MobileDriverSheet } from './components/mobile-driver-sheet';
import { useDashboardData } from './hooks/use-dashboard-data';

function DashboardContent() {
  const { vehicles, isLoading, isFetching, refetch } = useDashboardData();

  return (
    <DashboardLayout>
      {/* Desktop sidebar - hidden on mobile */}
      <DriverSidebar
        vehicles={vehicles}
        isLoading={isLoading}
        isFetching={isFetching}
        onRefresh={() => refetch()}
        className="hidden md:flex"
      />

      {/* Map - full width on mobile, flex-1 on desktop */}
      <div className="flex-1 relative">
        <FleetMap
          vehicles={vehicles}
          isLoading={isLoading}
          className="h-full"
        />

        {/* Mobile bottom sheet - visible only on mobile */}
        <div className="md:hidden">
          <MobileDriverSheet
            vehicles={vehicles}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
