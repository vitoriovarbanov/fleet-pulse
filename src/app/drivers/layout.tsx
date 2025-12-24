import { type ReactNode } from "react";
import { AppLayout } from "@/components/layout/app-layout";

type DriversLayoutProps = {
    children: ReactNode;
};

export default function DriversLayout({ children }: DriversLayoutProps) {
    return <AppLayout>{children}</AppLayout>;
}
