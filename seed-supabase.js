const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding users...");
  
  const usersToSeed = [
    { name: 'Admin', username: 'admin', password: '123', role: 'admin', department: 'management' },
    { name: 'Director', username: 'director', password: '123', role: 'director', department: 'management' },
    { name: 'Sample Store', username: 'store_leather', password: '123', role: 'worker', department: 'store_leather' },
    { name: 'Bulk Cutting', username: 'bc', password: '123', role: 'worker', department: 'bp_cutting' },
    { name: 'Bulk Closing', username: 'bc_close', password: '123', role: 'worker', department: 'bp_closing' },
    { name: 'Bulk Lasting', username: 'bl', password: '123', role: 'worker', department: 'bp_lasting' },
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
