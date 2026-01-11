"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
  ChevronDown,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type VehicleStatus,
  type VehicleType,
  VEHICLE_STATUS_OPTIONS,
  VEHICLE_TYPES,
} from "./forms/vehicle-form.types";

type VehiclesSearchBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: VehicleStatus | null;
  onStatusFilterChange: (status: VehicleStatus | null) => void;
  typeFilter: VehicleType | null;
  onTypeFilterChange: (type: VehicleType | null) => void;
};

const statusOptions: {
  value: VehicleStatus | null;
  label: string;
  color: string;
}[] = [
  { value: null, label: "All Status", color: "" },
  ...VEHICLE_STATUS_OPTIONS.map((s) => ({
    value: s.value,
    label: s.label,
    color:
      s.color === "emerald"
        ? "bg-emerald-500"
        : s.color === "amber"
          ? "bg-amber-500"
          : "bg-red-500",
  })),
];

const typeOptions: {
  value: VehicleType | null;
  label: string;
  icon: typeof Truck;
}[] = [
  { value: null, label: "All Types", icon: Truck },
  ...VEHICLE_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
    icon: t.icon,
  })),
];

export function VehiclesSearchBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: VehiclesSearchBarProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFiltersCount =
    (statusFilter ? 1 : 0) + (typeFilter ? 1 : 0);

  const clearFilters = () => {
    onStatusFilterChange(null);
    onTypeFilterChange(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      {/* Search input */}
      <div className="relative flex-1 min-w-0 max-w-md">
        <motion.div
          animate={{
            boxShadow: isFocused
              ? "0 0 0 3px oklch(0.62 0.18 250 / 0.15), 0 4px 12px oklch(0.62 0.18 250 / 0.1)"
              : "0 0 0 0px transparent",
          }}
          transition={{ duration: 0.2 }}
          className="relative rounded-xl"
        >
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200" />
          <Input
            placeholder="Search by plate, make, model, VIN..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "pl-10 pr-10 h-11 w-full rounded-xl border-border/50 bg-card",
              "placeholder:text-muted-foreground/60",
              "focus:border-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0",
              "transition-all duration-200"
            )}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        {/* Status filter dropdown */}
        <div ref={statusRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsTypeOpen(false);
            }}
            className={cn(
              "h-11 px-3 rounded-xl border-border/50 hover:border-primary/50",
              "bg-card hover:bg-accent/50 transition-all duration-200",
              statusFilter && "border-primary/30 bg-primary/5"
            )}
          >
            {statusFilter ? (
              <>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mr-2",
                    statusOptions.find((s) => s.value === statusFilter)?.color
                  )}
                />
                {statusOptions.find((s) => s.value === statusFilter)?.label}
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Status
              </>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 ml-2 transition-transform duration-200",
                isStatusOpen && "rotate-180"
              )}
            />
          </Button>

          <AnimatePresence>
            {isStatusOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-48 z-50 rounded-xl border border-border/50 bg-card shadow-xl shadow-black/10 overflow-hidden"
              >
                <div className="p-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value ?? "all"}
                      onClick={() => {
                        onStatusFilterChange(option.value);
                        setIsStatusOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        statusFilter === option.value
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50 text-foreground"
                      )}
                    >
                      {option.color && (
                        <div
                          className={cn("h-2 w-2 rounded-full", option.color)}
                        />
                      )}
                      <span className="flex-1 text-left">{option.label}</span>
                      {statusFilter === option.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Type filter dropdown */}
        <div ref={typeRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsTypeOpen(!isTypeOpen);
              setIsStatusOpen(false);
            }}
            className={cn(
              "h-11 px-3 rounded-xl border-border/50 hover:border-primary/50",
              "bg-card hover:bg-accent/50 transition-all duration-200",
              typeFilter && "border-primary/30 bg-primary/5"
            )}
          >
            {typeFilter ? (
              <>
                {(() => {
                  const TypeIcon =
                    typeOptions.find((t) => t.value === typeFilter)?.icon ??
                    Truck;
                  return <TypeIcon className="h-4 w-4 mr-2" />;
                })()}
                {typeOptions.find((t) => t.value === typeFilter)?.label}
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Type
              </>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 ml-2 transition-transform duration-200",
                isTypeOpen && "rotate-180"
              )}
            />
          </Button>

          <AnimatePresence>
            {isTypeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-48 z-50 rounded-xl border border-border/50 bg-card shadow-xl shadow-black/10 overflow-hidden"
              >
                <div className="p-1">
                  {typeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value ?? "all"}
                        onClick={() => {
                          onTypeFilterChange(option.value);
                          setIsTypeOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          typeFilter === option.value
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50 text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {typeFilter === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear filters button */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-11 px-3 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear ({activeFiltersCount})
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
