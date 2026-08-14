const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', 'utf-8');

const oldLogic =               // Lining Cutting (6 or 43) shouldn't wait for Leather Cutting (5 or 42) to finish
              if (op.opId === 6) {
                requiredPreceding = requiredPreceding.filter((p: any) => p.opId !== 5);
              } else if (op.opId === 43) {
                requiredPreceding = requiredPreceding.filter((p: any) => p.opId !== 42);
              };

const newLogic =               // Lining Cutting (6 or 43) waits only for Lining Purchase (3 or 40), unless all lining materials are already marked available
              if (op.opId === 6 || op.opId === 43) {
                const allLiningAvailable = liningMaterials.length > 0 && liningMaterials.every((m: any) => m.available);
                if (allLiningAvailable) {
                  requiredPreceding = [];
                } else {
                  requiredPreceding = requiredPreceding.filter((p: any) => p.opId === 3 || p.opId === 40);
                }
              } 
              // Leather Cutting (5 or 42) waits only for Leather Purchase (2 or 39), unless all leather materials are already marked available
              else if (op.opId === 5 || op.opId === 42) {
                const allLeatherAvailable = upperMaterials.length > 0 && upperMaterials.every((m: any) => m.available);
                if (allLeatherAvailable) {
                  requiredPreceding = [];
                } else {
                  requiredPreceding = requiredPreceding.filter((p: any) => p.opId === 2 || p.opId === 39);
                }
              };

c = c.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', c);
