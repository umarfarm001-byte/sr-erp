"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PackageOpen, Scissors, CheckSquare, Users, Trash2, UploadCloud, X, Plus, Camera, ArrowRight, ArrowLeft, User } from 'lucide-react';
import ZoomableImage from '@/components/ui/ZoomableImage';
import { CORE_OPS, RLABELS } from '@/lib/operations';

const getSuitableUsers = (allUsers: any[], stepDefaultUser: string) => {
  const workers = allUsers.filter(u => u.role === 'worker');
  switch(stepDefaultUser) {
    case 'bp_purch_leather': return workers.filter(u => u.username === 'purch_leather');
    case 'bp_purch_lining': return workers.filter(u => u.username === 'purch_lining');
    case 'bp_purch_other': return workers.filter(u => u.username === 'purch_other');
    case 'bp_cut_leather': return workers.filter(u => u.username === 'cut_leather');
    case 'bp_cut_lining': return workers.filter(u => u.username === 'cut_lining');
    case 'bp_prepare': return workers.filter(u => u.department === 'prep');
    case 'bp_closing': return workers.filter(u => u.department === 'closing');
    case 'bp_upper_pass': return workers.filter(u => u.username.startsWith('upass_'));
    case 'bp_lasting': return workers.filter(u => u.username.startsWith('last_') && u.username !== 'last');
    case 'bp_lt_pass': return workers.filter(u => u.username.startsWith('ltpass_'));
    case 'bp_inj_desma': return workers.filter(u => u.username.startsWith('desma_'));
    case 'bp_inj_pouring': return workers.filter(u => u.username.startsWith('pour_'));
    case 'bp_final_pack': return workers.filter(u => u.username.startsWith('fpack_'));
    default: return workers;
  }
};

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<'sample' | 'production' | 'bulk' | null>(null);
  const [role, setRole] = useState('admin');
  
  // Shared States
  const [serial, setSerial] = useState('');
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSteps, setSelectedSteps] = useState<any[]>([]);
  
  // Sample Form States
  const [customers, setCustomers] = useState<string[]>([]);
  const [articleCodes, setArticleCodes] = useState<string[]>([]);
  const [party, setParty] = useState('');
  const [newParty, setNewParty] = useState('');
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [articleName, setArticleName] = useState('');
  const [newArticleName, setNewArticleName] = useState('');
  const [isAddingArticleName, setIsAddingArticleName] = useState(false);

  const [sampleType, setSampleType] = useState('Upper');
  const [pattern, setPattern] = useState({ designerName: '', dxfFileStatus: 'Not Available', dxfName: '' });
  const [sizeSystem, setSizeSystem] = useState('eu');
  const [sizePairs, setSizePairs] = useState([{ id: 1, size: '', pairs: '' }]);
  
  const createCompRow = () => ({ id: Date.now(), name: '', thickness: '', color: '', uom: '', qty: '', photo: '' });
  const createThreadRow = () => ({ id: Date.now(), name: '', thickness: '', color: '', uom: '', qty: '', photo: '' }); 
  const [upperMaterials, setUpperMaterials] = useState([createCompRow()]);
  const [liningMaterials, setLiningMaterials] = useState([createCompRow()]);
  const [extraMaterials, setExtraMaterials] = useState([createCompRow()]);
  const [logoLabels, setLogoLabels] = useState([createCompRow()]);
  const [dringHooks, setDringHooks] = useState([createCompRow()]);
  const [lacesTpu, setLacesTpu] = useState([createCompRow()]);
  const [threads, setThreads] = useState([createThreadRow()]);
  
  const [insole, setInsole] = useState({ include: false, name: '', elastic: false });
  const [toeCap, setToeCap] = useState({ type: 'STC — Steel Toe Cap', name: '', sizes: [{ id: 1, size: '' }] });
  const [last, setLast] = useState({ status: 'have', haveName: '', haveSize: '', newName: '', newSupplier: '', newStl: '', newSizePair: '', newSent: '', newReceive: '' });
  const [mould, setMould] = useState({ name: '', type: 'Steel', density: 'Single', material: 'PU/PU' });
  const [injectionDetails, setInjectionDetails] = useState([{ id: 1, name: '', detail: '' }]);
  const [packing, setPacking] = useState({ boxDetail: '', boxSize: '', booklet: '', packingParts: '' });
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Production & Bulk Order specific States
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [selectedLinkedArticleId, setSelectedLinkedArticleId] = useState('');
  const [poQty, setPoQty] = useState('');
  const [poDelDate, setPoDelDate] = useState('');
  const [poRemarks, setPoRemarks] = useState('');

  const [bulkSizePairs, setBulkSizePairs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem('erp_role') || 'admin';
    setRole(storedRole);

    fetch('/api/dropdowns').then(res => res.json()).then(data => {
      if (data.customers) setCustomers(data.customers);
      if (data.articleCodes) setArticleCodes(data.articleCodes);
    });
    fetch('/api/articles').then(res => res.json()).then(data => {
      if(Array.isArray(data)) {
        // Find samples and production orders for linking
        setAllArticles(data);
      }
    });
    fetch('/api/users').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setAllUsers(data);
    });
  }, []);

  useEffect(() => {
    const generateNextSerial = (type: 'sample' | 'production' | 'bulk') => {
      const typeArticles = allArticles.filter(a => a.type === type);
      let maxNum = 0;
      typeArticles.forEach(a => {
        const match = a.serial.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = (maxNum + 1).toString().padStart(2, '0');
      
      if (type === 'sample') return `SAM-${nextNum}`;
      if (type === 'production') return `PRO-${nextNum}`;
      if (type === 'bulk') return `BULK-${nextNum}`;
      return '';
    };

    if (orderType === 'sample') {
      setSerial(generateNextSerial('sample'));
      setSelectedSteps(CORE_OPS.filter(op => op.phase === 1).map(op => ({ ...op, selected: true, assignedUserId: op.defaultUser })));
    } else if (orderType === 'production') {
      setSerial(generateNextSerial('production'));
      setSelectedSteps(CORE_OPS.filter(op => op.phase === 2).map(op => ({ ...op, selected: true, assignedUserId: op.defaultUser })));
    } else if (orderType === 'bulk') {
      setSerial(generateNextSerial('bulk'));
      setSelectedSteps(CORE_OPS.filter(op => op.phase === 3).map(op => {
        const suitable = getSuitableUsers(allUsers, op.defaultUser);
        let assigned = '';
        if (suitable.length === 1) {
          assigned = suitable[0].username;
        }
        return { ...op, selected: true, assignedUserId: assigned };
      }));
    }
  }, [orderType, allArticles, allUsers]);

  const addRow = (setter: any, factory: any) => setter((prev: any) => [...prev, factory()]);
  const removeRow = (setter: any, id: number) => setter((prev: any) => prev.filter((item: any) => item.id !== id));
  const updateRow = (setter: any, id: number, field: string, value: string) => setter((prev: any) => prev.map((item: any) => item.id === id ? { ...item, [field]: value } : item));

  const handleRowPhotoUpload = (setter: any, id: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => updateRow(setter, id, 'photo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMainPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos(p => [...p, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleToggleStep = (index: number) => {
    const updated = [...selectedSteps];
    updated[index].selected = !updated[index].selected;
    setSelectedSteps(updated);
  };

  const handleSubmitSample = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalParty = isAddingParty ? newParty : party;
    const finalArticleName = isAddingArticleName ? newArticleName : articleName;

    if (!finalParty) return alert("Please select or add a Customer/Party.");
    if (!finalArticleName) return alert("Please select or add an Article Code.");

    setLoading(true);
    if (isAddingParty) await fetch('/api/dropdowns', { method: 'POST', body: JSON.stringify({ type: 'customer', value: newParty }) });
    if (isAddingArticleName) await fetch('/api/dropdowns', { method: 'POST', body: JSON.stringify({ type: 'articleCode', value: newArticleName }) });
    
    const activeSteps = selectedSteps.filter(s => s.selected).map(s => ({ opId: s.id, name: s.name, dept: RLABELS[s.defaultUser] || s.defaultUser, assignedUserId: s.assignedUserId || 'unassigned' }));

    try {
      const payload = {
        serial, party: finalParty, articleName: finalArticleName, type: 'sample', isBulkProd: false, selectedSteps: activeSteps,
        sampleType, pattern: JSON.stringify(pattern), sizeSystem, sizePairs: JSON.stringify(sizePairs),
        upperMaterials: JSON.stringify(upperMaterials), liningMaterials: JSON.stringify(liningMaterials),
        logoLabels: JSON.stringify(logoLabels), dringHooks: JSON.stringify(dringHooks), lacesTpu: JSON.stringify(lacesTpu),
        threads: JSON.stringify(threads), insole: JSON.stringify(insole), toeCap: JSON.stringify(toeCap),
        last: JSON.stringify(last), mould: JSON.stringify(mould), injectionDetails: JSON.stringify(injectionDetails),
        packing: JSON.stringify(packing), photos: JSON.stringify(photos)
      };

      const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) router.push('/orders');
      else alert("Failed to create sample");
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmitLinkedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLinkedArticleId) return alert("Please select an article to link to.");
    
    const linkedArt = allArticles.find(a => a.id === selectedLinkedArticleId);
    if (!linkedArt) return alert("Linked article not found");

    setLoading(true);
    const activeSteps = selectedSteps.filter(s => s.selected).map(s => ({ opId: s.id, name: s.name, dept: RLABELS[s.defaultUser] || s.defaultUser, assignedUserId: s.assignedUserId || 'unassigned' }));

    try {
      const payload = {
        serial, 
        party: linkedArt.party, 
        articleName: linkedArt.articleName, 
        type: orderType, 
        isBulkProd: orderType === 'bulk', 
        selectedSteps: activeSteps,
        
        // Inherited specs
        sampleType: linkedArt.sampleType, pattern: linkedArt.pattern, sizeSystem: linkedArt.sizeSystem, sizePairs: JSON.stringify(bulkSizePairs),
        upperMaterials: JSON.stringify(upperMaterials), liningMaterials: JSON.stringify(liningMaterials), extraMaterials: JSON.stringify(extraMaterials),
        logoLabels: JSON.stringify(logoLabels), dringHooks: JSON.stringify(dringHooks), lacesTpu: JSON.stringify(lacesTpu),
        threads: JSON.stringify(threads), insole: JSON.stringify(insole), toeCap: JSON.stringify(toeCap),
        last: JSON.stringify(last), mould: JSON.stringify(mould), injectionDetails: linkedArt.injectionDetails,
        packing: JSON.stringify(packing), photos: linkedArt.photos,

        // New fields
        qty: poQty,
        deliveryDate: poDelDate,
        remarks: poRemarks,
        linkedArticleId: linkedArt.id
      };

      const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) router.push('/orders');
      else alert("Failed to create order");
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const renderComponentRow = (item: any, setter: any, title: string, isUpper: boolean = false) => {
    const uoms = isUpper ? ['DCM', 'SQ/MT'] : ['DCM', 'MTR', 'SQ/MT', 'PCS', 'PAIR', 'SPOOL'];
    return (
      <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
          <button type="button" onClick={() => removeRow(setter, item.id)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-4 items-start">
          <div className="space-y-3">
            <input type="text" placeholder="Material Name" className="input-premium py-2 text-sm" value={item.name} onChange={e => updateRow(setter, item.id, 'name', e.target.value)} />
            <input type="text" placeholder="Thickness" className="input-premium py-2 text-sm" value={item.thickness} onChange={e => updateRow(setter, item.id, 'thickness', e.target.value)} />
          </div>
          <div>
            <input type="text" placeholder="Color" className="input-premium py-2 text-sm" value={item.color} onChange={e => updateRow(setter, item.id, 'color', e.target.value)} />
          </div>
          <div className="space-y-3">
            <select className="input-premium py-2 text-sm" value={item.uom} onChange={e => updateRow(setter, item.id, 'uom', e.target.value)}>
              <option value="">UOM</option>{uoms.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" placeholder="QTY" className="input-premium py-2 text-sm" value={item.qty} onChange={e => updateRow(setter, item.id, 'qty', e.target.value)} />
          </div>
          <div>
            {item.photo ? (
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-200 group">
                <ZoomableImage src={item.photo} className="w-full h-full object-cover" />
                <button type="button" onClick={() => updateRow(setter, item.id, 'photo', '')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
              </div>
            ) : (
              <label className="aspect-square w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center cursor-pointer text-slate-400 transition-colors">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleRowPhotoUpload(setter, item.id, e.target.files[0])} />
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderThreadRow = (item: any, setter: any) => (
    <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thread Detail</div>
        <button type="button" onClick={() => removeRow(setter, item.id)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-[1fr_1fr_80px] gap-4 items-start">
        <div className="space-y-3">
          <input type="text" placeholder="Article No" className="input-premium py-2 text-sm" value={item.name} onChange={e => updateRow(setter, item.id, 'name', e.target.value)} />
          <input type="text" placeholder="Colour" className="input-premium py-2 text-sm" value={item.color} onChange={e => updateRow(setter, item.id, 'color', e.target.value)} />
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Shade No" className="input-premium py-2 text-sm" value={item.thickness} onChange={e => updateRow(setter, item.id, 'thickness', e.target.value)} />
          <input type="number" placeholder="Quantity" className="input-premium py-2 text-sm" value={item.qty} onChange={e => updateRow(setter, item.id, 'qty', e.target.value)} />
        </div>
        <div>
          {item.photo ? (
            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-200 group">
              <ZoomableImage src={item.photo} className="w-full h-full object-cover" />
              <button type="button" onClick={() => updateRow(setter, item.id, 'photo', '')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
            </div>
          ) : (
            <label className="aspect-square w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center cursor-pointer text-slate-400 transition-colors">
              <Camera size={20} />
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleRowPhotoUpload(setter, item.id, e.target.files[0])} />
            </label>
          )}
        </div>
      </div>
    </div>
  );

  const isCounterOrMore = ['Counter Moulded', 'Lasted', 'Complete Shoe'].includes(sampleType);
  const isLastedOrMore = ['Lasted', 'Complete Shoe'].includes(sampleType);
  const isComplete = sampleType === 'Complete Shoe';

  const linkableArticles = orderType === 'production' 
    ? allArticles.filter(a => a.type === 'sample') 
    : allArticles.filter(a => a.type === 'production');

  const selectedLinkedArt = allArticles.find(a => a.id === selectedLinkedArticleId);
  const selectedLinkedPhotos = selectedLinkedArt && selectedLinkedArt.photos ? JSON.parse(selectedLinkedArt.photos) : [];

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><X size={32} /></div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-md">Only Administrators have permission to create or generate new Job Cards. You only have permission to view your assigned tasks and update progress.</p>
        <button onClick={() => router.push('/orders')} className="btn-primary mt-6 px-6 py-2">Return to Bulk Orders</button>
      </div>
    );
  }

  const renderMaterialAccordions = () => (
    <div className="space-y-6">
      {/* DYNAMIC LISTS WITH PHOTOS */}
            <div className="font-bold text-slate-900 border-t border-slate-200 pt-6">1. Leather</div>
            <div className="space-y-3">
              {upperMaterials.map(m => renderComponentRow(m, setUpperMaterials, 'Leather Material', true))}
              <button type="button" onClick={() => addRow(setUpperMaterials, createCompRow)} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Material</button>
            </div>

            <div className="font-bold text-slate-900 border-t border-slate-200 pt-6">2. Lining</div>
            <div className="space-y-3">
              {liningMaterials.map(m => renderComponentRow(m, setLiningMaterials, 'Lining Material'))}
              <button type="button" onClick={() => addRow(setLiningMaterials, createCompRow)} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Material</button>
            </div>

            <div className="font-bold text-slate-900 border-t border-slate-200 pt-6">3. Application</div>
            <div className="pl-4 border-l-2 border-slate-200 space-y-6">
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Add Logo & Labels</div>
                <div className="space-y-3">
                  {logoLabels.map(m => renderComponentRow(m, setLogoLabels, 'Logo/Label'))}
                  <button type="button" onClick={() => addRow(setLogoLabels, createCompRow)} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Component</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Add D-Ring & Hook</div>
                <div className="space-y-3">
                  {dringHooks.map(m => renderComponentRow(m, setDringHooks, 'Hardware'))}
                  <button type="button" onClick={() => addRow(setDringHooks, createCompRow)} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Component</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Add Laces & TPU</div>
                <div className="space-y-3">
                  {lacesTpu.map(m => renderComponentRow(m, setLacesTpu, 'Lace/TPU'))}
                  <button type="button" onClick={() => addRow(setLacesTpu, createCompRow)} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Component</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Thread Details</div>
                <div className="space-y-3">
                  {threads.map(m => renderThreadRow(m, setThreads))}
                  <button type="button" onClick={() => addRow(setThreads, createThreadRow)} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Thread</button>
                </div>
              </div>
            </div>

            {/* 4. BOTTOM */}
            <div className="font-bold text-slate-900 border-t border-slate-200 pt-6">4. Bottom</div>
            <div className="pl-4 border-l-2 border-slate-200 space-y-6">
              {isCounterOrMore && (
                <>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Insole</div>
                    <select className="input-premium mb-3 max-w-xs" value={insole.include ? 'yes' : 'no'} onChange={e => setInsole({...insole, include: e.target.value === 'yes'})}><option value="no">-- No --</option><option value="yes">Yes</option></select>
                    {insole.include && (
                      <div className="space-y-3"><input type="text" placeholder="Insole Material Name" className="input-premium max-w-md" value={insole.name} onChange={e => setInsole({...insole, name: e.target.value})} /><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={insole.elastic} onChange={e => setInsole({...insole, elastic: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-600" /><span className="text-sm font-semibold text-slate-700">With Elastic?</span></label></div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Toe Cap</div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Toe Cap Type</label><select className="input-premium" value={toeCap.type} onChange={e => setToeCap({...toeCap, type: e.target.value})}><option>STC — Steel Toe Cap</option><option>CTC — Composite Toe Cap</option><option>GTC — Glass Fibre Toe Cap</option><option>Toe Puff</option></select></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Toe Cap Name</label><input type="text" placeholder="Name" className="input-premium" value={toeCap.name} onChange={e => setToeCap({...toeCap, name: e.target.value})} /></div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500">Toe Cap Sizes</label>
                      {toeCap.sizes.map((s) => (
                        <div key={s.id} className="flex gap-4"><input type="text" placeholder="Size" className="input-premium max-w-[200px]" value={s.size} onChange={e => setToeCap({...toeCap, sizes: toeCap.sizes.map(ts => ts.id === s.id ? { ...ts, size: e.target.value } : ts)})} /><button type="button" onClick={() => setToeCap({...toeCap, sizes: toeCap.sizes.filter(ts => ts.id !== s.id)})} className="p-3 text-red-500"><Trash2 size={18} /></button></div>
                      ))}
                      <button type="button" onClick={() => setToeCap({...toeCap, sizes: [...toeCap.sizes, { id: Date.now(), size: '' }]})} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Toe Cap Size</button>
                    </div>
                  </div>
                </>
              )}
              {isLastedOrMore && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700 mb-2">Last</div>
                  <select className="input-premium max-w-xs mb-3" value={last.status} onChange={e => setLast({...last, status: e.target.value})}><option value="">-- Select --</option><option value="have">Already Have</option><option value="new">New Development</option></select>
                  {last.status === 'have' && (
                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Last Name" className="input-premium" value={last.haveName} onChange={e => setLast({...last, haveName: e.target.value})} /><input type="text" placeholder="Size (e.g. UK 7)" className="input-premium" value={last.haveSize} onChange={e => setLast({...last, haveSize: e.target.value})} /></div>
                  )}
                  {last.status === 'new' && (
                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Last Name" className="input-premium" value={last.newName} onChange={e => setLast({...last, newName: e.target.value})} /><input type="text" placeholder="Last Supplier" className="input-premium" value={last.newSupplier} onChange={e => setLast({...last, newSupplier: e.target.value})} /><input type="text" placeholder="STL File Name" className="input-premium" value={last.newStl} onChange={e => setLast({...last, newStl: e.target.value})} /><input type="text" placeholder="Size Pair" className="input-premium" value={last.newSizePair} onChange={e => setLast({...last, newSizePair: e.target.value})} /><div><label className="block text-xs font-semibold text-slate-500 mb-1">Sent Date</label><input type="date" className="input-premium" value={last.newSent} onChange={e => setLast({...last, newSent: e.target.value})} /></div><div><label className="block text-xs font-semibold text-slate-500 mb-1">Receive Date</label><input type="date" className="input-premium" value={last.newReceive} onChange={e => setLast({...last, newReceive: e.target.value})} /></div></div>
                  )}
                </div>
              )}
              {isComplete && (
                <>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Mould</div>
                    <div className="space-y-3"><input type="text" placeholder="Mould Name" className="input-premium" value={mould.name} onChange={e => setMould({...mould, name: e.target.value})} /><div className="grid grid-cols-3 gap-4"><div><label className="block text-xs font-semibold text-slate-500 mb-1">Mould Type</label><select className="input-premium" value={mould.type} onChange={e => setMould({...mould, type: e.target.value})}><option>Steel</option><option>Composite</option></select></div><div><label className="block text-xs font-semibold text-slate-500 mb-1">Density</label><select className="input-premium" value={mould.density} onChange={e => setMould({...mould, density: e.target.value})}><option>Single</option><option>Double</option><option>Triple</option></select></div><div><label className="block text-xs font-semibold text-slate-500 mb-1">Mould Material</label><select className="input-premium" value={mould.material} onChange={e => setMould({...mould, material: e.target.value})}><option>PU/PU</option><option>PU/RU</option></select></div></div></div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Injection Detail</div>
                    <div className="space-y-2">
                      {injectionDetails.map((id) => (
                        <div key={id.id} className="flex gap-4"><input type="text" placeholder="Name" className="input-premium flex-1" value={id.name} onChange={e => updateRow(setInjectionDetails, id.id, 'name', e.target.value)} /><input type="text" placeholder="Detail" className="input-premium flex-1" value={id.detail} onChange={e => updateRow(setInjectionDetails, id.id, 'detail', e.target.value)} /><button type="button" onClick={() => removeRow(setInjectionDetails, id.id)} className="p-3 text-red-500"><Trash2 size={18} /></button></div>
                      ))}
                      <button type="button" onClick={() => addRow(setInjectionDetails, () => ({ id: Date.now(), name: '', detail: '' }))} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Component</button>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Packing</div>
                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Box Detail" className="input-premium" value={packing.boxDetail} onChange={e => setPacking({...packing, boxDetail: e.target.value})} /><input type="text" placeholder="Box Size (e.g. 30x20x12 cm)" className="input-premium" value={packing.boxSize} onChange={e => setPacking({...packing, boxSize: e.target.value})} /><input type="text" placeholder="Booklet" className="input-premium" value={packing.booklet} onChange={e => setPacking({...packing, booklet: e.target.value})} /><input type="text" placeholder="Packing Parts" className="input-premium" value={packing.packingParts} onChange={e => setPacking({...packing, packingParts: e.target.value})} /></div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="font-bold text-slate-900 mb-4">Sample Photos (Overall)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group">
                    <ZoomableImage src={photo} alt="Uploaded sample" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={14} /></button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-blue-600 gap-2">
                  <UploadCloud size={32} />
                  <span className="text-sm font-semibold">Upload Photo</span>
                  <input type="file" ref={fileInputRef} onChange={handleMainPhotoUpload} accept="image/*" multiple className="hidden" />
                </label>
              </div>
            </div>

    </div>
  );


  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Job Card</h1>
        <p className="text-slate-500 text-sm mt-1">Select the order type and customize the production steps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button type="button" onClick={() => setOrderType('sample')} className={`p-6 rounded-xl border-2 text-left transition-all ${orderType === 'sample' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4"><Scissors size={24} /></div>
          <h3 className="text-lg font-bold text-slate-900">Create Sample</h3>
        </button>
        <button type="button" onClick={() => setOrderType('production')} className={`p-6 rounded-xl border-2 text-left transition-all ${orderType === 'production' ? 'border-purple-600 bg-purple-50' : 'border-slate-200 bg-white hover:border-purple-300'}`}>
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4"><CheckSquare size={24} /></div>
          <h3 className="text-lg font-bold text-slate-900">Production Order</h3>
        </button>
        <button type="button" onClick={() => setOrderType('bulk')} className={`p-6 rounded-xl border-2 text-left transition-all ${orderType === 'bulk' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><PackageOpen size={24} /></div>
          <h3 className="text-lg font-bold text-slate-900">Send to Bulk</h3>
        </button>
      </div>

      {orderType === 'sample' && (
        <form onSubmit={handleSubmitSample} className="card-premium p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Serial Number (Auto)</label><input disabled type="text" className="input-premium bg-slate-100 text-slate-500 font-bold" value={serial} /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Date (Auto)</label><input disabled type="date" className="input-premium bg-slate-100 text-slate-500 font-bold" value={todayDate} /></div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Customer / Party</label>
              {isAddingParty ? (
                <div className="flex gap-2"><input autoFocus type="text" className="input-premium flex-1 border-blue-500 ring-2 ring-blue-100" placeholder="Type new customer..." value={newParty} onChange={e => setNewParty(e.target.value)} /><button type="button" onClick={() => { setIsAddingParty(false); setNewParty(''); }} className="p-3 text-slate-500 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div>
              ) : (
                <select className="input-premium" value={party} onChange={e => { if (e.target.value === 'ADD_NEW') setIsAddingParty(true); else setParty(e.target.value); }}>
                  <option value="">-- Select Customer --</option>{customers.map(c => <option key={c} value={c}>{c}</option>)}<option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Customer</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Style / Article Code</label>
              {isAddingArticleName ? (
                <div className="flex gap-2"><input autoFocus type="text" className="input-premium flex-1 border-blue-500 ring-2 ring-blue-100" placeholder="Type new article code..." value={newArticleName} onChange={e => setNewArticleName(e.target.value)} /><button type="button" onClick={() => { setIsAddingArticleName(false); setNewArticleName(''); }} className="p-3 text-slate-500 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div>
              ) : (
                <select className="input-premium" value={articleName} onChange={e => { if (e.target.value === 'ADD_NEW') setIsAddingArticleName(true); else setArticleName(e.target.value); }}>
                  <option value="">-- Select Style Code --</option>{articleCodes.map(c => <option key={c} value={c}>{c}</option>)}<option value="ADD_NEW" className="font-bold text-blue-600">+ Add New Article Code</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Size System</label>
                <select className="input-premium" value={sizeSystem} onChange={e => setSizeSystem(e.target.value)}><option value="eu">EU</option><option value="uk">UK</option><option value="us">US</option><option value="mondo">Mondo</option></select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sample Type</label>
                <select className="input-premium" value={sampleType} onChange={e => setSampleType(e.target.value)}><option value="Upper">Upper</option><option value="Counter Moulded">Counter Moulded</option><option value="Lasted">Lasted</option><option value="Complete Shoe">Complete Shoe</option></select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Pattern & DXF Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Designer Name</label>
                  <input type="text" placeholder="Who created this pattern?" className="input-premium py-2 text-sm" value={pattern.designerName} onChange={e => setPattern({...pattern, designerName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DXF File Status</label>
                  <select className="input-premium py-2 text-sm" value={pattern.dxfFileStatus} onChange={e => setPattern({...pattern, dxfFileStatus: e.target.value})}>
                    <option>Not Available</option>
                    <option>Available</option>
                    <option>Uploaded</option>
                    <option>Sent to Cutting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">DXF File Name / Link</label>
                  <input type="text" placeholder="e.g. pattern_v2.dxf" className="input-premium py-2 text-sm" value={pattern.dxfName} onChange={e => setPattern({...pattern, dxfName: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sizes & Pairs</label>
              <div className="space-y-2">
                {sizePairs.map((sp) => (
                  <div key={sp.id} className="flex gap-4">
                    <input type="text" placeholder="Size" className="input-premium flex-1" value={sp.size} onChange={e => updateRow(setSizePairs, sp.id, 'size', e.target.value)} />
                    <input type="number" placeholder="Pairs" className="input-premium flex-1" value={sp.pairs} onChange={e => updateRow(setSizePairs, sp.id, 'pairs', e.target.value)} />
                    <button type="button" onClick={() => removeRow(setSizePairs, sp.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addRow(setSizePairs, () => ({ id: Date.now(), size: '', pairs: '' }))} className="btn-secondary text-sm px-4 py-2"><Plus size={16} className="inline mr-1" /> Add Size</button>
              </div>
            </div>

            {renderMaterialAccordions()}

            <h2 className="text-lg font-bold text-slate-900 mb-4">Job Card Builder: Step Assignment</h2>
            <div className="space-y-3">
              {selectedSteps.map((step, idx) => (
                <div key={step.id} className={`flex items-center gap-4 p-4 rounded-lg border ${step.selected ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <input type="checkbox" checked={step.selected} onChange={() => handleToggleStep(idx)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <div className="flex-1"><div className="font-bold text-slate-900">{step.name}</div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{RLABELS[step.defaultUser] || step.defaultUser}</div></div>
                  <div className="w-64 flex items-center justify-end text-sm text-slate-500 italic">Auto-Assigned: <span className="font-semibold text-slate-700 ml-1">{RLABELS[step.defaultUser] || step.defaultUser}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              {loading ? 'Generating Job Card...' : 'Generate Job Card & Lock Sequence'}
            </button>
          </div>
        </form>
      )}

      {(orderType === 'production' || orderType === 'bulk') && (
        <form onSubmit={handleSubmitLinkedOrder} className="card-premium p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Link to Existing Article</label>
            <select className="input-premium py-3" value={selectedLinkedArticleId} onChange={e => {
              setSelectedLinkedArticleId(e.target.value);
              const art = allArticles.find(a => a.id === e.target.value);
              if (art && art.sizePairs) {
                try {
                  const sp = JSON.parse(art.sizePairs);
                  setBulkSizePairs(sp.map((s:any) => ({ ...s, pairs: '' }))); // clear quantities for the new order
                } catch { setBulkSizePairs([]); }

                const safeParse = (str: any) => { try { const parsed = JSON.parse(str) || []; if (Array.isArray(parsed)) { return parsed.map((item: any) => ({ ...item, qty: '' })); } return parsed; } catch { return []; } };
                setUpperMaterials(safeParse(art.upperMaterials));
                setLiningMaterials(safeParse(art.liningMaterials));
                setExtraMaterials(safeParse(art.extraMaterials));
                setLogoLabels(safeParse(art.logoLabels));
                setDringHooks(safeParse(art.dringHooks));
                setLacesTpu(safeParse(art.lacesTpu));
                setThreads(safeParse(art.threads));
                setPacking(safeParse(art.packing));

                const safeObj = (str: any) => { try { return JSON.parse(str) || {}; } catch { return {}; } };
                setInsole(safeObj(art.insole));
                setToeCap(safeObj(art.toeCap));
                setLast(safeObj(art.last));
                setMould(safeObj(art.mould));

              } else {
                setBulkSizePairs([{ id: 1, size: '', pairs: '' }]);
              }
            }}>
              <option value="">-- Select {orderType === 'production' ? 'Sample' : 'Production Order'} to Link --</option>
              {linkableArticles.map(a => (
                <option key={a.id} value={a.id}>#{a.serial} · {a.party} / {a.articleName} — {a.type.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {selectedLinkedArt && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4 items-center">
              <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {selectedLinkedPhotos.length > 0 ? <ZoomableImage src={selectedLinkedPhotos[0]} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">No Image</span>}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900">#{selectedLinkedArt.serial} · {selectedLinkedArt.party} / {selectedLinkedArt.articleName}</div>
                <div className="text-xs text-slate-500 font-semibold">{selectedLinkedArt.type.toUpperCase()} · {new Date(selectedLinkedArt.date).toLocaleDateString('en-GB')}</div>
              </div>
              {(() => {
                let leather = null;
                try {
                  const m = JSON.parse(selectedLinkedArt.upperMaterials);
                  if (m && m.length > 0 && m[0].name) leather = m[0];
                } catch {}
                if (!leather) return null;
                return (
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm shrink-0">
                    {leather.photo && <ZoomableImage src={leather.photo} className="w-10 h-10 rounded object-cover border border-slate-100" />}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Primary Material</div>
                      <div className="text-sm font-bold text-slate-800 leading-none max-w-[150px] truncate">{leather.name}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {orderType !== 'bulk' && renderMaterialAccordions()}
          <div className="space-y-6 border-t border-slate-200 pt-8">
            <h3 className="text-lg font-bold text-slate-900">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Serial Number (Auto)</label><input disabled type="text" className="input-premium bg-slate-100 text-slate-500 font-bold" value={serial} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Date (Auto)</label><input disabled type="date" className="input-premium bg-slate-100 text-slate-500 font-bold" value={todayDate} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Order Quantity</label><input type="number" required placeholder="e.g. 1000" className="input-premium" value={poQty} onChange={e => setPoQty(e.target.value)} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Delivery Date</label><input type="date" required className="input-premium" value={poDelDate} onChange={e => setPoDelDate(e.target.value)} /></div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Size & Quantity Breakdown</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-2">
                    {bulkSizePairs.map((sp) => (
                      <div key={sp.id} className="flex gap-4">
                        <input type="text" placeholder="Size (e.g. 40)" className="input-premium flex-1" value={sp.size} onChange={e => updateRow(setBulkSizePairs, sp.id, 'size', e.target.value)} />
                        <input type="number" placeholder="Pairs Quantity" className="input-premium flex-1" value={sp.pairs} onChange={e => updateRow(setBulkSizePairs, sp.id, 'pairs', e.target.value)} />
                        <button type="button" onClick={() => removeRow(setBulkSizePairs, sp.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addRow(setBulkSizePairs, () => ({ id: Date.now(), size: '', pairs: '' }))} className="btn-secondary text-sm px-4 py-2 mt-2"><Plus size={16} className="inline mr-1" /> Add Size Row</button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold text-slate-700 mb-1.5">Remarks</label><textarea rows={3} placeholder="Any special instructions..." className="input-premium resize-none" value={poRemarks} onChange={e => setPoRemarks(e.target.value)} /></div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Job Card Builder: Step Assignment</h2>
            <div className="space-y-3">
              {selectedSteps.map((step, idx) => (
                <div key={step.id} className={`flex items-center gap-4 p-4 rounded-lg border ${step.selected ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <input type="checkbox" checked={step.selected} onChange={() => handleToggleStep(idx)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <div className="flex-1"><div className="font-bold text-slate-900">{step.name}</div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{RLABELS[step.defaultUser] || step.defaultUser}</div></div>
                  {step.selected && orderType === 'bulk' && (() => {
                    const suitableUsers = getSuitableUsers(allUsers, step.defaultUser);

                    return (
                      <div className="flex-1 max-w-sm flex justify-end">
                        <div className="flex flex-wrap gap-2 justify-end">
                            {suitableUsers.map((u: any) => {
                              const isSelected = step.assignedUserId && step.assignedUserId.split(',').includes(u.username);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    const current = step.assignedUserId ? step.assignedUserId.split(',') : [];
                                    let next;
                                    if (isSelected) next = current.filter((username: string) => username !== u.username);
                                    else next = [...current, u.username];
                                    
                                    const updated = [...selectedSteps];
                                    updated[idx].assignedUserId = next.join(',');
                                    setSelectedSteps(updated);
                                }}
                                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-sm' : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700'} transition-all`}
                              >
                                {u.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  {step.selected && orderType !== 'bulk' && (
                    <div className="w-64 flex items-center justify-end text-sm text-slate-500 italic">Auto-Assigned: <span className="font-semibold text-slate-700 ml-1">{RLABELS[step.defaultUser] || step.defaultUser}</span></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              {loading ? 'Generating Job Card...' : 'Generate Job Card & Lock Sequence'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}



