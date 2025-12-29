import { z } from "zod/v3";

export const euLicenseCategorySchema = z.enum([
  "C1",
  "C1E",
  "C",
  "CE",
  "D1",
  "D1E",
  "D",
  "DE",
]);

export const driverStatusSchema = z.enum([
  "AVAILABLE",
  "ON_DUTY",
  "OFF_DUTY",
  "ON_REST",
  "SICK_LEAVE",
  "VACATION",
]);

export type EuLicenseCategory = z.infer<typeof euLicenseCategorySchema>;
export type DriverStatus = z.infer<typeof driverStatusSchema>;

export const LICENSE_CATEGORIES = [
  { value: "C1" as const, label: "C1", description: "Vehicles 3.5-7.5t" },
  { value: "C1E" as const, label: "C1E", description: "C1 + trailer >750kg" },
  { value: "C" as const, label: "C", description: "Vehicles >7.5t" },
  { value: "CE" as const, label: "CE", description: "C + trailer >750kg" },
  { value: "D1" as const, label: "D1", description: "Buses up to 16 passengers" },
  { value: "D1E" as const, label: "D1E", description: "D1 + trailer >750kg" },
  { value: "D" as const, label: "D", description: "Buses >16 passengers" },
  { value: "DE" as const, label: "DE", description: "D + trailer >750kg" },
] as const;

export const DRIVER_STATUS_OPTIONS = [
  { value: "AVAILABLE" as const, label: "Available", color: "emerald" },
  { value: "ON_DUTY" as const, label: "On Duty", color: "primary" },
  { value: "OFF_DUTY" as const, label: "Off Duty", color: "muted" },
  { value: "ON_REST" as const, label: "On Rest", color: "amber" },
  { value: "SICK_LEAVE" as const, label: "Sick Leave", color: "red" },
  { value: "VACATION" as const, label: "Vacation", color: "violet" },
] as const;


export const basicInfoStepSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "Max 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Max 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Valid email required")
    .max(255, "Max 255 characters"),
  phoneNumber: z
    .string()
    .max(20, "Max 20 characters")
    .optional()
    .or(z.literal("")),
});

export const licenseDetailsStepSchema = z
  .object({
    licenseNumber: z
      .string()
      .min(1, "License number is required")
      .max(50, "Max 50 characters"),
    licenseCountry: z
      .string()
      .length(2, "Use 2-letter country code (e.g., DE)")
      .default("DE"),
    licenseIssueDate: z.coerce.date({
      required_error: "Issue date is required",
      invalid_type_error: "Invalid date",
    }),
    licenseExpiryDate: z.coerce.date({
      required_error: "Expiry date is required",
      invalid_type_error: "Invalid date",
    }),
    licenseCategories: z
      .array(euLicenseCategorySchema)
      .min(1, "Select at least one license category"),
    medicalCertIssueDate: z.coerce.date().optional().nullable(),
    medicalCertExpiryDate: z.coerce.date().optional().nullable(),
    yearsExperience: z.coerce
      .number()
      .int()
      .min(0, "Must be 0 or more")
      .max(70, "Max 70 years")
      .optional()
      .nullable(),
    adrCertNumber: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
    adrExpiryDate: z.coerce.date().optional().nullable(),
  })
  .refine((data) => data.licenseExpiryDate > new Date(), {
    message: "License expiry date must be in the future",
    path: ["licenseExpiryDate"],
  })
  .refine(
    (data) => {
      if (data.medicalCertIssueDate && data.medicalCertExpiryDate) {
        return data.medicalCertExpiryDate > data.medicalCertIssueDate;
      }
      return true;
    },
    {
      message: "Medical cert expiry must be after issue date",
      path: ["medicalCertExpiryDate"],
    }
  );

export const employmentStepSchema = z.object({
  employeeId: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  hireDate: z.coerce.date().optional().nullable(),
  address: z.string().max(255, "Max 255 characters").optional().or(z.literal("")),
  city: z.string().max(100, "Max 100 characters").optional().or(z.literal("")),
  postalCode: z.string().max(20, "Max 20 characters").optional().or(z.literal("")),
  country: z.string().length(2, "Use 2-letter country code").default("DE"),
  contractType: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  notes: z.string().max(2000, "Max 2000 characters").optional().or(z.literal("")),
  sendInvitation: z.boolean().default(true),
});

