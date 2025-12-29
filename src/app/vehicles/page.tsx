import { AnimatedPage } from "@/components/animated/animated-page";
import { VehicleList } from "@/app/vehicles/components/vehicle-list";

export const metadata = {
  title: "Vehicles | Fleet Pulse",
  description: "Manage your fleet vehicles",
};

export default function VehiclesPage() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage your fleet vehicles, view their details, and assign drivers.
          </p>
        </div>

        <VehicleList />
      </div>
    </AnimatedPage>
  );
}
