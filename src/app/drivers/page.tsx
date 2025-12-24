import { AnimatedPage } from "@/components/animated/animated-page";
import { DriverList } from "@/components/features/drivers/driver-list";

export const metadata = {
  title: "Drivers | Fleet Pulse",
  description: "Manage your fleet drivers",
};

export default function DriversPage() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">
            Manage your fleet drivers, view their details, and assign vehicles.
          </p>
        </div>

        <DriverList />
      </div>
    </AnimatedPage>
  );
}
