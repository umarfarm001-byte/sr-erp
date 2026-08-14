const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', 'utf-8');

c = c.replace(/const isOtherPurchaser = role\.includes\('purch_other'\);/g, "const isOtherPurchaser = role.includes('purch_other');\n  const canEditMaterials = role === 'admin' || role.includes('purch');");
c = c.replace(/\(role === 'admin' \|\| role === 'director' \|\| isLeatherDept\)/g, "canEditMaterials");
c = c.replace(/\(role === 'admin' \|\| role === 'director' \|\| isLiningDept\)/g, "canEditMaterials");
c = c.replace(/\(role === 'admin' \|\| role === 'director' \|\| isAppDept\)/g, "canEditMaterials");
c = c.replace(/\(role === 'admin' \|\| role === 'director' \|\| isBottomDept\)/g, "canEditMaterials");
c = c.replace(/\(role === 'admin' \|\| role === 'director'\)/g, "canEditMaterials");

fs.writeFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', c);
