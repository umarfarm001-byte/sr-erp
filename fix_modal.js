const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', 'utf-8');

// 1. Add progressDate state
c = c.replace(
  'const [progressForm, setProgressForm] = useState<any>({});',
  "const [progressForm, setProgressForm] = useState<any>({});\n  const [progressDate, setProgressDate] = useState<string>(new Date().toISOString().split('T')[0]);"
);

// 2. Add progressDate to the fetch body
c = c.replace(
  "body: JSON.stringify({ updates, userId: role })",
  "body: JSON.stringify({ updates, userId: role, date: progressDate })"
);

// 3. Update the button onClick to reset progressDate
c = c.replace(
  "onClick={() => { setProgressModalOp(op); setProgressForm({}); }}",
  "onClick={() => { setProgressModalOp(op); setProgressForm({}); setProgressDate(new Date().toISOString().split('T')[0]); }}"
);

// 4. Add the date picker in the modal UI
c = c.replace(
  '<p className="text-slate-600 text-sm mb-6">Enter the quantity of pairs you completed today for each size.</p>',
  
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
    <input type="date" className="input-premium w-full max-w-[200px]" value={progressDate} onChange={(e) => setProgressDate(e.target.value)} />
  </div>
  <p className="text-slate-600 text-sm mb-6">Enter the quantity of pairs you completed on this date for each size.</p>
  
);

fs.writeFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', c);
