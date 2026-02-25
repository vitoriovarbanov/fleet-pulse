import { type ReactNode } from "react";
import { AppLayout } from "@/components/layout/app-layout";

type OrganizationsLayoutProps = {
    children: ReactNode;
};

export default function OrganizationsLayout({ children }: OrganizationsLayoutProps) {
    return <AppLayout>{children}</AppLayout>;
}
