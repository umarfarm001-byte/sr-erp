const fs = require('fs');
let c = fs.readFileSync('src/app/api/operations/[id]/progress/route.ts', 'utf-8');

c = c.replace(
  'const { updates, userId, date } = body;',
  \const { updates, userId, date } = body;
    let dbUser = await prisma.user.findUnique({ where: { username: userId } });
    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
    }
    const finalUserId = dbUser ? dbUser.id : userId;\
);

c = c.replace(
  'userId,',
  'userId: finalUserId,'
);

fs.writeFileSync('src/app/api/operations/[id]/progress/route.ts', c);
