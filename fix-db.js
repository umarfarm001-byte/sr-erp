const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const userMap = {};
  users.forEach(u => userMap[u.id] = u.username);
  
  const ops = await prisma.operation.findMany();
  let count = 0;
  for (const op of ops) {
    if (op.assignedUserId && userMap[op.assignedUserId]) {
      await prisma.operation.update({
        where: { id: op.id },
        data: { assignedUserId: userMap[op.assignedUserId] }
      });
      console.log(`Updated op ${op.id} to ${userMap[op.assignedUserId]}`);
      count++;
    }
  }
  console.log(`Updated ${count} operations.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
