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
import { Pencil, Trash2, User, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { AnimatedSkeleton } from "@/components/animated/animated-card";

type VehicleDetailModalProps = {
  vehicleId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function VehicleDetailModal({
  vehicleId,
  open,
  onClose,
  onUpdate,
}: VehicleDetailModalProps) {
  const {
    data: vehicle,
    isLoading,
    error,
  } = api.vehicles.getById.useQuery({ vehicleId }, { enabled: open });

  const deleteVehicle = api.vehicles.delete.useMutation({
    onSuccess: () => {
      toast.success("Vehicle marked as out of service");
      onUpdate();
      onClose();
    },
    onError: (err) => {
      toast.error(`Failed to delete vehicle: ${err.message}`);
    },
  });

  const unassignDriver = api.vehicles.unassignDriver.useMutation({
    onSuccess: () => {
      toast.success("Driver unassigned successfully");
      onUpdate();
    },
    onError: (err) => {
      toast.error(`Failed to unassign driver: ${err.message}`);
    },
  });

  const handleDelete = () => {
    if (
      confirm("Are you sure you want to mark this vehicle as out of service?")
    ) {
      deleteVehicle.mutate({ vehicleId });
    }
  };

  const handleUnassignDriver = () => {
    if (
      confirm(
        "Are you sure you want to unassign the driver from this vehicle?"
      )
    ) {
      unassignDriver.mutate({ vehicleId });
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
              vehicle?.plateNumber
            )}
          </DialogTitle>
          <DialogDescription>Vehicle details and information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <AnimatedSkeleton className="h-24 w-full" />
            <AnimatedSkeleton className="h-48 w-full" />
          </div>
        ) : vehicle ? (
          <div className="space-y-6">
            {/* Vehicle Info */}
            <section>
              <h3 className="font-semibold mb-3">Vehicle Information</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Plate Number</dt>
                  <dd>{vehicle.plateNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">VIN</dt>
                  <dd>{vehicle.vin ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Make</dt>
                  <dd>{vehicle.make}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Model</dt>
                  <dd>{vehicle.model}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Year</dt>
                  <dd>{vehicle.year ?? "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{vehicle.type}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{vehicle.status.replace(/_/g, " ")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Organization</dt>
                  <dd>{vehicle.organization.name}</dd>
                </div>
              </dl>
            </section>

            {/* Assigned Driver */}
            {vehicle.assignedDriver && (
              <section>
                <h3 className="font-semibold mb-3">Assigned Driver</h3>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {vehicle.assignedDriver.user.avatarUrl ? (
                      <img
                        src={vehicle.assignedDriver.user.avatarUrl}
                        alt="Driver"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground p-2 bg-muted rounded-full" />
                    )}
                    <div>
                      <p className="font-medium">
                        {vehicle.assignedDriver.user.firstName}{" "}
                        {vehicle.assignedDriver.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.assignedDriver.user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnassignDriver}
                    disabled={unassignDriver.isPending}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    {unassignDriver.isPending ? "Unassigning..." : "Unassign"}
                  </Button>
                </div>
              </section>
            )}

            {/* Notes */}
            {vehicle.notes && (
              <section>
                <h3 className="font-semibold mb-3">Notes</h3>
                <p className="text-sm text-muted-foreground">{vehicle.notes}</p>
              </section>
            )}

            {/* Timestamps */}
            <section>
              <h3 className="font-semibold mb-3">Record Information</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{new Date(vehicle.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd>{new Date(vehicle.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </section>

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
                disabled={deleteVehicle.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteVehicle.isPending ? "Deleting..." : "Out of Service"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
