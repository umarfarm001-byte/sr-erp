const fs = require('fs');
const path = require('path');

// Base64 for a 1x1 blue pixel, we'll just use a small valid PNG
const base64Icon = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAABxJREFUeF7twTEBAAAAwqD1T20JT6AAAAAAAPgYigAAAXU6zWwAAAAASUVORK5CYII="; 

const iconBuffer = Buffer.from(base64Icon, 'base64');
const dir = path.join(__dirname, '../src/app/public/icons');
fs.mkdirSync(dir, { recursive: true });

// We write the same basic icon to both files to satisfy the PWA requirements
fs.writeFileSync(path.join(dir, 'icon-192x192.png'), iconBuffer);
fs.writeFileSync(path.join(dir, 'icon-512x512.png'), iconBuffer);

console.log("Icons created!");
