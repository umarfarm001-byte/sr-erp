const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // First, delete the dummy generic users we created earlier to avoid clutter
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: '_'
      },
      role: 'worker'
    }
  });

  const exactUsers = [
    // Step 1 - Purchase
    { name: 'Leather Purchaser', username: 'purch_leather', password: '123', role: 'worker', department: 'purchase' },
    { name: 'Lining Purchaser', username: 'purch_lining', password: '123', role: 'worker', department: 'purchase' },
    { name: 'Other Materials Purchaser (Toecap/Midplate/Box/Chem)', username: 'purch_other', password: '123', role: 'worker', department: 'purchase' },
    
    // Step 2 - Cutting
    { name: 'Leather Cutting, Splitting, Skiving, Passing', username: 'cut_leather', password: '123', role: 'worker', department: 'cutting' },
    { name: 'Lining Cutting', username: 'cut_lining', password: '123', role: 'worker', department: 'cutting' },

    // Step 3 - Preparing
    { name: 'Preparing (Cloth Pasting, Label, Seam Sealing, Crimping)', username: 'prep_main', password: '123', role: 'worker', department: 'prep' },

    // Step 4 - Closing (8 users)
    { name: 'Closing User 1', username: 'close_1', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 2', username: 'close_2', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 3', username: 'close_3', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 4', username: 'close_4', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 5', username: 'close_5', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 6', username: 'close_6', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 7', username: 'close_7', password: '123', role: 'worker', department: 'closing' },
    { name: 'Closing User 8', username: 'close_8', password: '123', role: 'worker', department: 'closing' },

    // Step 5 - Upper Pass
    { name: 'Upper Pass User 1 (Cleaning, Eyeleting, Lacing, Passing)', username: 'upass_1', password: '123', role: 'worker', department: 'packing' },
    { name: 'Upper Pass User 2 (Cleaning, Eyeleting, Lacing, Passing)', username: 'upass_2', password: '123', role: 'worker', department: 'packing' },

    // Step 6 - Lasting
    { name: 'Lasting User 1 (Counter Moulding, Strobell, Lasting)', username: 'last_1', password: '123', role: 'worker', department: 'lasting' },
    { name: 'Lasting User 2 (Counter Moulding, Strobell, Lasting)', username: 'last_2', password: '123', role: 'worker', department: 'lasting' },

    // Step 7 - LT Pass
    { name: 'LT Pass User 1 (Passing, Packing)', username: 'ltpass_1', password: '123', role: 'worker', department: 'packing' },
    { name: 'LT Pass User 2 (Passing, Packing)', username: 'ltpass_2', password: '123', role: 'worker', department: 'packing' },

    // Step 8 - Injection Desma
    { name: 'Injection Desma User 1 (Sole Injection, Finishing, Insocks, Lacing)', username: 'desma_1', password: '123', role: 'worker', department: 'lasting' },
    { name: 'Injection Desma User 2 (Sole Injection, Finishing, Insocks, Lacing)', username: 'desma_2', password: '123', role: 'worker', department: 'lasting' },

    // Step 9 - Injection Pouring
    { name: 'Injection Pouring User 1 (Sole Injection, Finishing, Insocks, Lacing)', username: 'pour_1', password: '123', role: 'worker', department: 'lasting' },
    { name: 'Injection Pouring User 2 (Sole Injection, Finishing, Insocks, Lacing)', username: 'pour_2', password: '123', role: 'worker', department: 'lasting' },

    // Step 10 - Final Passing & Packing
    { name: 'Final Passing & Packing User 1', username: 'fpack_1', password: '123', role: 'worker', department: 'packing' },
    { name: 'Final Passing & Packing User 2', username: 'fpack_2', password: '123', role: 'worker', department: 'packing' }
  ];

  let createdCount = 0;
  for (const u of exactUsers) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({ data: u });
      createdCount++;
    }
  }
  console.log(`Created ${createdCount} EXACT bulk department users.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
