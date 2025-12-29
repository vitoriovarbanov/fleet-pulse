'use client';

import { type UseFormReturn, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '../fields/form-field';
import { DRIVER_STATUS_OPTIONS, type UpdateDriverFormValues } from '../driver-form.types';
import { cn } from '@/lib/utils';

type StatusSectionProps = {
    form: UseFormReturn<UpdateDriverFormValues>;
};

export function StatusSection({ form }: StatusSectionProps) {
    const { control } = form;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="driverStatus">Driver Status</Label>
                    <Controller
                        name="driverStatus"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                <SelectTrigger id="driverStatus">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DRIVER_STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'h-2 w-2 rounded-full',
                                                        status.color === 'emerald' && 'bg-emerald-500',
                                                        status.color === 'primary' && 'bg-primary',
                                                        status.color === 'muted' && 'bg-muted-foreground',
                                                        status.color === 'amber' && 'bg-amber-500',
                                                        status.color === 'red' && 'bg-red-500',
                                                        status.color === 'violet' && 'bg-violet-500'
                                                    )}
                                                />
                                                {status.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Availability Toggle */}
                <Controller
                    name="isAvailable"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border h-fit">
                            <div className="space-y-1">
                                <Label htmlFor="isAvailable" className="text-sm font-medium cursor-pointer">
                                    Available for Assignment
                                </Label>
                                <p className="text-xs text-muted-foreground">Can be assigned to new trips</p>
                            </div>
                            <Switch id="isAvailable" checked={field.value ?? false} onCheckedChange={field.onChange} />
                        </div>
                    )}
                />
            </div>

            <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Performance Metrics</h4>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        form={form}
                        name="safetyScore"
                        label="Safety Score"
                        type="number"
                        placeholder="0-100"
                        description="Overall safety rating (0-100)"
                    />

                    <FormField
                        form={form}
                        name="onTimeDeliveryRate"
                        label="On-Time Delivery Rate"
                        type="number"
                        placeholder="0-100"
                        description="Percentage of on-time deliveries"
                    />
                </div>
            </div>
        </div>
    );
}
