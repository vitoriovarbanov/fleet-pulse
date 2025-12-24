"use client";

import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { AnimatedSkeleton } from "@/components/animated/animated-card";

type DriverDetailModalProps = {
  driverId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function DriverDetailModal({
  driverId,
  open,
  onClose,
  onUpdate,
}: DriverDetailModalProps) {
  const {
    data: driver,
    isLoading,
    error,
  } = api.drivers.getById.useQuery({ driverId }, { enabled: open });

  const deleteDriver = api.drivers.delete.useMutation({
    onSuccess: () => {
      toast.success("Driver deactivated successfully");
      onUpdate();
      onClose();
    },
    onError: (err) => {
      toast.error(`Failed to delete driver: ${err.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to deactivate this driver?")) {
      deleteDriver.mutate({ driverId });
    }
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{error.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <AnimatedSkeleton className="h-6 w-48" />
            ) : (
              `${driver?.firstName} ${driver?.lastName}`
            )}
          </DialogTitle>
          <DialogDescription>Driver details and profile</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <AnimatedSkeleton className="h-24 w-full" />
            <AnimatedSkeleton className="h-48 w-full" />
          </div>
        ) : driver ? (
          <div className="space-y-6">
            {/* Personal Info */}
            <section>
              <h3 className="font-semibold mb-3">Personal Information</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{driver.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{driver.phoneNumber ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Employee ID</dt>
                  <dd>{driver.employeeId ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hire Date</dt>
                  <dd>
                    {driver.hireDate
                      ? new Date(driver.hireDate).toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>
                    {[driver.address, driver.city, driver.postalCode]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Country</dt>
                  <dd>{driver.country}</dd>
                </div>
              </dl>
            </section>

            {/* License Info */}
            {driver.driverProfile && (
              <section>
                <h3 className="font-semibold mb-3">License Information</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">License Number</dt>
                    <dd>{driver.driverProfile.licenseNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Country</dt>
                    <dd>{driver.driverProfile.licenseCountry}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Categories</dt>
                    <dd className="flex flex-wrap gap-1">
                      {driver.driverProfile.licenseCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Expiry Date</dt>
                    <dd>
                      {new Date(
                        driver.driverProfile.licenseExpiryDate
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>{driver.driverProfile.driverStatus.replace("_", " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Available</dt>
                    <dd>{driver.driverProfile.isAvailable ? "Yes" : "No"}</dd>
                  </div>
                  {driver.driverProfile.yearsExperience !== null && (
                    <div>
                      <dt className="text-muted-foreground">Experience</dt>
                      <dd>{driver.driverProfile.yearsExperience} years</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Assigned Vehicle */}
            {driver.driverProfile?.assignedVehicle && (
              <section>
                <h3 className="font-semibold mb-3">Assigned Vehicle</h3>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {driver.driverProfile.assignedVehicle.make}{" "}
                      {driver.driverProfile.assignedVehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {driver.driverProfile.assignedVehicle.plateNumber}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Notes */}
            {driver.driverProfile?.notes && (
              <section>
                <h3 className="font-semibold mb-3">Notes</h3>
                <p className="text-sm text-muted-foreground">
                  {driver.driverProfile.notes}
                </p>
              </section>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteDriver.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteDriver.isPending ? "Deleting..." : "Deactivate"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
