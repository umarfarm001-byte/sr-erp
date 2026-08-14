const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersToCreate = [
    { name: 'Admin User', username: 'admin', password: '123', role: 'admin', department: 'management' },
    { name: 'Director Boss', username: 'director', password: '123', role: 'director', department: 'management' },
    { name: 'Store Manager', username: 'store1', password: '123', role: 'worker', department: 'store' },
    { name: 'Raw Material Purchaser', username: 'purchase1', password: '123', role: 'worker', department: 'purchase' },
    { name: 'Ali (Cutting)', username: 'ali_cut', password: '123', role: 'worker', department: 'cutting' },
    { name: 'Usman (Cutting)', username: 'usman_cut', password: '123', role: 'worker', department: 'cutting' },
    { name: 'Hamza (Closing)', username: 'hamza_close', password: '123', role: 'worker', department: 'closing' },
    { name: 'Raza (Prep)', username: 'raza_prep', password: '123', role: 'worker', department: 'prep' },
    { name: 'Bilal (Lasting)', username: 'bilal_last', password: '123', role: 'worker', department: 'lasting' },
    { name: 'Zain (Packing)', username: 'zain_pack', password: '123', role: 'worker', department: 'packing' }
  ];

  for (const u of usersToCreate) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({ data: u });
      console.log(`Created user: ${u.username}`);
    } else {
      console.log(`User already exists: ${u.username}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
