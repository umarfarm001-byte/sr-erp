const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dbPath = path.resolve(__dirname, 'prisma/dev.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

  console.log("Reading articles from dev.db to extract materials...");

  db.all("SELECT * FROM Article", async (err, rows) => {
    if (err) {
      console.error("Error reading dev.db:", err);
      process.exit(1);
    }
    
    console.log(`Found ${rows.length} articles in old database.`);
    const toUpsert = [];

    const extract = (category, jsonString) => {
      if (!jsonString) return;
      try {
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.name && typeof item.name === 'string' && item.name.trim() !== '') {
              toUpsert.push({ name: item.name.trim(), category });
            }
          }
        }
      } catch (e) {}
    };

    for (const art of rows) {
      extract('Leather Material', art.upperMaterials);
      extract('Lining Material', art.liningMaterials);
      extract('Extra Material', art.extraMaterials);
      extract('Logo/Labels', art.logoLabels);
      extract('D-Ring / Hooks', art.dringHooks);
      extract('Laces & TPU', art.lacesTpu);
      extract('Threads', art.threads);
      extract('Insole', art.insole);
      extract('Toe Cap / Counter', art.toeCap);
      extract('Last', art.last);
      extract('Mould', art.mould);
      extract('Packing', art.packing);
    }

    const uniqueList = Array.from(new Set(toUpsert.map(u => JSON.stringify(u)))).map(s => JSON.parse(s));
    console.log(`Found ${uniqueList.length} unique materials to migrate.`);

    for (const item of uniqueList) {
      try {
        await prisma.masterMaterial.upsert({
          where: {
            category_name: {
              category: item.category,
              name: item.name
            }
          },
          update: {},
          create: {
            category: item.category,
            name: item.name
          }
        });
      } catch (e) {
        console.error("Error migrating material", item.name, ":", e.message);
      }
    }

    console.log("Migration complete!");
    db.close();
    await prisma.$disconnect();
  });
}

main().catch(console.error);
