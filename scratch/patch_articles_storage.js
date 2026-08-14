const fs = require('fs');
const path = require('path');

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

const patchFile = (relPath) => {
  const filePath = path.join(__dirname, '../', relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('uploadToStorage = async')) {
    content = content.replace(
      `const [loading, setLoading] = useState(false);`,
      `const [loading, setLoading] = useState(false);\n${uploadHelper}`
    );
  }

  // Row photo (Materials)
  content = content.replace(
    /const handleRowPhotoUpload = \(setter: any, id: number, file: File\) => {\s*const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => updateRow\(setter, id, 'photo', reader\.result as string\);\s*reader\.readAsDataURL\(file\);\s*};/g,
    `const handleRowPhotoUpload = async (setter: any, id: number, file: File) => {
      try {
        const url = await uploadToStorage(file, 'materials');
        updateRow(setter, id, 'photo', url);
      } catch (err) {
        console.error(err);
      }
    };`
  );

  // Main Article Photos
  content = content.replace(
    /const handleMainPhotoUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {\s*if \(!e\.target\.files\) return;\s*Array\.from\(e\.target\.files\)\.forEach\(file => {\s*const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => setPhotos\(p => \[\.\.\.p, reader\.result as string\]\);\s*reader\.readAsDataURL\(file\);\s*}\);\s*};/g,
    `const handleMainPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      Array.from(e.target.files).forEach(async file => {
        try {
          const url = await uploadToStorage(file, 'articles');
          setPhotos(p => [...p, url]);
        } catch (err) {
          console.error(err);
        }
      });
    };`
  );

  fs.writeFileSync(filePath, content);
  console.log('Patched', relPath);
};

patchFile('src/app/(dashboard)/articles/new/page.tsx');
patchFile('src/app/(dashboard)/articles/[id]/edit/page.tsx');
