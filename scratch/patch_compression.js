const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/orders/[id]/JobCardClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes('imageCompression')) {
  content = content.replace(
    'import { useState, useEffect, useRef } from "react";',
    'import { useState, useEffect, useRef } from "react";\nimport imageCompression from "browser-image-compression";'
  );
}

// 1. handleDirectPhotoUpload patch
content = content.replace(
  `        const newPhotos = await Promise.all(Array.from(files).map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }));`,
  `        const newPhotos = await Promise.all(Array.from(files).map(async file => {
          const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1280, useWebWorker: true };
          try {
            const compressedFile = await imageCompression(file, options);
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(compressedFile);
            });
          } catch (error) {
            console.error("Compression error:", error);
            // fallback
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          }
        }));`
);

// 2. complete photos patch
// We need to replace the nested inline onChange for completePhotos
content = content.replace(
  `                        onChange={(e) => {
                          if (!e.target.files) return;
                          Array.from(e.target.files).forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => setCompletePhotos(p => [...p, reader.result as string]);
                            reader.readAsDataURL(file);
                          });
                        }}`,
  `                        onChange={async (e) => {
                          if (!e.target.files) return;
                          const files = Array.from(e.target.files);
                          for (const file of files) {
                            try {
                              const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1280, useWebWorker: true };
                              const compressedFile = await imageCompression(file, options);
                              const reader = new FileReader();
                              reader.onloadend = () => setCompletePhotos(p => [...p, reader.result as string]);
                              reader.readAsDataURL(compressedFile);
                            } catch(err) {
                              const reader = new FileReader();
                              reader.onloadend = () => setCompletePhotos(p => [...p, reader.result as string]);
                              reader.readAsDataURL(file);
                            }
                          }
                        }}`
);

fs.writeFileSync(filePath, content);
console.log('Compression patched');
