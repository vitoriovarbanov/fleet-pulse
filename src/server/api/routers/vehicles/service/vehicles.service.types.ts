import type {
  VehicleCard,
  VehicleDetail,
} from "../repository/vehicles.repository.types";

/**
 * Result type for listing vehicles
 */
export type ListVehiclesResult = {
  vehicles: VehicleCard[];
  nextCursor: string | null;
};

/**
 * Result type for single vehicle operations
 */
export type VehicleResult = VehicleDetail | null;

/**
 * Result type for delete operation
 */
export type DeleteVehicleResult = {
  success: boolean;
  message: string;
};

/**
 * Result type for driver assignment
 */
export type AssignDriverResult = {
  success: boolean;
  vehicle: VehicleDetail | null;
  message: string;
};

/**
 * Result type for statistics
 */
export type VehicleStatisticsResult = {
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  assigned: number;
  unassigned: number;
  total: number;
};
