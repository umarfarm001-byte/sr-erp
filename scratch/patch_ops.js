const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/orders/[id]/JobCardClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Find the start of the operations map
const mapStartIndex = content.indexOf('{article.operations.map((op: any, index: number) => {');
if (mapStartIndex === -1) throw new Error("Could not find start of map");

// 2. We will insert the strictDeps and visibleOpIds calculation right before the map
const strictDepsBlock = `
            const strictDeps: Record<number, number[]> = {
               // Bulk
               42: [39],
               43: [40],
               44: [42, 43], // Preparing depends on Leather & Lining Cutting
               45: [44],     // Closing depends on Preparing
               46: [45],     // Upper Pass depends on Closing
               47: [46],     // Lasting depends on Upper Pass
               48: [47],     // LT Pass depends on Lasting
               49: [48],     // Injection Desma depends on LT Pass
               50: [48],     // Injection Pouring depends on LT Pass
               51: [49, 50], // Packing depends on Injection
               
               // Sample
               5: [2],
               6: [3],
               7: [5],
               8: [5],
               9: [5, 6],
               10: [9],
               11: [10],
               12: [11],
               13: [12],
               14: [13],
               15.1: [14],
               15.2: [14],
               16: [15.1, 15.2],
               17: [16],
               18: [17],
               19: [18],
               20: [19],
               21: [20],
               22: [21],
               23: [22],
               24: [23]
            };

            const visibleOpIds = new Set<number>();
            article.operations.forEach((op: any) => {
              const isAssigned = (role === 'admin') ? true : (role !== 'director' && (op.assignedUserId && op.assignedUserId.includes(role)));
              if (!isWorker || isAssigned) {
                visibleOpIds.add(op.opId);
                if (strictDeps[op.opId]) {
                  strictDeps[op.opId].forEach(dep => visibleOpIds.add(dep));
                }
              }
            });
`;

// Insert the logic before {article.operations.map
const beforeMap = content.substring(0, mapStartIndex);
let afterMap = content.substring(mapStartIndex);

// Replace "if (isWorker && !isAssigned) return null;"
afterMap = afterMap.replace(
  "if (isWorker && !isAssigned) return null;",
  "if (isWorker && !visibleOpIds.has(op.opId)) return null;"
);

// Remove the existing strictDeps definition
const strictDepsMatch = afterMap.match(/const strictDeps: Record<number, number\[\]> = \{[\s\S]*?\};\n/);
if (strictDepsMatch) {
  afterMap = afterMap.replace(strictDepsMatch[0], "");
} else {
  console.log("Warning: Could not find existing strictDeps");
}

fs.writeFileSync(filePath, beforeMap + "            {(() => {\n" + strictDepsBlock + "\n              return article.operations.map((op: any, index: number) => {\n" + afterMap.replace("{article.operations.map((op: any, index: number) => {", ""));

// Fix the IIFE closing
const endOfMap = afterMap.lastIndexOf('          </div>\r\n        </div>');
if (endOfMap !== -1) {
    // This is tricky, let's just do a string replace for the end of the map
}
