-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER', 'FLEET_MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'ON_REST', 'SICK_LEAVE', 'VACATION');

-- CreateEnum
CREATE TYPE "EULicenseCategory" AS ENUM ('C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE');

-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('DRIVER_CPC', 'DIGITAL_TACHOGRAPH', 'ADR', 'FORKLIFT', 'FIRST_AID', 'DEFENSIVE_DRIVING', 'ECO_DRIVING', 'TRANSPORT_MANAGER_CPC', 'OTHER');

-- CreateEnum
CREATE TYPE "TachographCardType" AS ENUM ('DRIVER_CARD', 'COMPANY_CARD', 'WORKSHOP_CARD', 'CONTROL_CARD');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "locale" TEXT NOT NULL DEFAULT 'de-DE',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "settings" JSONB DEFAULT '{}',
    "planType" TEXT NOT NULL DEFAULT 'free',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "phoneNumber" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "employeeId" TEXT,
    "hireDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "contractType" TEXT,
    "preferences" JSONB DEFAULT '{}',
    "profileCompletedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseCountry" TEXT NOT NULL,
    "licenseIssueDate" TIMESTAMP(3) NOT NULL,
    "licenseExpiryDate" TIMESTAMP(3) NOT NULL,
    "licenseCategories" "EULicenseCategory"[],
    "medicalCertIssueDate" TIMESTAMP(3),
    "medicalCertExpiryDate" TIMESTAMP(3),
    "driverStatus" "DriverStatus" NOT NULL DEFAULT 'OFF_DUTY',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "yearsExperience" INTEGER,
    "assignedVehicleId" TEXT,
    "safetyScore" DECIMAL(5,2),
    "onTimeDeliveryRate" DECIMAL(5,2),
    "adrCertNumber" TEXT,
    "adrExpiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_certifications" (
    "id" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "type" "CertificationType" NOT NULL,
    "name" TEXT NOT NULL,
    "certificationNumber" TEXT,
    "issuingAuthority" TEXT,
    "issuingCountry" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatcher_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeNumber" TEXT,
    "shiftPreference" TEXT,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverageRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activeTripsManaged" INTEGER NOT NULL DEFAULT 0,
    "totalTripsManaged" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" INTEGER,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'phone',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatcher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_registrationNumber_key" ON "organizations"("registrationNumber");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_userId_key" ON "driver_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_licenseNumber_key" ON "driver_profiles"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_assignedVehicleId_key" ON "driver_profiles"("assignedVehicleId");

-- CreateIndex
CREATE INDEX "driver_profiles_licenseNumber_idx" ON "driver_profiles"("licenseNumber");

-- CreateIndex
CREATE INDEX "driver_profiles_driverStatus_idx" ON "driver_profiles"("driverStatus");

-- CreateIndex
CREATE INDEX "driver_profiles_isAvailable_idx" ON "driver_profiles"("isAvailable");

-- CreateIndex
CREATE INDEX "driver_profiles_assignedVehicleId_idx" ON "driver_profiles"("assignedVehicleId");

-- CreateIndex
CREATE INDEX "driver_certifications_driverProfileId_idx" ON "driver_certifications"("driverProfileId");

-- CreateIndex
CREATE INDEX "driver_certifications_type_idx" ON "driver_certifications"("type");

-- CreateIndex
CREATE INDEX "driver_certifications_expiryDate_idx" ON "driver_certifications"("expiryDate");

-- CreateIndex
CREATE INDEX "driver_certifications_isActive_idx" ON "driver_certifications"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "dispatcher_profiles_userId_key" ON "dispatcher_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dispatcher_profiles_badgeNumber_key" ON "dispatcher_profiles"("badgeNumber");

-- CreateIndex
CREATE INDEX "dispatcher_profiles_userId_idx" ON "dispatcher_profiles"("userId");

-- CreateIndex
CREATE INDEX "dispatcher_profiles_badgeNumber_idx" ON "dispatcher_profiles"("badgeNumber");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_certifications" ADD CONSTRAINT "driver_certifications_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "driver_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatcher_profiles" ADD CONSTRAINT "dispatcher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
