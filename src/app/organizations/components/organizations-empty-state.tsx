"use client";

import { motion } from "framer-motion";
import { Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrganizationsEmptyStateProps = {
    isSearching?: boolean;
    searchQuery?: string;
    onAddOrganization?: () => void;
    onClearSearch?: () => void;
};

export function OrganizationsEmptyState({
    isSearching = false,
    searchQuery,
    onAddOrganization,
    onClearSearch,
}: OrganizationsEmptyStateProps) {
    if (isSearching) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative mb-6"
                >
                    <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center">
                        <Search className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                </motion.div>

                <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-semibold mb-2"
                >
                    No organizations found
                </motion.h3>

                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-muted-foreground mb-6 max-w-md"
                >
                    {searchQuery ? (
                        <>
                            No organizations match &quot;<span className="font-medium">{searchQuery}</span>&quot;.
                            Try adjusting your search or filters.
                        </>
                    ) : (
                        "No organizations match your current filters. Try adjusting your search criteria."
                    )}
                </motion.p>

                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="outline"
                        onClick={onClearSearch}
                        className="rounded-xl"
                    >
                        Clear search
                    </Button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative mb-6"
            >
                {/* Decorative rings */}
                <div className="absolute inset-0 animate-pulse">
                    <div className="absolute inset-0 rounded-full bg-primary/5 scale-150" />
                    <div className="absolute inset-2 rounded-full bg-primary/10 scale-125" />
                </div>

                <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-primary/20">
                    <Building2 className="h-12 w-12 text-primary/60" />
                </div>
            </motion.div>

            <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-semibold mb-2"
            >
                No organizations yet
            </motion.h3>

            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-muted-foreground mb-8 max-w-md"
            >
                Get started by creating your first organization. Each organization
                can have its own fleet managers, drivers, and vehicles.
            </motion.p>

            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    onClick={onAddOrganization}
                    className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                </Button>
            </motion.div>
        </motion.div>
    );
}
