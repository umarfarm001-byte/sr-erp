const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany({ where: { username: 'manager' } });
  console.log('Manager user deleted');
}
main().finally(() => prisma.$disconnect());
