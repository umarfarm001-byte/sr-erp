const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Modifying database constraints...");
  
  try {
    await prisma.$executeRaw`ALTER TABLE "MasterMaterial" DROP CONSTRAINT IF EXISTS "MasterMaterial_name_key";`;
    console.log("Dropped MasterMaterial_name_key");
  } catch (e) {
    console.log("Constraint might not exist or error:", e.message);
  }

  try {
    await prisma.$executeRaw`ALTER TABLE "MasterMaterial" ADD CONSTRAINT "MasterMaterial_category_name_key" UNIQUE ("category", "name");`;
    console.log("Added MasterMaterial_category_name_key");
  } catch (e) {
    console.log("Constraint might already exist or error:", e.message);
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
