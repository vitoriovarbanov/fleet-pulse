import { AnimatedPage } from "@/components/animated/animated-page";
import { OrganizationsList } from "./components/organizations-list";

export const metadata = {
    title: "Organizations | Fleet Pulse",
    description: "Manage organizations",
};

export default function OrganizationsPage() {
    return (
        <AnimatedPage>
            <OrganizationsList />
        </AnimatedPage>
    );
}
