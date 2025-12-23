import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
