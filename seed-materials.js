const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Extracting materials from existing articles...");
  
  const articles = await prisma.article.findMany();
  console.log(`Found ${articles.length} articles.`);

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

  for (const art of articles) {
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
  console.log(`Found ${uniqueList.length} unique materials.`);

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
      process.stdout.write('.');
    } catch (e) {
      console.error("\nFailed to upsert material:", item, e.message);
    }
  }

  console.log("\nSeeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
