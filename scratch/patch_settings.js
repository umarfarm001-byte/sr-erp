const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/settings/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add new state variables inside component
if (!content.includes('companyProfile')) {
  content = content.replace(
    "const [testMode, setTestMode] = useState(false);",
    "const [testMode, setTestMode] = useState(false);\n  const [companyProfile, setCompanyProfile] = useState({ name: 'SR Footwear', address: '', contactEmail: '', contactPhone: '', gstNumber: '' });\n  const [savingProfile, setSavingProfile] = useState(false);"
  );
}

// Add fetch effect
if (!content.includes('/api/settings/profile')) {
  content = content.replace(
    "useEffect(() => {",
    `useEffect(() => {\n    fetch('/api/settings/profile').then(res => res.json()).then(data => { if(data && !data.error) setCompanyProfile(data); });\n`
  );
}

// Add save handler
if (!content.includes('handleSaveProfile')) {
  content = content.replace(
    "const handleTestModeToggle",
    `const handleSaveProfile = async () => {\n    setSavingProfile(true);\n    try {\n      await fetch('/api/settings/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(companyProfile) });\n      alert('Company Profile saved successfully!');\n    } catch(e) { alert('Failed to save profile.'); } finally { setSavingProfile(false); }\n  };\n\n  const handleTestModeToggle`
  );
}

// Add UI
const profileUI = `
      <div className="card-premium p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Factory / Company Profile</h3>
            <p className="text-sm text-slate-500">Internal records of the company using this software.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Company Name</label>
            <input type="text" value={companyProfile.name} onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="e.g. XYZ Footwear" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">GST Number</label>
            <input type="text" value={companyProfile.gstNumber || ''} onChange={e => setCompanyProfile({...companyProfile, gstNumber: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="e.g. 07AABCU9603R1Z..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
            <input type="email" value={companyProfile.contactEmail || ''} onChange={e => setCompanyProfile({...companyProfile, contactEmail: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="admin@xyz.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
            <input type="text" value={companyProfile.contactPhone || ''} onChange={e => setCompanyProfile({...companyProfile, contactPhone: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="+91 9876543210" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Full Address</label>
            <textarea value={companyProfile.address || ''} onChange={e => setCompanyProfile({...companyProfile, address: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" rows={2} placeholder="Factory Address"></textarea>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
            {savingProfile ? 'Saving...' : 'Save Profile Details'}
          </button>
        </div>
      </div>
`;

if (!content.includes('Factory / Company Profile')) {
  content = content.replace(
    `<div className="card-premium p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Developer / Test Mode</h3>`,
    profileUI + `\n      <div className="card-premium p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Developer / Test Mode</h3>`
  );
}

fs.writeFileSync(filePath, content);
console.log('Settings page patched');
