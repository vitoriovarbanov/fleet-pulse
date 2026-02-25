"use client";

import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/trpc/react";
import {
    X,
    Building2,
    Mail,
    Phone,
    Globe,
    Calendar,
    Users,
    Truck,
    CreditCard,
    AlertCircle,
    Pencil,
    Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedSkeleton } from "@/components/animated/animated-card";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { toast } from "sonner";

type OrganizationDetailPanelProps = {
    organizationId: string | null;
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onEdit?: () => void;
};

const PLAN_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    free: {
        label: "Free",
        bgColor: "bg-slate-500/10",
        textColor: "text-slate-600 dark:text-slate-400",
        borderColor: "border-slate-500/20",
    },
    basic: {
        label: "Basic",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-500/20",
    },
    premium: {
        label: "Premium",
        bgColor: "bg-violet-500/10",
        textColor: "text-violet-600 dark:text-violet-400",
        borderColor: "border-violet-500/20",
    },
    enterprise: {
        label: "Enterprise",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-500/20",
    },
};

const STATUS_CONFIG = {
    active: {
        label: "Active",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500/20",
        dotColor: "bg-emerald-500",
    },
    inactive: {
        label: "Inactive",
        bgColor: "bg-red-500/10",
        textColor: "text-red-600 dark:text-red-400",
        borderColor: "border-red-500/20",
        dotColor: "bg-red-500",
    },
};

const USER_STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
    PENDING: {
        label: "Pending",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-600 dark:text-amber-400",
    },
    ACTIVE: {
        label: "Active",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-600 dark:text-emerald-400",
    },
    INACTIVE: {
        label: "Inactive",
        bgColor: "bg-red-500/10",
        textColor: "text-red-600 dark:text-red-400",
    },
};

