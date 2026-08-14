const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/orders/[id]/JobCardClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add upload helper function at the beginning of the component
const uploadHelper = `
  const uploadToStorage = async (file: File, folder: string = 'general'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };
`;
if (!content.includes('uploadToStorage = async')) {
  content = content.replace(
    `const [article, setArticle] = useState(order);`,
    `const [article, setArticle] = useState(order);\n${uploadHelper}`
  );
}

// 2. Replace handleDirectPhotoUpload logic
content = content.replace(
  /const newPhotos = await Promise\.all\(Array\.from\(files\)\.map\(file => {\s*return new Promise<string>\(\(resolve\) => {\s*const reader = new FileReader\(\);\s*reader\.onload = \(\) => resolve\(reader\.result as string\);\s*reader\.readAsDataURL\(file\);\s*}\);\s*}\)\);/g,
  `const newPhotos = await Promise.all(Array.from(files).map(file => uploadToStorage(file, \`operations/\${opId}\`)));`
);

// 3. Replace completeModalOp Photo upload logic
content = content.replace(
  /Array\.from\(e\.target\.files\)\.forEach\(file => {\s*const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => setCompletePhotos\(p => \[\.\.\.p, reader\.result as string\]\);\s*reader\.readAsDataURL\(file\);\s*}\);/g,
  `Array.from(e.target.files).forEach(async file => {
                            try {
                              const url = await uploadToStorage(file, \`completions/\${completeModalOp.id}\`);
                              setCompletePhotos(p => [...p, url]);
                            } catch(err) {
                              console.error(err);
                            }
                          });`
);

// 4. Replace DXF upload logic
content = content.replace(
  /const reader = new FileReader\(\);\s*reader\.onload = \(\) => {\s*setPatternForm\({\s*\.\.\.patternForm, \s*dxfName: file\.name, \s*dxfFileStatus: 'Uploaded',\s*dxfData: reader\.result as string \s*}\);\s*};\s*reader\.readAsDataURL\(file\);/g,
  `uploadToStorage(file, 'patterns').then(url => {
                                        setPatternForm({
                                          ...patternForm, 
                                          dxfName: file.name, 
                                          dxfFileStatus: 'Uploaded',
                                          dxfData: url 
                                        });
                                      }).catch(console.error);`
);

fs.writeFileSync(filePath, content);
console.log('Patched JobCardClient.tsx for Storage Uploads');
