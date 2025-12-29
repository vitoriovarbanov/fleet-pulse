"use client";

import {
  type UseFormReturn,
  type FieldPath,
  type FieldValues,
  Controller,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LICENSE_CATEGORIES, type EuLicenseCategory } from "../driver-form.types";

type LicenseCategoriesFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function LicenseCategoriesField<T extends FieldValues>({
  form,
  name,
  required,
  disabled,
  className,
}: LicenseCategoriesFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = form;

  // Navigate nested error paths
  const getNestedError = () => {
    const parts = name.split(".");
    let current: unknown = errors;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current as { message?: string } | undefined;
  };

  const error = getNestedError();

  return (
    <div className={cn("space-y-3", className)}>
      <Label
        className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        License Categories
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedCategories = (field.value ?? []) as EuLicenseCategory[];

          const toggleCategory = (category: EuLicenseCategory) => {
            if (disabled) return;

            const newValue = selectedCategories.includes(category)
              ? selectedCategories.filter((c) => c !== category)
              : [...selectedCategories, category];

            field.onChange(newValue);
          };

          return (
            <div className="grid grid-cols-4 gap-2">
              {LICENSE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.value);

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    disabled={disabled}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                      "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg font-bold">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight mt-1">
                      {cat.description}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        }}
      />
      {error?.message && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
