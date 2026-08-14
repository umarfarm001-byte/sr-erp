const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: '123',
      role: 'admin',
      name: 'System Admin'
    }
  });
  console.log('Admin user seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
