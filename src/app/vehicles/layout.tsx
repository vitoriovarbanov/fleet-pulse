import { type ReactNode } from "react";
import { AppLayout } from "@/components/layout/app-layout";

type VehiclesLayoutProps = {
    children: ReactNode;
};

export default function VehiclesLayout({ children }: VehiclesLayoutProps) {
    return <AppLayout>{children}</AppLayout>;
}
