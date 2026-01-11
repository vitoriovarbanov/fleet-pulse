import { AnimatedPage } from "@/components/animated/animated-page";
import { PremiumVehicleList } from "@/app/vehicles/components/premium-vehicle-list";

export const metadata = {
  title: "Vehicles | Fleet Pulse",
  description: "Manage your fleet vehicles",
};

export default function VehiclesPage() {
  return (
    <AnimatedPage>
      <PremiumVehicleList />
    </AnimatedPage>
  );
}
