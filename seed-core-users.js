const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const coreUsers = [
    { name: 'Designer', username: 'designer', password: '123', role: 'worker', department: 'design' },
    { name: 'Store Incharge - Leather', username: 'store_leather', password: '123', role: 'worker', department: 'store' },
    { name: 'Store Incharge - Lining', username: 'store_lining', password: '123', role: 'worker', department: 'store' },
    { name: 'Store Incharge - App', username: 'store_app', password: '123', role: 'worker', department: 'store' },
    { name: 'Store Incharge - Bottom', username: 'store_bottom', password: '123', role: 'worker', department: 'store' },
    { name: 'Leather Cutting Incharge', username: 'lc', password: '123', role: 'worker', department: 'cutting' },
    { name: 'Lining Cutting Incharge', username: 'ln', password: '123', role: 'worker', department: 'cutting' },
    { name: 'Lasting Incharge', username: 'last', password: '123', role: 'worker', department: 'lasting' },
    { name: 'Injection Incharge', username: 'inj', password: '123', role: 'worker', department: 'lasting' },
    { name: 'Manager', username: 'manager', password: '123', role: 'worker', department: 'management' },
    // Admin and Director were seeded previously, but just in case:
    { name: 'Admin', username: 'admin', password: '123', role: 'admin', department: 'management' },
    { name: 'Director', username: 'director', password: '123', role: 'director', department: 'management' }
  ];

  let createdCount = 0;
  for (const u of coreUsers) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({ data: u });
      createdCount++;
    }
  }
  console.log(`Created ${createdCount} core users for Sample & Production.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
