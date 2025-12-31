"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  Check,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DriverStatus =
  | "AVAILABLE"
  | "ON_DUTY"
  | "OFF_DUTY"
  | "ON_REST"
  | "SICK_LEAVE"
  | "VACATION";

type DriversSearchBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: DriverStatus | null;
  onStatusFilterChange: (status: DriverStatus | null) => void;
  availabilityFilter: boolean | null;
  onAvailabilityFilterChange: (available: boolean | null) => void;
};

const statusOptions: { value: DriverStatus | null; label: string; color: string }[] = [
  { value: null, label: "All Status", color: "" },
  { value: "AVAILABLE", label: "Available", color: "bg-emerald-500" },
  { value: "ON_DUTY", label: "On Duty", color: "bg-primary" },
  { value: "OFF_DUTY", label: "Off Duty", color: "bg-muted-foreground" },
  { value: "ON_REST", label: "On Rest", color: "bg-amber-500" },
  { value: "SICK_LEAVE", label: "Sick Leave", color: "bg-red-500" },
  { value: "VACATION", label: "Vacation", color: "bg-violet-500" },
];

const availabilityOptions: { value: boolean | null; label: string }[] = [
  { value: null, label: "Any Availability" },
  { value: true, label: "Available Only" },
  { value: false, label: "Unavailable Only" },
];

export function DriversSearchBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  availabilityFilter,
  onAvailabilityFilterChange,
}: DriversSearchBarProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (availabilityRef.current && !availabilityRef.current.contains(event.target as Node)) {
        setIsAvailabilityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFiltersCount =
    (statusFilter ? 1 : 0) + (availabilityFilter !== null ? 1 : 0);

  const clearFilters = () => {
    onStatusFilterChange(null);
    onAvailabilityFilterChange(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
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
            placeholder="Search drivers..."
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
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Status filter dropdown */}
        <div ref={statusRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsAvailabilityOpen(false);
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
                        <div className={cn("h-2 w-2 rounded-full", option.color)} />
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

        {/* Availability filter dropdown */}
        <div ref={availabilityRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAvailabilityOpen(!isAvailabilityOpen);
              setIsStatusOpen(false);
            }}
            className={cn(
              "h-11 px-3 rounded-xl border-border/50 hover:border-primary/50",
              "bg-card hover:bg-accent/50 transition-all duration-200",
              availabilityFilter !== null && "border-primary/30 bg-primary/5"
            )}
          >
            {availabilityFilter !== null ? (
              <>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mr-2",
                    availabilityFilter ? "bg-emerald-500" : "bg-muted-foreground"
                  )}
                />
                {availabilityOptions.find((a) => a.value === availabilityFilter)?.label}
              </>
            ) : (
              "Availability"
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 ml-2 transition-transform duration-200",
                isAvailabilityOpen && "rotate-180"
              )}
            />
          </Button>

          <AnimatePresence>
            {isAvailabilityOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-48 z-50 rounded-xl border border-border/50 bg-card shadow-xl shadow-black/10 overflow-hidden"
              >
                <div className="p-1">
                  {availabilityOptions.map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => {
                        onAvailabilityFilterChange(option.value);
                        setIsAvailabilityOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        availabilityFilter === option.value
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <span className="flex-1 text-left">{option.label}</span>
                      {availabilityFilter === option.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  ))}
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
