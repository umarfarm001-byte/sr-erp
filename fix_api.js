const fs = require('fs');
let c = fs.readFileSync('src/app/api/operations/[id]/progress/route.ts', 'utf-8');

c = c.replace(
  'const { updates, userId } = body;', 
  'const { updates, userId, date } = body;'
);

c = c.replace(
  'size: update.size,',
  'size: update.size,\n            date: date ? new Date(date) : undefined,'
);

fs.writeFileSync('src/app/api/operations/[id]/progress/route.ts', c);