const licenseDetailsBaseSchema = z.object({
  licenseNumber: z
    .string()
    .min(1, "License number is required")
    .max(50, "Max 50 characters"),
  licenseCountry: z
    .string()
    .length(2, "Use 2-letter country code (e.g., DE)")
    .default("DE"),
  licenseIssueDate: z.coerce.date({
    required_error: "Issue date is required",
    invalid_type_error: "Invalid date",
  }),
  licenseExpiryDate: z.coerce.date({
    required_error: "Expiry date is required",
    invalid_type_error: "Invalid date",
  }),
  licenseCategories: z
    .array(euLicenseCategorySchema)
    .min(1, "Select at least one license category"),
  medicalCertIssueDate: z.coerce.date().optional().nullable(),
  medicalCertExpiryDate: z.coerce.date().optional().nullable(),
  yearsExperience: z.coerce
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .max(70, "Max 70 years")
    .optional()
    .nullable(),
  adrCertNumber: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
  adrExpiryDate: z.coerce.date().optional().nullable(),
});

export const createDriverFormSchema = basicInfoStepSchema
  .merge(licenseDetailsBaseSchema)
  .merge(employmentStepSchema)
  .refine((data) => data.licenseExpiryDate > new Date(), {
    message: "License expiry date must be in the future",
    path: ["licenseExpiryDate"],
  });

export const editOnlyFieldsSchema = z.object({
  avatarUrl: z.string().url().nullable().optional(),
  driverStatus: driverStatusSchema.optional(),
  isAvailable: z.boolean().optional(),
  safetyScore: z.coerce
    .number()
    .min(0, "Min 0")
    .max(100, "Max 100")
    .nullable()
    .optional(),
  onTimeDeliveryRate: z.coerce
    .number()
    .min(0, "Min 0")
    .max(100, "Max 100")
    .nullable()
    .optional(),
});

export const updateDriverFormSchema = z
  .object({
    driverId: z.string().min(1, "Driver ID is required"),
  })
  .merge(basicInfoStepSchema.partial().omit({ email: true })) // Email not editable
  .merge(licenseDetailsBaseSchema.partial())
  .merge(employmentStepSchema.partial().omit({ sendInvitation: true })) // No invitation on edit
  .merge(editOnlyFieldsSchema);


export type BasicInfoStepValues = z.infer<typeof basicInfoStepSchema>;
export type LicenseDetailsStepValues = z.infer<typeof licenseDetailsStepSchema>;
export type EmploymentStepValues = z.infer<typeof employmentStepSchema>;
// Use z.input for form values (before transformation/defaults are applied)
export type CreateDriverFormValues = z.input<typeof createDriverFormSchema>;
export type UpdateDriverFormValues = z.input<typeof updateDriverFormSchema>;

export const createDriverDefaultValues: Partial<CreateDriverFormValues> = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  licenseNumber: "",
  licenseCountry: "DE",
  licenseCategories: [],
  employeeId: "",
  address: "",
  city: "",
  postalCode: "",
  country: "DE",
  contractType: "",
  notes: "",
  sendInvitation: true,
  yearsExperience: null,
  adrCertNumber: "",
  medicalCertIssueDate: null,
  medicalCertExpiryDate: null,
  adrExpiryDate: null,
};

export const getUpdateDriverDefaultValues = (
  driverId: string
): Partial<UpdateDriverFormValues> => ({
  driverId,
  firstName: "",
  lastName: "",
  phoneNumber: "",
  licenseNumber: "",
  licenseCountry: "DE",
  licenseCategories: [],
  employeeId: "",
  address: "",
  city: "",
  postalCode: "",
  country: "DE",
  contractType: "",
  notes: "",
  yearsExperience: null,
  adrCertNumber: "",
  medicalCertIssueDate: null,
  medicalCertExpiryDate: null,
  adrExpiryDate: null,
  driverStatus: undefined,
  isAvailable: undefined,
  safetyScore: null,
  onTimeDeliveryRate: null,
  avatarUrl: null,
});

// ============================================
// STEP FIELD MAPPINGS (for validation)
// ============================================

export const STEP_1_FIELDS: Array<keyof BasicInfoStepValues> = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
];

export const STEP_2_FIELDS: Array<keyof LicenseDetailsStepValues> = [
  "licenseNumber",
  "licenseCountry",
  "licenseIssueDate",
  "licenseExpiryDate",
  "licenseCategories",
  "medicalCertIssueDate",
  "medicalCertExpiryDate",
  "yearsExperience",
  "adrCertNumber",
  "adrExpiryDate",
];

export const STEP_3_FIELDS: Array<keyof EmploymentStepValues> = [
  "employeeId",
  "hireDate",
  "address",
  "city",
  "postalCode",
  "country",
  "contractType",
  "notes",
  "sendInvitation",
];
