"use client";

import { motion } from "framer-motion";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OrganizationsSearchBarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: boolean | null;
    onStatusFilterChange: (value: boolean | null) => void;
};

export function OrganizationsSearchBar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: OrganizationsSearchBarProps) {
    const hasFilters = statusFilter !== null;

    const getStatusLabel = () => {
        if (statusFilter === null) return "All";
        return statusFilter ? "Active" : "Inactive";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search organizations..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-9 h-10 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
                />
                {search && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSearchChange("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-muted"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>

            {/* Status filter dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "h-10 rounded-xl gap-2 border-border/50",
                            hasFilters && "border-primary/50 bg-primary/5"
                        )}
                    >
                        <Filter className={cn("h-4 w-4", hasFilters && "text-primary")} />
                        <span className="hidden sm:inline">Status:</span>
                        <span className={cn(hasFilters && "text-primary font-medium")}>
                            {getStatusLabel()}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={statusFilter === null ? "all" : statusFilter ? "active" : "inactive"}
                        onValueChange={(value) => {
                            if (value === "all") onStatusFilterChange(null);
                            else onStatusFilterChange(value === "active");
                        }}
                    >
                        <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
}
