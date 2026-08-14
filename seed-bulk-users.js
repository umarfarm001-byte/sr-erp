const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = [
    { key: 'cutting', prefix: 'Cutting Worker' },
    { key: 'closing', prefix: 'Closing Worker' },
    { key: 'prep', prefix: 'Prep Worker' },
    { key: 'lasting', prefix: 'Lasting Worker' },
    { key: 'packing', prefix: 'Packing Worker' },
    { key: 'purchase', prefix: 'Purchase Exec' },
    { key: 'store', prefix: 'Store Keeper' }
  ];

  const usersToCreate = [];

  for (const d of depts) {
    // creating 7 users for each department so they can test multi-selection
    for (let i = 1; i <= 7; i++) {
      usersToCreate.push({
        name: `${d.prefix} ${i}`,
        username: `${d.key}_${i}`,
        password: '123',
        role: 'worker',
        department: d.key
      });
    }
  }

  let createdCount = 0;
  for (const u of usersToCreate) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({ data: u });
      createdCount++;
    }
  }
  console.log(`Created ${createdCount} placeholder users for bulk departments.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
