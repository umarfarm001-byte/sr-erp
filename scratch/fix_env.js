const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
let envContent = fs.readFileSync(envPath, 'utf8').trim();

// If it's just the URL without DATABASE_URL=
if (envContent.startsWith('postgresql://')) {
  // Extract password which is between 'postgres:' and the last '@'
  // URL: postgresql://postgres:PASSWORD@HOST...
  const prefix = 'postgresql://postgres:';
  const prefixIndex = envContent.indexOf(prefix);
  
  if (prefixIndex !== -1) {
    const afterPrefix = envContent.substring(prefixIndex + prefix.length);
    const lastAtIndex = afterPrefix.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const password = afterPrefix.substring(0, lastAtIndex);
      const hostPart = afterPrefix.substring(lastAtIndex);
      
      // URL encode the password
      const encodedPassword = encodeURIComponent(password);
      
      const newUrl = prefix + encodedPassword + hostPart;
      
      fs.writeFileSync(envPath, `DATABASE_URL="${newUrl}"\n`);
      console.log('Fixed .env file with URL encoding');
    }
  }
}
