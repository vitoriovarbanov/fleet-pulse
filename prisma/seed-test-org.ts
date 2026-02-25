import dotenv from "dotenv";

// Load environment variables from .env.development
dotenv.config({ path: ".env.development" });

import {
  PrismaClient,
  UserRole,
  UserStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClerkClient } from "@clerk/backend";
import * as crypto from "crypto";

const DATABASE_URL = process.env.DATABASE_URL;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is required");
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

// Test organization configuration
const TEST_ORG = {
  name: "Test Organization",
  slug: "test-org",
  email: "admin+clerk_test@test-fleetpulse.com",
  country: "DE",
  locale: "en-US",
  currency: "EUR",
  planType: "enterprise",
};

// Test users configuration
// Using +clerk_test suffix allows using code "424242" for email verification in dev mode
const TEST_USERS = [
  {
    role: UserRole.ADMIN,
    email: "admin+clerk_test@test-fleetpulse.com",
    firstName: "Test",
    lastName: "Admin",
  },
  {
    role: UserRole.FLEET_MANAGER,
    email: "fleet-manager+clerk_test@test-fleetpulse.com",
    firstName: "Test",
    lastName: "FleetManager",
  },
  {
    role: UserRole.DISPATCHER,
    email: "dispatcher+clerk_test@test-fleetpulse.com",
    firstName: "Test",
    lastName: "Dispatcher",
  },
  {
    role: UserRole.DRIVER,
    email: "driver+clerk_test@test-fleetpulse.com",
    firstName: "Test",
    lastName: "Driver",
  },
];

function generatePassword(): string {
  // Generate a random 16-character password with letters, numbers, and symbols
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const randomBytes = crypto.randomBytes(16);
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars[randomBytes[i]! % chars.length];
  }
  return password;
}

async function findOrDeleteExistingClerkUser(email: string): Promise<void> {
  try {
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.data.length > 0) {
      console.log(`  Deleting existing Clerk user with email: ${email}`);
      for (const user of existingUsers.data) {
        await clerk.users.deleteUser(user.id);
      }
    }
  } catch (error) {
    // User doesn't exist, which is fine
    console.log(`  No existing Clerk user found for: ${email}`);
  }
}

async function createClerkUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<string> {
  const clerkUser = await clerk.users.createUser({
    emailAddress: [email],
    firstName,
    lastName,
    password,
    skipPasswordChecks: true, // Allow simpler passwords in dev
  });

  return clerkUser.id;
}

async function main() {
  console.log("=".repeat(60));
  console.log("SEEDING TEST ORGANIZATION");
  console.log("=".repeat(60));
  console.log("");

  // Step 1: Create or update test organization
  console.log("Step 1: Creating test organization...");
  const testOrg = await prisma.organization.upsert({
    where: { slug: TEST_ORG.slug },
    update: {},
    create: {
      name: TEST_ORG.name,
      slug: TEST_ORG.slug,
      email: TEST_ORG.email,
      country: TEST_ORG.country,
      locale: TEST_ORG.locale,
      currency: TEST_ORG.currency,
      planType: TEST_ORG.planType,
      isActive: true,
    },
  });
  console.log(`  Created/found organization: ${testOrg.name} (${testOrg.id})`);
  console.log("");

  // Step 2: Create users in Clerk and database
  console.log("Step 2: Creating test users...");
  console.log("");

  const credentials: Array<{
    role: string;
    email: string;
    password: string;
  }> = [];

  for (const testUser of TEST_USERS) {
    console.log(`Processing ${testUser.role}...`);

    // Generate random password for this user
    const password = generatePassword();

    // Delete existing Clerk user if exists (for idempotency)
    await findOrDeleteExistingClerkUser(testUser.email);

    // Create user in Clerk
    console.log(`  Creating Clerk user: ${testUser.email}`);
    const clerkId = await createClerkUser(
      testUser.email,
      testUser.firstName,
      testUser.lastName,
      password
    );
    console.log(`  Clerk user created with ID: ${clerkId}`);

    // Create or update user in database
    console.log(`  Creating/updating database user...`);
    await prisma.user.upsert({
      where: { email: testUser.email },
      update: {
        clerkId,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
        organizationId: testOrg.id,
      },
      create: {
        clerkId,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
        status: UserStatus.ACTIVE,
        organizationId: testOrg.id,
      },
    });
    console.log(`  Database user created/updated`);

    credentials.push({
      role: testUser.role,
      email: testUser.email,
      password,
    });

    console.log("");
  }

  // Step 3: Print credentials
  console.log("=".repeat(60));
  console.log("TEST USER CREDENTIALS");
  console.log("=".repeat(60));
  console.log("");
  console.log("Save these credentials - passwords are randomly generated!");
  console.log("");

  for (const cred of credentials) {
    console.log(`${cred.role}:`);
    console.log(`  Email:    ${cred.email}`);
    console.log(`  Password: ${cred.password}`);
    console.log("");
  }

  console.log("=".repeat(60));
  console.log(`Organization ID: ${testOrg.id}`);
  console.log("=".repeat(60));
  console.log("");
  console.log("Seed completed successfully!");
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
