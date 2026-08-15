const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ALL users...");
  
  const usersToSeed = [
    // Core/Sample Users
    { name: 'Designer', username: 'designer', password: '123', role: 'worker', department: 'design' },
    { name: 'Store Lining', username: 'store_lining', password: '123', role: 'worker', department: 'store_lining' },
    { name: 'Store App', username: 'store_app', password: '123', role: 'worker', department: 'store_app' },
    { name: 'Store Bottom', username: 'store_bottom', password: '123', role: 'worker', department: 'store_bottom' },
    { name: 'Leather Cutting', username: 'lc', password: '123', role: 'worker', department: 'lc' },
    { name: 'Lining Cutting', username: 'ln', password: '123', role: 'worker', department: 'ln' },
    { name: 'Sample Lasting', username: 'last', password: '123', role: 'worker', department: 'last' },
    { name: 'Sample Making (Inj)', username: 'inj', password: '123', role: 'worker', department: 'inj' },
    
    // Additional Bulk Users
    { name: 'Bulk Packing', username: 'bp_pack', password: '123', role: 'worker', department: 'bp_packing' },
    { name: 'Raw Material Purchase', username: 'purchase1', password: '123', role: 'worker', department: 'purchase' },
    { name: 'Bulk Prep', username: 'bp_prep', password: '123', role: 'worker', department: 'bp_prep' },
  ];

  for (const u of usersToSeed) {
    const exists = await prisma.user.findUnique({ where: { username: u.username } });
    if (!exists) {
      await prisma.user.create({ data: u });
      console.log(`Created user ${u.username}`);
    } else {
      console.log(`User ${u.username} already exists`);
    }
  }
  
  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
