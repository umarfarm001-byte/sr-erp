const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.resolve(__dirname, 'prisma/dev.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

  console.log("Reading users from dev.db...");

  db.all("SELECT * FROM User", async (err, rows) => {
    if (err) {
      console.error("Error reading dev.db:", err);
      process.exit(1);
    }
    
    console.log(`Found ${rows.length} users in old database.`);

    for (const user of rows) {
      try {
        const exists = await prisma.user.findUnique({ where: { username: user.username } });
        if (!exists) {
          await prisma.user.create({
            data: {
              name: user.name,
              username: user.username,
              password: user.password,
              role: user.role,
              department: user.department
            }
          });
          console.log(`Migrated user: ${user.username}`);
        } else {
          // Update password and name just in case they were different
          await prisma.user.update({
            where: { username: user.username },
            data: {
              name: user.name,
              password: user.password
            }
          });
          console.log(`Updated existing user: ${user.username}`);
        }
      } catch (e) {
        console.error(`Error migrating user ${user.username}:`, e);
      }
    }

    console.log("Migration complete!");
    db.close();
    await prisma.$disconnect();
  });
}

main().catch(console.error);
