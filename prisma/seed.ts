import {
  PrismaClient,
  type DriverStatus,
  type EULicenseCategory,
  type VehicleType,
  type VehicleStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// German mock data for drivers
const germanDrivers = [
  {
    firstName: "Hans",
    lastName: "Müller",
    email: "hans.mueller@fleetpulse.de",
    phoneNumber: "+49 151 12345678",
    employeeId: "EMP-001",
    address: "Berliner Straße 42",
    city: "Berlin",
    postalCode: "10115",
    licenseNumber: "B072-M8X9-K4L2",
    yearsExperience: 12,
    driverStatus: "AVAILABLE" as DriverStatus,
    licenseCategories: ["C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Klaus",
    lastName: "Schmidt",
    email: "klaus.schmidt@fleetpulse.de",
    phoneNumber: "+49 152 23456789",
    employeeId: "EMP-002",
    address: "Hauptstraße 15",
    city: "München",
    postalCode: "80331",
    licenseNumber: "M156-S3T7-P9Q1",
    yearsExperience: 8,
    driverStatus: "ON_DUTY" as DriverStatus,
    licenseCategories: ["C", "CE", "D"] as EULicenseCategory[],
  },
  {
    firstName: "Peter",
    lastName: "Wagner",
    email: "peter.wagner@fleetpulse.de",
    phoneNumber: "+49 153 34567890",
    employeeId: "EMP-003",
    address: "Goethestraße 88",
    city: "Hamburg",
    postalCode: "20095",
    licenseNumber: "H234-W5V8-R2N6",
    yearsExperience: 15,
    driverStatus: "OFF_DUTY" as DriverStatus,
    licenseCategories: ["C1", "C1E", "C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Michael",
    lastName: "Becker",
    email: "michael.becker@fleetpulse.de",
    phoneNumber: "+49 154 45678901",
    employeeId: "EMP-004",
    address: "Schillerplatz 7",
    city: "Frankfurt",
    postalCode: "60311",
    licenseNumber: "F891-B2C4-X7Y3",
    yearsExperience: 6,
    driverStatus: "AVAILABLE" as DriverStatus,
    licenseCategories: ["C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Thomas",
    lastName: "Hoffmann",
    email: "thomas.hoffmann@fleetpulse.de",
    phoneNumber: "+49 155 56789012",
    employeeId: "EMP-005",
    address: "Königsallee 123",
    city: "Düsseldorf",
    postalCode: "40212",
    licenseNumber: "D567-H9J1-M4K8",
    yearsExperience: 10,
    driverStatus: "ON_REST" as DriverStatus,
    licenseCategories: ["C1", "C"] as EULicenseCategory[],
  },
  {
    firstName: "Andreas",
    lastName: "Fischer",
    email: "andreas.fischer@fleetpulse.de",
    phoneNumber: "+49 156 67890123",
    employeeId: "EMP-006",
    address: "Marktplatz 31",
    city: "Köln",
    postalCode: "50667",
    licenseNumber: "K432-F6G2-L9P5",
    yearsExperience: 20,
    driverStatus: "AVAILABLE" as DriverStatus,
    licenseCategories: ["C", "CE", "D", "DE"] as EULicenseCategory[],
  },
  {
    firstName: "Stefan",
    lastName: "Weber",
    email: "stefan.weber@fleetpulse.de",
    phoneNumber: "+49 157 78901234",
    employeeId: "EMP-007",
    address: "Friedrichstraße 56",
    city: "Stuttgart",
    postalCode: "70173",
    licenseNumber: "S789-W1X3-N6M2",
    yearsExperience: 4,
    driverStatus: "ON_DUTY" as DriverStatus,
    licenseCategories: ["C1", "C1E"] as EULicenseCategory[],
  },
  {
    firstName: "Markus",
    lastName: "Schneider",
    email: "markus.schneider@fleetpulse.de",
    phoneNumber: "+49 158 89012345",
    employeeId: "EMP-008",
    address: "Bahnhofstraße 99",
    city: "Nürnberg",
    postalCode: "90402",
    licenseNumber: "N654-S8T4-Q1R7",
    yearsExperience: 11,
    driverStatus: "VACATION" as DriverStatus,
    licenseCategories: ["C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Jürgen",
    lastName: "Meyer",
    email: "juergen.meyer@fleetpulse.de",
    phoneNumber: "+49 159 90123456",
    employeeId: "EMP-009",
    address: "Lindenstraße 22",
    city: "Leipzig",
    postalCode: "04109",
    licenseNumber: "L321-M7N9-K4J6",
    yearsExperience: 14,
    driverStatus: "AVAILABLE" as DriverStatus,
    licenseCategories: ["C1", "C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Frank",
    lastName: "Koch",
    email: "frank.koch@fleetpulse.de",
    phoneNumber: "+49 160 01234567",
    employeeId: "EMP-010",
    address: "Rosenweg 8",
    city: "Dresden",
    postalCode: "01067",
    licenseNumber: "D098-K5L1-P8Q4",
    yearsExperience: 7,
    driverStatus: "SICK_LEAVE" as DriverStatus,
    licenseCategories: ["C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Wolfgang",
    lastName: "Richter",
    email: "wolfgang.richter@fleetpulse.de",
    phoneNumber: "+49 161 12345098",
    employeeId: "EMP-011",
    address: "Mozartstraße 45",
    city: "Hannover",
    postalCode: "30159",
    licenseNumber: "H765-R2S8-T1U5",
    yearsExperience: 18,
    driverStatus: "ON_DUTY" as DriverStatus,
    licenseCategories: ["C", "CE", "D1"] as EULicenseCategory[],
  },
  {
    firstName: "Bernd",
    lastName: "Krause",
    email: "bernd.krause@fleetpulse.de",
    phoneNumber: "+49 162 23456109",
    employeeId: "EMP-012",
    address: "Parkstraße 67",
    city: "Bremen",
    postalCode: "28195",
    licenseNumber: "B432-K9L3-M6N2",
    yearsExperience: 9,
    driverStatus: "AVAILABLE" as DriverStatus,
    licenseCategories: ["C1", "C1E", "C"] as EULicenseCategory[],
  },
  {
    firstName: "Uwe",
    lastName: "Braun",
    email: "uwe.braun@fleetpulse.de",
    phoneNumber: "+49 163 34567210",
    employeeId: "EMP-013",
    address: "Schulstraße 12",
    city: "Dortmund",
    postalCode: "44135",
    licenseNumber: "D109-B4C8-X5Y1",
    yearsExperience: 5,
    driverStatus: "OFF_DUTY" as DriverStatus,
    licenseCategories: ["C", "CE"] as EULicenseCategory[],
  },
  {
    firstName: "Ralf",
    lastName: "Zimmermann",
    email: "ralf.zimmermann@fleetpulse.de",
    phoneNumber: "+49 164 45678321",
    employeeId: "EMP-014",
    address: "Industriestraße 34",
    city: "Essen",
    postalCode: "45127",
    licenseNumber: "E876-Z1A5-B8C4",
    yearsExperience: 13,
    driverStatus: "AVAILABLE" as DriverStatus,
    licenseCategories: ["C", "CE", "D", "DE"] as EULicenseCategory[],
  },
  {
    firstName: "Dieter",
    lastName: "Hartmann",
    email: "dieter.hartmann@fleetpulse.de",
    phoneNumber: "+49 165 56789432",
    employeeId: "EMP-015",
    address: "Waldweg 78",
    city: "Mannheim",
    postalCode: "68159",
    licenseNumber: "M543-H7I1-J4K8",
    yearsExperience: 16,
    driverStatus: "ON_DUTY" as DriverStatus,
    licenseCategories: ["C1", "C", "CE"] as EULicenseCategory[],
  },
];

// Real truck brands and models for vehicles
const germanVehicles = [
  {
    plateNumber: "B-FP 1001",
    vin: "WDB9634031L123456",
    make: "Mercedes-Benz",
    model: "Actros 1845",
    year: 2022,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "M-FP 2002",
    vin: "YV2RT40A5YB234567",
    make: "Volvo",
    model: "FH16 750",
    year: 2021,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "HH-FP 3003",
    vin: "XLRTE47MS0E345678",
    make: "DAF",
    model: "XF 530",
    year: 2023,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "F-FP 4004",
    vin: "WMAN08ZZ1CY456789",
    make: "MAN",
    model: "TGX 18.510",
    year: 2022,
    type: "TRUCK" as VehicleType,
    status: "MAINTENANCE" as VehicleStatus,
  },
  {
    plateNumber: "K-FP 5005",
    vin: "3H3V532C6CT567890",
    make: "Scania",
    model: "R 450",
    year: 2020,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "D-FP 6006",
    vin: "YS2R4X20005678901",
    make: "Scania",
    model: "S 500",
    year: 2023,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "S-FP 7007",
    vin: "WDB9066351S789012",
    make: "Mercedes-Benz",
    model: "Arocs 3363",
    year: 2022,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "N-FP 8008",
    vin: "WMAN12ZZ3DY890123",
    make: "MAN",
    model: "TGS 18.470",
    year: 2021,
    type: "TRUCK" as VehicleType,
    status: "OUT_OF_SERVICE" as VehicleStatus,
  },
  {
    plateNumber: "L-FP 9009",
    vin: "YV2AG20A5KB901234",
    make: "Volvo",
    model: "FM 460",
    year: 2022,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
  {
    plateNumber: "E-FP 1010",
    vin: "XLER4X20002012345",
    make: "DAF",
    model: "CF 450",
    year: 2021,
    type: "TRUCK" as VehicleType,
    status: "ACTIVE" as VehicleStatus,
  },
];

async function main() {
  console.log("Seeding database...");

  // Create default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "Fleet Pulse",
      slug: "default",
      email: "admin@fleetpulse.de",
      country: "DE",
      locale: "de-DE",
      currency: "EUR",
      planType: "enterprise",
      isActive: true,
    },
  });

  console.log(`Created/found organization: ${defaultOrg.name} (${defaultOrg.id})`);

  // Create vehicles
  console.log("\nCreating vehicles...");
  const createdVehicles: Array<{ id: string; plateNumber: string }> = [];

  for (const vehicle of germanVehicles) {
    const createdVehicle = await prisma.vehicle.upsert({
      where: { plateNumber: vehicle.plateNumber },
      update: {},
      create: {
        ...vehicle,
        organizationId: defaultOrg.id,
      },
    });
    createdVehicles.push({ id: createdVehicle.id, plateNumber: createdVehicle.plateNumber });
    console.log(`  Created vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`);
  }

  // Create drivers with driver profiles
  console.log("\nCreating drivers...");
  const activeVehicles = createdVehicles.filter((_, index) => {
    const vehicle = germanVehicles[index];
    return vehicle?.status === "ACTIVE";
  });

  for (let i = 0; i < germanDrivers.length; i++) {
    const driver = germanDrivers[i];
    if (!driver) continue;

    // Assign vehicles to first few available drivers
    const assignedVehicle =
      driver.driverStatus === "AVAILABLE" || driver.driverStatus === "ON_DUTY"
        ? activeVehicles.shift()
        : undefined;

    const licenseIssueDate = new Date();
    licenseIssueDate.setFullYear(licenseIssueDate.getFullYear() - (driver.yearsExperience + 1));

    const licenseExpiryDate = new Date();
    licenseExpiryDate.setFullYear(licenseExpiryDate.getFullYear() + 5);

    const hireDate = new Date();
    hireDate.setFullYear(hireDate.getFullYear() - driver.yearsExperience);

    const createdUser = await prisma.user.upsert({
      where: { email: driver.email },
      update: {},
      create: {
        clerkId: `seed_driver_${i + 1}_${Date.now()}`,
        organizationId: defaultOrg.id,
        email: driver.email,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phoneNumber: driver.phoneNumber,
        employeeId: driver.employeeId,
        address: driver.address,
        city: driver.city,
        postalCode: driver.postalCode,
        country: "DE",
        role: "DRIVER",
        status: "ACTIVE",
        hireDate,
        contractType: "full_time",
        driverProfile: {
          create: {
            licenseNumber: driver.licenseNumber,
            licenseCountry: "DE",
            licenseIssueDate,
            licenseExpiryDate,
            licenseCategories: driver.licenseCategories,
            driverStatus: driver.driverStatus,
            isAvailable: driver.driverStatus === "AVAILABLE",
            yearsExperience: driver.yearsExperience,
            safetyScore: Math.floor(Math.random() * 20) + 80, // 80-100
            onTimeDeliveryRate: Math.floor(Math.random() * 15) + 85, // 85-100
            assignedVehicleId: assignedVehicle?.id ?? null,
          },
        },
      },
    });

    console.log(
      `  Created driver: ${driver.firstName} ${driver.lastName} (${driver.driverStatus})${assignedVehicle ? ` - Assigned: ${assignedVehicle.plateNumber}` : ""}`
    );
  }

  console.log("\nDefault organization ID for webhook: ", defaultOrg.id);
  console.log("\nSeed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
