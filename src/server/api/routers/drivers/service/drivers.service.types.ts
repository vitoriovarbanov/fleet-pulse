import type {
  DriverCard,
  DriverDetail,
} from "../repository/drivers.repository.types";

/**
 * Result type for listing drivers
 */
export type ListDriversResult = {
  drivers: DriverCard[];
  nextCursor: string | null;
};

/**
 * Result type for single driver operations
 */
export type DriverResult = DriverDetail | null;

/**
 * Result type for delete operation
 */
export type DeleteDriverResult = {
  success: boolean;
  message: string;
};

/**
 * Result type for vehicle assignment
 */
export type AssignVehicleResult = {
  success: boolean;
  driver: DriverDetail | null;
  message: string;
};
