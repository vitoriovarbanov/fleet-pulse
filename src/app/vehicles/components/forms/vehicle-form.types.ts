import { z } from "zod/v3";
import {
  Truck,
  Container,
  Bus,
  Car,
  CheckCircle,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";

// ============================================
// ENUMS (matching Prisma/tRPC enums)
// ============================================

export const vehicleTypeSchema = z.enum(["TRUCK", "TRAILER", "VAN", "BUS"]);

export const vehicleStatusSchema = z.enum([
  "ACTIVE",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
]);

export type VehicleType = z.infer<typeof vehicleTypeSchema>;
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;

// ============================================
// TYPE CONFIGURATIONS (for UI display)
// ============================================

export type VehicleTypeConfig = {
  value: VehicleType;
  label: string;
  icon: LucideIcon;
  color: "primary" | "violet" | "amber" | "emerald";
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export const VEHICLE_TYPES: VehicleTypeConfig[] = [
  {
    value: "TRUCK",
    label: "Truck",
    icon: Truck,
    color: "primary",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/20",
  },
  {
    value: "TRAILER",
    label: "Trailer",
    icon: Container,
    color: "violet",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-500/20",
  },
  {
    value: "VAN",
    label: "Van",
    icon: Car,
    color: "amber",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/20",
  },
  {
    value: "BUS",
    label: "Bus",
    icon: Bus,
    color: "emerald",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
] as const;

export type VehicleStatusConfig = {
  value: VehicleStatus;
  label: string;
  icon: LucideIcon;
  color: "emerald" | "amber" | "red";
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export const VEHICLE_STATUS_OPTIONS: VehicleStatusConfig[] = [
  {
    value: "ACTIVE",
    label: "Active",
    icon: CheckCircle,
    color: "emerald",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
    icon: Wrench,
    color: "amber",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/20",
  },
  {
    value: "OUT_OF_SERVICE",
    label: "Out of Service",
    icon: XCircle,
    color: "red",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/20",
  },
] as const;

// Helper functions to get config by value
export function getVehicleTypeConfig(
  type: VehicleType
): VehicleTypeConfig | undefined {
  return VEHICLE_TYPES.find((t) => t.value === type);
}

export function getVehicleStatusConfig(
  status: VehicleStatus
): VehicleStatusConfig | undefined {
  return VEHICLE_STATUS_OPTIONS.find((s) => s.value === status);
}

// ============================================
// FORM STEP SCHEMAS
// ============================================

/**
 * Step 1: Basic vehicle information
 * - Plate number, make, model, year, type
 */
export const basicVehicleInfoStepSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Plate number is required")
    .max(20, "Max 20 characters")
    .transform((val) => val.toUpperCase().trim()),
  make: z
    .string()
    .min(1, "Make is required")
    .max(100, "Max 100 characters"),
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Max 100 characters"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the far future")
    .optional()
    .nullable(),
  type: vehicleTypeSchema,
});

/**
 * Step 2: Technical details and image
 * - VIN, notes, image
 */
export const technicalDetailsStepSchema = z.object({
  vin: z
    .string()
    .length(17, "VIN must be exactly 17 characters")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val?.toUpperCase())),
  notes: z
    .string()
    .max(2000, "Max 2000 characters")
    .optional()
    .or(z.literal("")),
  imageKey: z.string().nullable().optional(),
});

// ============================================
// COMBINED FORM SCHEMAS
// ============================================

/**
 * Create vehicle form schema (combines steps 1 & 2)
 */
export const createVehicleFormSchema = basicVehicleInfoStepSchema.merge(
  technicalDetailsStepSchema
);

/**
 * Update vehicle form schema (all fields optional except vehicleId)
 */
export const updateVehicleFormSchema = z
  .object({
    vehicleId: z.string().min(1, "Vehicle ID is required"),
  })
  .merge(basicVehicleInfoStepSchema.partial())
  .merge(technicalDetailsStepSchema.partial())
  .merge(
    z.object({
      status: vehicleStatusSchema.optional(),
    })
  );

// ============================================
// INFERRED TYPES
// ============================================

export type BasicVehicleInfoStepValues = z.infer<
  typeof basicVehicleInfoStepSchema
>;
export type TechnicalDetailsStepValues = z.infer<
  typeof technicalDetailsStepSchema
>;
export type CreateVehicleFormValues = z.input<typeof createVehicleFormSchema>;
export type UpdateVehicleFormValues = z.input<typeof updateVehicleFormSchema>;

// ============================================
// DEFAULT VALUES
// ============================================

export const createVehicleDefaultValues: Partial<CreateVehicleFormValues> = {
  plateNumber: "",
  make: "",
  model: "",
  year: null,
  type: "TRUCK",
  vin: "",
  notes: "",
  imageKey: null,
};

export const getUpdateVehicleDefaultValues = (
  vehicleId: string
): Partial<UpdateVehicleFormValues> => ({
  vehicleId,
  plateNumber: "",
  make: "",
  model: "",
  year: null,
  type: "TRUCK",
  vin: "",
  notes: "",
  imageKey: null,
  status: undefined,
});

// ============================================
// STEP FIELD MAPPINGS (for validation)
// ============================================

export const STEP_1_FIELDS: Array<keyof BasicVehicleInfoStepValues> = [
  "plateNumber",
  "make",
  "model",
  "year",
  "type",
];

export const STEP_2_FIELDS: Array<keyof TechnicalDetailsStepValues> = [
  "vin",
  "notes",
  "imageKey",
];

// ============================================
// POPULAR VEHICLE MAKES (for autocomplete)
// ============================================

export const POPULAR_VEHICLE_MAKES = [
  "Mercedes-Benz",
  "Volvo",
  "MAN",
  "Scania",
  "DAF",
  "Iveco",
  "Renault Trucks",
  "Kenworth",
  "Peterbilt",
  "Freightliner",
  "Ford",
  "Volkswagen",
  "Isuzu",
  "Hino",
] as const;

// ============================================
// POPULAR VEHICLE MODELS BY MAKE
// ============================================

export const POPULAR_VEHICLE_MODELS: Record<string, string[]> = {
  "Mercedes-Benz": ["Actros", "Arocs", "Atego", "Econic", "Sprinter"],
  Volvo: ["FH", "FH16", "FM", "FMX", "FL", "FE"],
  MAN: ["TGX", "TGS", "TGM", "TGL", "TGE"],
  Scania: ["R-Series", "S-Series", "G-Series", "P-Series", "L-Series"],
  DAF: ["XF", "XG", "XG+", "CF", "LF"],
  Iveco: ["S-WAY", "X-WAY", "Eurocargo", "Daily"],
  "Renault Trucks": ["T", "T High", "C", "K", "D", "D Wide"],
  Ford: ["Transit", "E-Transit", "F-150", "F-250", "F-350"],
  Volkswagen: ["Crafter", "Transporter", "Caddy"],
};
