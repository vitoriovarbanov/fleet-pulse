"use client";

import {
  type UseFormReturn,
  type FieldPath,
  type FieldValues,
  Controller,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DatePickerFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  minDate?: Date;
  maxDate?: Date;
};

export function DatePickerField<T extends FieldValues>({
  form,
  name,
  label,
  required,
  disabled,
  className,
  description,
  minDate,
  maxDate,
}: DatePickerFieldProps<T>) {
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

  // Format date for input[type="date"]
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0] ?? "";
    } catch {
      return "";
    }
  };

  // Format date for min/max attributes
  const formatDateAttribute = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split("T")[0];
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={name}
        className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            id={name}
            type="date"
            disabled={disabled}
            min={formatDateAttribute(minDate)}
            max={formatDateAttribute(maxDate)}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive"
            )}
            value={formatDateForInput(field.value as Date | null | undefined)}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                field.onChange(new Date(value));
              } else {
                field.onChange(null);
              }
            }}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        )}
      />
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error?.message && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