export function OrganizationDetailPanel({
    organizationId,
    open,
    onClose,
    onUpdate,
    onEdit,
}: OrganizationDetailPanelProps) {
    // Lock body scroll when panel is open
    useLockBodyScroll(open);

    const {
        data: organization,
        isLoading,
        error,
    } = api.organizations.getById.useQuery(
        { organizationId: organizationId! },
        { enabled: open && !!organizationId }
    );

    const resendInvitation = api.organizations.resendInvitation.useMutation({
        onSuccess: (result) => {
            toast.success(result.message);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleResendInvitation = (userId: string) => {
        resendInvitation.mutate({ userId });
    };

    const planConfig = organization
        ? PLAN_CONFIG[organization.planType] ?? PLAN_CONFIG.free
        : PLAN_CONFIG.free;
    const statusConfig = organization?.isActive ? STATUS_CONFIG.active : STATUS_CONFIG.inactive;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="relative">
                                <div className="relative h-32 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent">
                                    {/* Close button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onClose}
                                        className="absolute top-4 right-4 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white"
                                    >
                                        <X className="h-5 w-5" />
                                        <span className="sr-only">Close</span>
                                    </Button>

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                                </div>

                                {/* Title section */}
                                <div className="relative px-6 -mt-10 pb-4">
                                    <div className="flex items-end gap-4">
                                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                                            <Building2 className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            {isLoading ? (
                                                <>
                                                    <AnimatedSkeleton className="h-7 w-40 mb-1" />
                                                    <AnimatedSkeleton className="h-4 w-24" />
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-2xl font-bold">
                                                        {organization?.name}
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground font-mono">
                                                        {organization?.slug}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status and plan badges */}
                                    {!isLoading && organization && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="mt-4 flex items-center gap-3"
                                        >
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                                                    statusConfig.bgColor,
                                                    statusConfig.textColor,
                                                    statusConfig.borderColor
                                                )}
                                            >
                                                <div className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotColor)} />
                                                {statusConfig.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                                                    planConfig.bgColor,
                                                    planConfig.textColor,
                                                    planConfig.borderColor
                                                )}
                                            >
                                                <CreditCard className="h-3 w-3" />
                                                {planConfig.label} Plan
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                                {error ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                                        <p className="text-destructive">{error.message}</p>
                                    </div>
                                ) : isLoading ? (
                                    <LoadingSkeleton />
                                ) : organization ? (
                                    <>
                                        {/* Stats Section */}
                                        <Section title="Overview" icon={Building2}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <StatCard
                                                    icon={Users}
                                                    label="Total Users"
                                                    value={organization._count.users}
                                                />
                                                <StatCard
                                                    icon={Truck}
                                                    label="Vehicles"
                                                    value={organization._count.vehicles}
                                                />
                                            </div>
                                        </Section>

                                        {/* Contact Information Section */}
                                        <Section title="Contact Information" icon={Mail}>
                                            <InfoGrid>
                                                {organization.email && (
                                                    <InfoItem
                                                        icon={Mail}
                                                        label="Email"
                                                        value={organization.email}
                                                    />
                                                )}
                                                {organization.phone && (
                                                    <InfoItem
                                                        icon={Phone}
                                                        label="Phone"
                                                        value={organization.phone}
                                                    />
                                                )}
                                                <InfoItem
                                                    icon={Globe}
                                                    label="Country"
                                                    value={organization.country}
                                                />
                                            </InfoGrid>
                                        </Section>

                                        {/* Fleet Managers Section */}
                                        <Section title="Fleet Managers" icon={Users}>
                                            {organization.users.length > 0 ? (
                                                <div className="space-y-3">
                                                    {organization.users.map((user) => {
                                                        const userStatusConfig = USER_STATUS_CONFIG[user.status] ?? USER_STATUS_CONFIG.ACTIVE;
                                                        return (
                                                            <motion.div
                                                                key={user.id}
                                                                whileHover={{ scale: 1.01 }}
                                                                className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
                                                            >
                                                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-card text-sm font-semibold">
                                                                    {user.firstName?.[0] ?? ""}{user.lastName?.[0] ?? "?"}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold truncate">
                                                                        {user.firstName} {user.lastName}
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground truncate">
                                                                        {user.email}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={cn(
                                                                            "px-2 py-0.5 rounded text-xs font-medium",
                                                                            userStatusConfig.bgColor,
                                                                            userStatusConfig.textColor
                                                                        )}
                                                                    >
                                                                        {userStatusConfig.label}
                                                                    </span>
                                                                    {user.status === "PENDING" && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleResendInvitation(user.id)}
                                                                            disabled={resendInvitation.isPending}
                                                                            className="h-8 w-8 rounded-lg"
                                                                            title="Resend invitation"
                                                                        >
                                                                            <Send className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No fleet managers assigned yet.
                                                </p>
                                            )}
                                        </Section>

                                        {/* Record Information */}
                                        <Section title="Record Information" icon={Calendar}>
                                            <InfoGrid>
                                                <InfoItem
                                                    icon={Calendar}
                                                    label="Created"
                                                    value={new Date(organization.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                />
                                                <InfoItem
                                                    icon={Calendar}
                                                    label="Last Updated"
                                                    value={new Date(organization.updatedAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                />
                                            </InfoGrid>
                                        </Section>
                                    </>
                                ) : null}
                            </div>

                            {/* Footer actions */}
                            {!isLoading && organization && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 border-t border-border bg-gradient-to-t from-muted/30 to-transparent"
                                >
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-xl"
                                            onClick={onClose}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl"
                                            onClick={onEdit}
                                        >
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function Section({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: typeof Users;
    children: React.ReactNode;
}) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
        >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            <div className="bg-muted/30 rounded-xl p-4">{children}</div>
        </motion.section>
    );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-card">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Users;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-card">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                    <AnimatedSkeleton className="h-4 w-32" />
                    <div className="bg-muted/30 rounded-xl p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex items-start gap-3">
                                    <AnimatedSkeleton className="h-8 w-8 rounded-lg" />
                                    <div className="flex-1">
                                        <AnimatedSkeleton className="h-3 w-16 mb-1" />
                                        <AnimatedSkeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
