const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('model CompanyRecord')) {
  content += `

model CompanyRecord {
  id           String   @id @default("default")
  name         String
  address      String?
  contactEmail String?
  contactPhone String?
  gstNumber    String?
  updatedAt    DateTime @updatedAt
}
`;
  fs.writeFileSync(filePath, content);
  console.log('Model added');
}
