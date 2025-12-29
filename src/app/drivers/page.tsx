import { AnimatedPage } from "@/components/animated/animated-page";
import { PremiumDriverList } from "@/app/drivers/components/premium-driver-list";

export const metadata = {
  title: "Drivers | Fleet Pulse",
  description: "Manage your fleet drivers",
};

export default function DriversPage() {
  return (
    <AnimatedPage>
      <PremiumDriverList />
    </AnimatedPage>
  );
}
