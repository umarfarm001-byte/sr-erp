const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(dashboard)/articles/new/page.tsx',
  'src/app/(dashboard)/articles/[id]/edit/page.tsx'
];

for (const filePath of files) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // 1. Add suggestions state
  if (!code.includes('const [suggestions, setSuggestions]')) {
    code = code.replace(
      'const [loading, setLoading] = useState(false);',
      'const [loading, setLoading] = useState(false);\n  const [suggestions, setSuggestions] = useState<any[]>([]);'
    );
  }

  // 2. Fetch suggestions in useEffect
  if (!code.includes('fetchSuggestions')) {
    const useEffectStr = `useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/suggestions');
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSuggestions();
`;
    
    // Find the first useEffect and insert it there.
    if (code.includes('useEffect(() => {') && filePath.includes('new/page.tsx')) {
        code = code.replace('useEffect(() => {', useEffectStr);
    } else if (filePath.includes('edit/page.tsx')) {
        // Find existing useEffect for fetchArticle
        code = code.replace('useEffect(() => {', useEffectStr);
    }
  }

  // 3. Render datalists at the end of the form or near the top
  const dataListsStr = `
        {/* Render Datalists for Suggestions */}
        {Array.from(new Set(suggestions.map(s => s.category))).map(category => (
          <datalist id={\`suggestions-\${category}\`} key={category}>
            {suggestions.filter(s => s.category === category).map(s => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        ))}
  `;
  if (!code.includes('{/* Render Datalists for Suggestions */}')) {
    code = code.replace('<form onSubmit={handleSubmit}', dataListsStr + '\n      <form onSubmit={handleSubmit}');
  }

  // 4. Update renderComponentRow to use list attribute
  const inputSearch = `<input type="text" placeholder="Material Name" className="input-premium py-2 text-sm" value={item.name} onChange={e => updateRow(setter, item.id, 'name', e.target.value)} />`;
  const inputReplace = `<input type="text" placeholder="Material Name" className="input-premium py-2 text-sm" list={\`suggestions-\${title}\`} value={item.name} onChange={e => updateRow(setter, item.id, 'name', e.target.value)} />`;
  code = code.replace(inputSearch, inputReplace);

  fs.writeFileSync(filePath, code, 'utf-8');
  console.log(`Updated ${filePath}`);
}
