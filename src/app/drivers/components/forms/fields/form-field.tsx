"use client";

import {
  type UseFormReturn,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  maxLength?: number;
};

export function FormField<T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  required,
  disabled,
  className,
  description,
  maxLength,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  // Navigate nested error paths (e.g., "driverProfile.licenseNumber")
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
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={name}
        className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive")}
        {...register(name, {
          valueAsNumber: type === "number",
        })}
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
