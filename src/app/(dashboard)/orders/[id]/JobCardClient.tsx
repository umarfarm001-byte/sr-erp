"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ZoomableImage from "@/components/ui/ZoomableImage";
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, CheckSquare, Settings2, Scissors, PenTool, Printer, Image as ImageIcon, Users, X, UploadCloud, Trash2, Loader2, Camera, Clock } from 'lucide-react';
import { RLABELS } from '@/lib/operations';
export default function JobCardClient({ order, linkedOperations }: { order: any, linkedOperations?: any[] }) {
  const router = useRouter();
  const [article, setArticle] = useState(order);
  const [role, setRole] = useState('admin');
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = (sec: string) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  
  const [progressModalOp, setProgressModalOp] = useState<any | null>(null);
  const [progressForm, setProgressForm] = useState<any>({});
  const [progressDate, setProgressDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [progressLoading, setProgressLoading] = useState(false);

  const [editingDeadlineOp, setEditingDeadlineOp] = useState<string | null>(null);
  const [deadlineForm, setDeadlineForm] = useState<string>('');
  const [deadlineLoading, setDeadlineLoading] = useState(false);

  const [completeModalOp, setCompleteModalOp] = useState<any | null>(null);
  const [completeRemarks, setCompleteRemarks] = useState('');
  const [completePhotos, setCompletePhotos] = useState<string[]>([]);
  const opPhotoInputRef = useRef<HTMLInputElement>(null);

  const [extraMatForm, setExtraMatForm] = useState({ name: '', category: 'Chemical', uom: 'KG', qty: '1' });
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [extraMaterials, setExtraMaterials] = useState<any[]>([]);

  const [isEditingPattern, setIsEditingPattern] = useState(false);
  const [patternForm, setPatternForm] = useState({ designerName: '', dxfFileStatus: 'Not Available', dxfName: '', dxfData: '' });

  useState(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('erp_role') || 'admin');
    }
  });

  // Init extra materials and pattern form
  useState(() => {
    if(order.extraMaterials) {
      try { setExtraMaterials(JSON.parse(order.extraMaterials)); } catch(e){}
    }
    if(order.pattern) {
      try { 
        const parsed = JSON.parse(order.pattern);
        if(parsed) setPatternForm(parsed);
      } catch(e){}
    }
  });

  const pendingOps = article.operations.filter((op: any) => op.status === 'pending');
  const inProgressOps = article.operations.filter((op: any) => op.status === 'in_progress');
  const doneOps = article.operations.filter((op: any) => op.status === 'done');

  const totalOps = article.operations.length;
  const progressPercent = totalOps === 0 ? 0 : Math.round((doneOps.length / totalOps) * 100);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'done': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Completed</span>;
      case 'in_progress': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Settings2 size={12} className="animate-spin"/> In Progress</span>;
      default: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  const handleMarkComplete = async () => {
    if (!completeModalOp) return;
    setLoadingStep(completeModalOp.id);
    try {
      const res = await fetch(`/api/operations/${completeModalOp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', completedDate: new Date().toISOString().split('T')[0], remarks: completeRemarks, photos: JSON.stringify(completePhotos) })
      });
      if (res.ok) {
        setArticle((prev: any) => ({
          ...prev,
          operations: prev.operations.map((op: any) => op.id === completeModalOp.id ? { ...op, status: 'done', completedDate: new Date().toISOString().split('T')[0], remarks: completeRemarks, photos: JSON.stringify(completePhotos) } : op)
        }));
        setCompleteModalOp(null);
        setCompleteRemarks('');
        setCompletePhotos([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStep(null);
    }
  };

  const handleUpdateProgress = async () => {
    if(!progressModalOp) return;
    setProgressLoading(true);
    
    const updates = Object.keys(progressForm)
      .map(size => ({ size, pairs: parseInt(progressForm[size]) || 0 }))
      .filter(u => u.pairs > 0);
      
    try {
      const res = await fetch(`/api/operations/${progressModalOp.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, userId: role, date: progressDate })
      });
      if (res.ok) {
        setProgressModalOp(null);
        setProgressForm({});
        // In a real app, refresh data here
        alert("Daily update saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleSetDeadline = async (opId: string) => {
    if (!deadlineForm) return;
    setDeadlineLoading(true);
    try {
      const res = await fetch(`/api/operations/${opId}/deadline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate: deadlineForm, isAdmin: role === 'admin' })
      });
      if (res.ok) {
        setEditingDeadlineOp(null);
        setDeadlineForm('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeadlineLoading(false);
    }
  };

  const handleDirectPhotoUpload = async (opId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoadingStep(opId);
    
    try {
      const newPhotos = await Promise.all(Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }));

      const op = article.operations.find((o: any) => o.id === opId);
      let currentPhotos: string[] = [];
      try {
        if (op.photos) currentPhotos = JSON.parse(op.photos);
      } catch(e) {}
      
      const updatedPhotos = [...currentPhotos, ...newPhotos];

      const res = await fetch(`/api/operations/${opId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_photos',
          photos: JSON.stringify(updatedPhotos)
        })
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to upload photos.");
      }
    } catch(err) {
      console.error(err);
      alert("Error uploading photos.");
    } finally {
      setLoadingStep(null);
    }
  };

  const handleAddExtraMaterial = async () => {
    if(!extraMatForm.name) return;
    const newItem = { id: Date.now().toString(), ...extraMatForm };
    const updatedList = [...extraMaterials, newItem];
    setExtraMaterials(updatedList);
    setIsAddingExtra(false);
    setExtraMatForm({ name: '', category: 'Chemical', uom: 'KG', qty: '1' });

    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraMaterials: JSON.stringify(updatedList) })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const handleSavePattern = async () => {
    setIsEditingPattern(false);
    setArticle((prev: any) => ({ ...prev, pattern: JSON.stringify(patternForm) }));
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: JSON.stringify(patternForm) })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const handleUpdateMaterialQty = async (arrayName: string, itemId: string, newQty: string) => {
    let currentList = parseJSON(article[arrayName]) || [];
    const itemToUpdate = currentList.find((item: any) => item.id === itemId);
    if (!itemToUpdate || itemToUpdate.qty === newQty) return;
    
    currentList = currentList.map((item: any) => 
      item.id === itemId ? { ...item, qty: newQty } : item
    );
    
    setArticle((prev: any) => ({ ...prev, [arrayName]: JSON.stringify(currentList) }));
    
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [arrayName]: JSON.stringify(currentList) })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const handleToggleMaterialAvailability = async (arrayName: string, itemId: string) => {
    let currentList = parseJSON(article[arrayName]) || [];
    currentList = currentList.map((item: any) => 
      item.id === itemId ? { ...item, available: !item.available } : item
    );
    
    setArticle((prev: any) => ({ ...prev, [arrayName]: JSON.stringify(currentList) }));
    
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [arrayName]: JSON.stringify(currentList) })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const handleToggleBottomAvailability = async (fieldName: string) => {
    let obj = parseJSON(article[fieldName]) || {};
    obj.available = !obj.available;
    
    setArticle((prev: any) => ({ ...prev, [fieldName]: JSON.stringify(obj) }));
    
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: JSON.stringify(obj) })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const parseJSON = (str: any) => {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  };
  
  const sizePairs = parseJSON(article.sizePairs) || [];
  const pattern = parseJSON(article.pattern) || { designerName: '', dxfFileStatus: '', dxfName: '' };
  const upperMaterials = parseJSON(article.upperMaterials) || [];
  const liningMaterials = parseJSON(article.liningMaterials) || [];
  const logoLabels = parseJSON(article.logoLabels) || [];
  const dringHooks = parseJSON(article.dringHooks) || [];
  const lacesTpu = parseJSON(article.lacesTpu) || [];
  const threads = parseJSON(article.threads) || [];
  const insole = parseJSON(article.insole);
  const toeCap = parseJSON(article.toeCap);
  const last = parseJSON(article.last);
  const mould = parseJSON(article.mould);
  const injectionDetails = parseJSON(article.injectionDetails) || [];
  const packing = parseJSON(article.packing);
  const photos = parseJSON(article.photos) || [];

  const renderComponentList = (list: any[], arrayName: string, canEdit: boolean) => {
    return (
      <div className="space-y-3">
        {list.map((item: any) => (item.name && (
          <div key={item.id} className={`flex gap-4 p-3 rounded-xl border shadow-sm transition-colors ${item.available ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border flex items-center justify-center ${item.available ? 'border-emerald-300 bg-emerald-100 text-emerald-500' : 'bg-slate-200 border-slate-300 text-slate-400'}`}>
              {item.photo ? <ZoomableImage src={item.photo} alt={item.name} className={`w-full h-full object-cover ${item.available ? '' : 'grayscale opacity-80'}`} /> : <ImageIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="font-bold text-slate-900 truncate text-sm flex items-center gap-2">
                {item.name}
                {item.available && <span className="text-[10px] uppercase font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded tracking-widest">Available</span>}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                {item.thickness && <span><span className="font-semibold text-slate-400">THICK:</span> {item.thickness}</span>}
                {item.color && <span><span className="font-semibold text-slate-400">COLOR:</span> {item.color}</span>}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-4">
              <div className="text-right flex flex-col justify-center border-l border-slate-200 pl-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.uom || 'QTY'}</div>
                {canEdit ? (
                  <input 
                    type="number" 
                    defaultValue={item.qty} 
                    onBlur={(e) => handleUpdateMaterialQty(arrayName, item.id, e.target.value)}
                    className="w-16 font-bold text-slate-800 text-lg border-b border-slate-300 focus:border-blue-500 outline-none bg-transparent text-right py-0.5"
                    placeholder="-" 
                  />
                ) : (
                  <div className="font-bold text-slate-800 text-lg">{item.qty || '-'}</div>
                )}
              </div>
              {canEdit && (
                <button 
                  onClick={() => handleToggleMaterialAvailability(arrayName, item.id)}
                  className={`w-8 h-8 rounded border flex items-center justify-center shadow-sm transition-colors ${item.available ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-slate-100 hover:text-slate-400 hover:border-slate-300' : 'bg-white border-slate-300 text-slate-300 hover:border-emerald-500 hover:text-emerald-500'}`}
                  title={item.available ? "Mark as Pending" : "Mark as Available"}
                >
                  <CheckCircle2 size={18} />
                </button>
              )}
            </div>
          </div>
        )))}
      </div>
    );
  };

  const isWorker = role !== 'admin' && role !== 'director';
  
  // Department logic based on username/role conventions
  const isLeatherDept = role.includes('leather') || role === 'lc' || role.includes('cut');
  const isLiningDept = role.includes('lining') || role === 'ln' || role.includes('cut');
  const isAppDept = role.includes('app') || role.includes('close') || role.includes('prep');
  const isBottomDept = role.includes('bottom') || role.includes('last') || role.includes('inj') || role.includes('desma') || role.includes('pour');
  const isOtherPurchaser = role.includes('purch_other');
  const canEditMaterials = role === 'admin' || role.includes('purch');
  
  const canViewAllSpecs = !isWorker || role === 'designer' || role === 'admin' || role === 'director';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="shrink-0 w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
          {photos.length > 0 ? <ZoomableImage src={photos[0]} alt="Thumbnail" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-xs font-semibold">No Image</span>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.push('/orders')} className="text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={20} /></button>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded uppercase tracking-wider">{article.type === 'bulk' ? 'Bulk Prod' : article.type === 'production' ? 'Prod Order' : 'Sample'}</span>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{article.serial}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{article.articleName}</h1>
          <p className="text-slate-500 font-medium mt-1">
            Party: <span className="text-slate-900">{article.party}</span> | Date: {new Date(article.date).toLocaleDateString('en-GB')}
            {(article.type === 'production' || article.type === 'bulk') && article.qty && (
              <span className="ml-2">| <span className="font-bold text-slate-800">QTY:</span> {article.qty}</span>
            )}
            {(article.type === 'production' || article.type === 'bulk') && article.deliveryDate && (
              <span className="ml-2">| <span className="font-bold text-slate-800">Delivery:</span> {new Date(article.deliveryDate).toLocaleDateString('en-GB')}</span>
            )}
          </p>
          {(article.type === 'production' || article.type === 'bulk') && article.remarks && (
            <p className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm mt-2 border border-amber-200">
              <span className="font-bold">Remarks:</span> {article.remarks}
            </p>
          )}
        </div>
        <div className="text-right flex flex-col items-end gap-2 shrink-0">
          <div className="text-sm font-bold text-slate-500">Progress</div>
          <div className="text-lg font-black text-slate-900">{progressPercent}% Completed</div>
          <div className="w-48 h-2.5 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200"><div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div></div>
        </div>
      </div>

      {(() => {
        const isUpperOrCounterMoulded = article.sampleType === 'Upper' || article.sampleType === 'Counter Moulded' || article.sampleType?.toLowerCase().includes('upper') || article.sampleType?.toLowerCase().includes('counter');
        return (
          <>
      {photos.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-sm">Sample Photos</div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photos.map((photo: string, i: number) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200">
                <ZoomableImage src={photo} alt={`Sample ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {sizePairs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center justify-between">
            <div>Specifications</div>
            <div className="text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-100">{article.sampleType}</div>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              { (role === 'admin' || role === 'director' || role === 'designer') && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pattern & DXF Information</h4>
                    {!isEditingPattern && (
                      <button onClick={() => setIsEditingPattern(true)} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                        Edit Pattern Info
                      </button>
                    )}
                  </div>
                  
                  {isEditingPattern ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Designer Name</label>
                          <input type="text" className="w-full text-sm p-2 rounded border border-slate-200 focus:border-blue-500 outline-none" value={patternForm.designerName} onChange={e => setPatternForm({...patternForm, designerName: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">DXF Status</label>
                          <select className="w-full text-sm p-2 rounded border border-slate-200 focus:border-blue-500 outline-none" value={patternForm.dxfFileStatus} onChange={e => setPatternForm({...patternForm, dxfFileStatus: e.target.value})}>
                            <option>Not Available</option>
                            <option>Available</option>
                            <option>Uploaded</option>
                            <option>Sent to Cutting</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Upload DXF File</label>
                          <div className="flex gap-4 items-center">
                            <label className="bg-white border border-slate-300 text-slate-700 text-sm px-4 py-2 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                              Choose File
                              <input 
                                type="file" 
                                accept=".dxf" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if(file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      setPatternForm({
                                        ...patternForm, 
                                        dxfName: file.name, 
                                        dxfFileStatus: 'Uploaded',
                                        dxfData: reader.result as string 
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <div className="text-sm text-slate-600 truncate flex-1">
                              {patternForm.dxfName ? (
                                <span className="font-semibold text-blue-600">{patternForm.dxfName}</span>
                              ) : (
                                <span className="italic">No file selected...</span>
                              )}
                            </div>
                            {patternForm.dxfName && (
                              <button 
                                type="button" 
                                onClick={() => setPatternForm({...patternForm, dxfName: '', dxfData: '', dxfFileStatus: 'Not Available'})} 
                                className="text-red-500 text-xs font-bold hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditingPattern(false)} className="text-xs font-bold text-slate-500 px-3 py-1">Cancel</button>
                        <button onClick={handleSavePattern} className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded">Save Pattern</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Designer</div>
                        <div className="text-sm font-semibold text-slate-800">{pattern.designerName || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">DXF Status</div>
                        {pattern.dxfFileStatus ? (
                          <div className={`text-sm font-semibold inline-block px-2 py-0.5 rounded ${pattern.dxfFileStatus === 'Available' || pattern.dxfFileStatus === 'Uploaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                            {pattern.dxfFileStatus}
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </div>
                      {pattern.dxfName && (
                        <div className="col-span-2">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">File Name / Link</div>
                          {pattern.dxfData ? (
                             <a 
                              href={pattern.dxfData} 
                              download={pattern.dxfName} 
                              className="text-sm font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-md inline-flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                             >
                              ↓ Download {pattern.dxfName}
                             </a>
                          ) : (
                            <div className="text-sm font-semibold text-blue-600 break-all">{pattern.dxfName}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Sizes & Pairs ({article.sizeSystem?.toUpperCase()})</h4>
                <div className="flex flex-wrap gap-2">
                  {sizePairs.map((sp: any) => sp.size && (
                    <div key={sp.id} className="px-3 py-1.5 bg-slate-100 rounded-md text-sm font-bold text-slate-700 border border-slate-200">
                      {sp.size} <span className="text-slate-400 font-medium ml-1">({sp.pairs} pr)</span>
                    </div>
                  ))}
                </div>
              </div>

              {(canViewAllSpecs || isLeatherDept || isAppDept) && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <button onClick={() => toggleSection('leather')} className="w-full flex justify-between items-center bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">1. Upper Materials (Leather)</h4>
                    {openSections.leather ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                  </button>
                  {openSections.leather && (
                    <div className="p-4 border-t border-slate-200 bg-white">
                      {renderComponentList(upperMaterials, 'upperMaterials', canEditMaterials)}
                    </div>
                  )}
                </div>
              )}

              {(canViewAllSpecs || isLiningDept || isAppDept) && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <button onClick={() => toggleSection('lining')} className="w-full flex justify-between items-center bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">2. Lining Materials</h4>
                    {openSections.lining ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                  </button>
                  {openSections.lining && (
                    <div className="p-4 border-t border-slate-200 bg-white">
                      {renderComponentList(liningMaterials, 'liningMaterials', canEditMaterials)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {(canViewAllSpecs || isAppDept || isOtherPurchaser) && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <button onClick={() => toggleSection('app')} className="w-full flex justify-between items-center bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">3. Application Components</h4>
                    {openSections.app ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                  </button>
                  {openSections.app && (
                    <div className="p-4 border-t border-slate-200 bg-white space-y-6">
                      {logoLabels.length > 0 && logoLabels[0].name && <div><div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Logo & Labels</div>{renderComponentList(logoLabels, 'logoLabels', canEditMaterials)}</div>}
                      {dringHooks.length > 0 && dringHooks[0].name && <div><div className="text-[10px] uppercase font-bold text-slate-400 mb-2">D-Ring & Hook</div>{renderComponentList(dringHooks, 'dringHooks', canEditMaterials)}</div>}
                      {!isUpperOrCounterMoulded && lacesTpu.length > 0 && lacesTpu[0].name && <div><div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Laces & TPU</div>{renderComponentList(lacesTpu, 'lacesTpu', canEditMaterials)}</div>}
                      {threads.length > 0 && threads[0].name && <div><div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Threads</div>{renderComponentList(threads, 'threads', canEditMaterials)}</div>}
                    </div>
                  )}
                </div>
              )}

              {(canViewAllSpecs || isBottomDept || isOtherPurchaser) && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <button onClick={() => toggleSection('bottom')} className="w-full flex justify-between items-center bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">4. Bottom Details</h4>
                    {openSections.bottom ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                  </button>
                  {openSections.bottom && (
                    <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-4">
                  {!isUpperOrCounterMoulded && insole?.include && (
                    <div className={`p-3 rounded-xl border flex justify-between items-center transition-colors ${insole.available ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 flex items-center gap-2">Insole {insole.available && <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded leading-none">Avail</span>}</div>
                        <div className="text-sm font-semibold text-blue-900">{insole.name}</div>
                        {insole.elastic && <div className="text-[10px] font-bold text-blue-600 bg-blue-100 inline-block px-1 rounded mt-1">With Elastic</div>}
                      </div>
                      {canEditMaterials && <button onClick={() => handleToggleBottomAvailability('insole')} className={`w-8 h-8 rounded border flex items-center justify-center shadow-sm shrink-0 ml-2 ${insole.available ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-white hover:text-slate-400' : 'bg-white border-blue-200 text-slate-300 hover:text-emerald-500'}`}><CheckCircle2 size={18} /></button>}
                    </div>
                  )}
                  {toeCap?.name && (
                    <div className={`p-3 rounded-xl border flex justify-between items-center transition-colors ${toeCap.available ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 flex items-center gap-2">Toe Cap ({toeCap.type?.split('—')[0]}) {toeCap.available && <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded leading-none">Avail</span>}</div>
                        <div className="text-sm font-semibold text-blue-900">{toeCap.name}</div>
                        <div className="text-xs text-blue-700 mt-1">Sizes: {toeCap.sizes.filter((s:any)=>s.size).map((s:any)=>s.size).join(', ')}</div>
                      </div>
                      {canEditMaterials && <button onClick={() => handleToggleBottomAvailability('toeCap')} className={`w-8 h-8 rounded border flex items-center justify-center shadow-sm shrink-0 ml-2 ${toeCap.available ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-white hover:text-slate-400' : 'bg-white border-blue-200 text-slate-300 hover:text-emerald-500'}`}><CheckCircle2 size={18} /></button>}
                    </div>
                  )}
                  {last?.status && (
                    <div className={`p-3 rounded-xl border flex justify-between items-center transition-colors ${last.available ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 flex items-center gap-2">Last ({last.status === 'have' ? 'Have' : 'New'}) {last.available && <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded leading-none">Avail</span>}</div>
                        <div className="text-sm font-semibold text-blue-900">{last.status === 'have' ? last.haveName : last.newName}</div>
                        <div className="text-xs text-blue-700 mt-1">{last.status === 'have' ? `Size: ${last.haveSize}` : `STL: ${last.newStl}`}</div>
                      </div>
                      {canEditMaterials && <button onClick={() => handleToggleBottomAvailability('last')} className={`w-8 h-8 rounded border flex items-center justify-center shadow-sm shrink-0 ml-2 ${last.available ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-white hover:text-slate-400' : 'bg-white border-blue-200 text-slate-300 hover:text-emerald-500'}`}><CheckCircle2 size={18} /></button>}
                    </div>
                  )}
                  {mould?.name && (
                    <div className={`p-3 rounded-xl border flex justify-between items-center transition-colors ${mould.available ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 flex items-center gap-2">Mould {mould.available && <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded leading-none">Avail</span>}</div>
                        <div className="text-sm font-semibold text-blue-900">{mould.name}</div>
                        <div className="text-xs text-blue-700 mt-1">{mould.type} | {mould.density} | {mould.material}</div>
                      </div>
                      {canEditMaterials && <button onClick={() => handleToggleBottomAvailability('mould')} className={`w-8 h-8 rounded border flex items-center justify-center shadow-sm shrink-0 ml-2 ${mould.available ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-white hover:text-slate-400' : 'bg-white border-blue-200 text-slate-300 hover:text-emerald-500'}`}><CheckCircle2 size={18} /></button>}
                    </div>
                  )}
                  {packing?.boxDetail && (
                    <div className={`col-span-2 p-3 rounded-xl border flex justify-between items-center transition-colors ${packing.available ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-500 mb-1 flex items-center gap-2">Packing {packing.available && <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded leading-none">Avail</span>}</div>
                        <div className="text-sm font-semibold text-blue-900">{packing.boxDetail} <span className="text-blue-700 font-normal">({packing.boxSize})</span></div>
                        <div className="text-xs text-blue-700 mt-1">Booklet: {packing.booklet} | Parts: {packing.packingParts}</div>
                      </div>
                      {canEditMaterials && <button onClick={() => handleToggleBottomAvailability('packing')} className={`w-8 h-8 rounded border flex items-center justify-center shadow-sm shrink-0 ml-2 ${packing.available ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-white hover:text-slate-400' : 'bg-white border-blue-200 text-slate-300 hover:text-emerald-500'}`}><CheckCircle2 size={18} /></button>}
                    </div>
                  )}
                    </div>
                  )}
                </div>
              )}

              {/* Extra Materials Added by Admin */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <button onClick={() => toggleSection('extra')} className="w-full flex justify-between items-center bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">5. Extra / Additional Materials</h4>
                    {role === 'admin' && (
                      <div onClick={(e) => { e.stopPropagation(); setIsAddingExtra(!isAddingExtra); }} className="text-blue-600 text-[10px] font-bold bg-blue-100 px-2 py-0.5 rounded hover:bg-blue-200 cursor-pointer">+ Add</div>
                    )}
                  </div>
                  {openSections.extra ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                </button>
                
                {openSections.extra && (
                  <div className="p-4 border-t border-slate-200 bg-white">
                    {isAddingExtra && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-slate-600">Item Name</label><input type="text" className="w-full text-sm p-2 rounded border border-slate-200" placeholder="e.g. Chemical Glue" value={extraMatForm.name} onChange={e=>setExtraMatForm({...extraMatForm, name:e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-slate-600">Usage Category</label><input type="text" className="w-full text-sm p-2 rounded border border-slate-200" placeholder="e.g. Packing, Chemical" value={extraMatForm.category} onChange={e=>setExtraMatForm({...extraMatForm, category:e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-slate-600">Quantity</label><input type="number" className="w-full text-sm p-2 rounded border border-slate-200" value={extraMatForm.qty} onChange={e=>setExtraMatForm({...extraMatForm, qty:e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-slate-600">Unit (UOM)</label><input type="text" className="w-full text-sm p-2 rounded border border-slate-200" placeholder="e.g. Ltr, Kg, Pcs" value={extraMatForm.uom} onChange={e=>setExtraMatForm({...extraMatForm, uom:e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>setIsAddingExtra(false)} className="text-xs font-bold text-slate-500 px-3 py-1">Cancel</button>
                      <button onClick={handleAddExtraMaterial} className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded">Save Item</button>
                    </div>
                  </div>
                )}

                    {extraMaterials.length > 0 ? (
                      renderComponentList(extraMaterials, 'extraMaterials', canEditMaterials)
                    ) : (
                      <div className="text-sm text-slate-400 italic">No extra materials added.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

          </>
        );
      })()}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2"><CheckSquare size={18} className="text-blue-600" /> Operations Checklist</div>
          <div className="text-xs font-bold text-slate-500">{totalOps} Total Steps</div>
        </div>
        <div className="divide-y divide-slate-100">
            {(() => {
              const strictDeps: Record<number, number[]> = {
                 // Bulk
                 42: [39],
                 43: [40],
                 44: [42, 43], // Preparing depends on Leather & Lining Cutting
                 45: [44],     // Closing depends on Preparing
                 46: [45],     // Upper Pass depends on Closing
                 47: [46],     // Lasting depends on Upper Pass
                 48: [47],     // LT Pass depends on Lasting
                 49: [48],     // Injection Desma depends on LT Pass
                 50: [48],     // Injection Pouring depends on LT Pass
                 51: [49, 50], // Packing depends on Injection
                 
                 // Sample
                 5: [2],
                 6: [3],
                 7: [5],
                 8: [5],
                 9: [5, 6],
                 10: [9],
                 11: [10],
                 12: [11],
                 13: [12],
                 14: [13],
                 15.1: [14],
                 15.2: [14],
                 16: [15.1, 15.2],
                 17: [16],
                 18: [17],
                 19: [18],
                 20: [19],
                 21: [20],
                 22: [21],
                 23: [22],
                 24: [23]
              };

              const visibleOpIds = new Set<number>();
              article.operations.forEach((op: any) => {
                const isAssigned = (role === 'admin') ? true : (role !== 'director' && (op.assignedUserId && op.assignedUserId.includes(role)));
                if (!isWorker || isAssigned) {
                  visibleOpIds.add(op.opId);
                  if (strictDeps[op.opId]) {
                    strictDeps[op.opId].forEach(depId => visibleOpIds.add(depId));
                  }
                }
              });

              return article.operations.map((op: any, index: number) => {
                if (isWorker && !visibleOpIds.has(op.opId)) return null;
                const isAssigned = (role === 'admin') ? true : (role !== 'director' && (op.assignedUserId && op.assignedUserId.includes(role)));
                
                const isManufacturing = op.opId >= 42 && op.opId <= 51;
                const isPurchase = op.opId >= 39 && op.opId <= 41;
                
                const isPreparationStep = (op.opId >= 1 && op.opId <= 4) || (op.opId >= 39 && op.opId <= 41) || (op.assignedUserId && op.assignedUserId.startsWith('store_'));
            
            let requiredPreceding: any[] = [];
            if (!isPreparationStep) {
              if (op.opId in strictDeps) {
                requiredPreceding = article.operations.filter((p: any) => strictDeps[op.opId].includes(p.opId));
              } else {
                requiredPreceding = article.operations.slice(0, index);
              }
              
              // Material shortcuts: If all material is marked available directly, unlock cutting
              if (op.opId === 6 || op.opId === 43) {
                const allLiningAvailable = liningMaterials.length > 0 && liningMaterials.every((m: any) => m.available);
                if (allLiningAvailable) {
                  requiredPreceding = [];
                }
              } else if (op.opId === 5 || op.opId === 42) {
                const allLeatherAvailable = upperMaterials.length > 0 && upperMaterials.every((m: any) => m.available);
                if (allLeatherAvailable) {
                  requiredPreceding = [];
                }
              }
            }

            const isSequentialLocked = requiredPreceding.some((prev: any) => prev.status !== 'done');
            const isPreviousDeadlineSet = requiredPreceding.every((prev: any) => !!prev.targetDate);
            const isDeadlineSet = !!op.targetDate;
            const canSetDeadline = isAssigned && isPreviousDeadlineSet && !isDeadlineSet;
            
            const canComplete = isAssigned && op.status !== 'done' && isDeadlineSet;
            
            return (
              <div key={op.id} className={`p-5 flex items-center gap-6 transition-colors hover:bg-slate-50 ${op.status === 'done' ? 'bg-slate-50/50 opacity-70' : ''}`}>
                <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center text-sm border border-slate-200">{index + 1}</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-lg mb-1">{op.name}</div>
                  <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-blue-500"/> {op.assignedUserId || 'Unassigned'}</span>
                    {op.targetDate && <span className="text-amber-600">🎯 Due: {new Date(op.targetDate).toLocaleDateString('en-GB')}</span>}
                    {op.completedDate && <span className="text-emerald-600">✅ Done: {new Date(op.completedDate).toLocaleDateString('en-GB')}</span>}
                  </div>
                  {op.remarks && (
                    <div className="mt-2 text-sm text-slate-600 bg-slate-100/50 p-2 rounded border border-slate-200">
                      <span className="font-bold">Remarks:</span> {op.remarks}
                    </div>
                  )}
                  {op.photos && parseJSON(op.photos)?.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {parseJSON(op.photos).map((p:string, idx:number) => (
                        <a key={idx} href={p} target="_blank" className="w-16 h-16 rounded overflow-hidden border border-slate-300 hover:border-blue-500 transition-colors block bg-white shadow-sm relative group">
                          <ZoomableImage src={p} className="w-full h-full object-cover" />
                        </a>
                      ))}
                      {isAssigned && (
                        <label className={`w-16 h-16 rounded border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors ${loadingStep === op.id ? 'opacity-50 pointer-events-none' : ''}`}>
                          {loadingStep === op.id ? <Loader2 size={20} className="animate-spin text-blue-500" /> : <Camera size={20} />}
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleDirectPhotoUpload(op.id, e.target.files)} disabled={loadingStep === op.id} />
                        </label>
                      )}
                    </div>
                  )}

                  {(() => {
                    const OP_REFERENCE_MAP: Record<number, number[]> = {
                      39: [2], 40: [3], 41: [4],
                      42: [5, 7, 8], 43: [6], 44: [9], 45: [10], 46: [11, 12, 13], 47: [14], 48: [14], 49: [15], 50: [15], 51: [16, 17, 18, 19]
                    };
                    const referenceOps = linkedOperations ? linkedOperations.filter(lop => OP_REFERENCE_MAP[op.opId]?.includes(lop.opId)) : [];
                    const referencePhotos = referenceOps.flatMap(rop => rop.photos ? parseJSON(rop.photos) : []).filter(Boolean);
                    if (referencePhotos.length === 0) return null;
                    return (
                      <div className="mt-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><ImageIcon size={12}/> Reference Photos (From Sample)</div>
                        <div className="flex gap-2 flex-wrap">
                          {referencePhotos.map((p, idx) => (
                            <a key={`ref-${idx}`} href={p} target="_blank" className="w-16 h-16 rounded overflow-hidden border-2 border-indigo-200 hover:border-indigo-400 transition-colors block bg-white shadow-sm relative group">
                              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-bold px-1 rounded-bl z-10 shadow-sm opacity-90">REF</div>
                              <ZoomableImage src={p} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {(!op.photos || parseJSON(op.photos)?.length === 0) && isAssigned && (
                    <div className="mt-3">
                        <label className={`inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 cursor-pointer font-bold bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded border border-slate-200 transition-colors ${loadingStep === op.id ? 'opacity-50 pointer-events-none' : ''}`}>
                          {loadingStep === op.id ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Camera size={16} />} 
                          {loadingStep === op.id ? 'Uploading...' : 'Add Photos'}
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleDirectPhotoUpload(op.id, e.target.files)} disabled={loadingStep === op.id} />
                        </label>
                    </div>
                  )}

                  {isManufacturing && op.dailyProgresses && op.dailyProgresses.length > 0 && (
                    <div className="mt-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
                        <span>Daily Progress Log</span>
                        {(() => {
                           const totalSubmitted = op.dailyProgresses.reduce((sum: number, p: any) => sum + p.pairs, 0);
                           const sizePairs = article.sizePairs ? parseJSON(article.sizePairs) : [];
                           const totalRequired = sizePairs.reduce((sum: number, sp: any) => sum + (parseInt(sp.pairs) || 0), 0);
                           const percent = totalRequired > 0 ? Math.min(100, Math.round((totalSubmitted / totalRequired) * 100)) : 0;
                           return (
                             <span className={totalSubmitted >= totalRequired ? 'text-emerald-600' : 'text-blue-600'}>
                               {totalSubmitted} / {totalRequired} Pairs ({percent}%)
                             </span>
                           );
                        })()}
                      </div>
                      {(() => {
                         const totalSubmitted = op.dailyProgresses.reduce((sum: number, p: any) => sum + p.pairs, 0);
                         const sizePairs = article.sizePairs ? parseJSON(article.sizePairs) : [];
                         const totalRequired = sizePairs.reduce((sum: number, sp: any) => sum + (parseInt(sp.pairs) || 0), 0);
                         const percent = totalRequired > 0 ? Math.min(100, Math.round((totalSubmitted / totalRequired) * 100)) : 0;
                         return (
                           <div className="h-1.5 w-full bg-slate-100">
                             <div className={`h-full ${totalSubmitted >= totalRequired ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                           </div>
                         );
                      })()}
                      <details className="group">
                        <summary className="px-3 py-2 font-bold text-[11px] text-slate-500 flex items-center gap-2 cursor-pointer list-none hover:bg-slate-50 transition-colors uppercase tracking-wider select-none">
                          <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                          <span>View detailed logs</span>
                        </summary>
                        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-100">
                                <th className="pb-2 font-semibold">Date</th>
                                <th className="pb-2 font-semibold">Size</th>
                                <th className="pb-2 font-semibold text-right">Pairs</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {op.dailyProgresses.map((dp: any) => (
                                <tr key={dp.id} className="text-slate-600">
                                  <td className="py-1.5">{new Date(dp.date).toLocaleDateString('en-GB')}</td>
                                  <td className="py-1.5 font-bold">{dp.size}</td>
                                  <td className="py-1.5 text-right font-mono">{dp.pairs}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </div>
                  )}

                  {canSetDeadline && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-orange-900">Set Your Target Deadline</h4>
                          <p className="text-[11px] font-semibold text-orange-700/80">You must commit to a date before logging progress.</p>
                        </div>
                        {editingDeadlineOp === op.id ? (
                          <div className="flex items-center gap-2">
                            <input type="date" value={deadlineForm} min={new Date().toISOString().split('T')[0]} onChange={e => setDeadlineForm(e.target.value)} className="border border-orange-300 px-2 py-1.5 rounded text-sm bg-white font-mono" />
                            <button onClick={() => handleSetDeadline(op.id)} disabled={deadlineLoading} className="bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors disabled:opacity-50">{deadlineLoading ? '...' : 'Save'}</button>
                            <button onClick={() => setEditingDeadlineOp(null)} className="text-orange-600 hover:text-orange-900 font-bold text-sm px-2">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingDeadlineOp(op.id); setDeadlineForm(''); }} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 hover:shadow-lg transition-all shrink-0">Select Date</button>
                        )}
                      </div>
                    </div>
                  )}

                  {isAssigned && !isPreviousDeadlineSet && !isDeadlineSet && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-inner flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-700">Waiting for Previous Step</h4>
                        <p className="text-[11px] font-semibold text-slate-500">You can set your deadline once the preceding operation commits to their target date.</p>
                      </div>
                      <div className="text-slate-400"><Clock size={20} /></div>
                    </div>
                  )}

                  {role === 'admin' && isDeadlineSet && editingDeadlineOp === op.id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-blue-900">Edit Deadline (Admin Override)</h4>
                          <p className="text-[11px] font-semibold text-blue-700/80">Warning: Subsequent deadlines will auto-shift.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="date" value={deadlineForm} onChange={e => setDeadlineForm(e.target.value)} className="border border-blue-300 px-2 py-1.5 rounded text-sm bg-white font-mono" />
                          <button onClick={() => handleSetDeadline(op.id)} disabled={deadlineLoading} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50">{deadlineLoading ? '...' : 'Update'}</button>
                          <button onClick={() => setEditingDeadlineOp(null)} className="text-blue-600 hover:text-blue-900 font-bold text-sm px-2">Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-3">
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(op.status)}
                    {isDeadlineSet && (
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        Due: {new Date(op.targetDate).toLocaleDateString('en-GB')}
                        {role === 'admin' && (
                          <button onClick={() => { setEditingDeadlineOp(op.id); setDeadlineForm(op.targetDate.split('T')[0]); }} className="text-blue-500 hover:text-blue-700 hover:underline">Edit</button>
                        )}
                      </div>
                    )}
                    {op.targetDate && op.status !== 'done' && new Date() > new Date(op.targetDate) && (
                      <div className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[11px] font-black animate-pulse shadow-sm">LATE OVERDUE</div>
                    )}
                    {op.targetDate && op.status === 'done' && op.completedDate && new Date(op.completedDate) <= new Date(op.targetDate) && (
                      <div className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-black flex items-center gap-1 shadow-sm">
                        COMPLETED EARLY 🏆
                      </div>
                    )}
                  </div>
                  {canComplete && !isManufacturing && (
                    <button 
                      onClick={() => { setCompleteModalOp(op); setCompleteRemarks(''); setCompletePhotos([]); }} 
                      disabled={loadingStep === op.id || isSequentialLocked} 
                      className={`py-2 px-4 shadow-md transition-all ${isSequentialLocked ? 'bg-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed border border-slate-300 flex items-center gap-2' : 'btn-primary hover:shadow-lg disabled:opacity-50'}`}
                    >
                      {isSequentialLocked ? '🔒 Locked' : (isPurchase ? 'Mark Available' : 'Mark Done')}
                    </button>
                  )}
                  {canComplete && isManufacturing && (
                    <button 
                      onClick={() => { setProgressModalOp(op); setProgressForm({}); setProgressDate(new Date().toISOString().split('T')[0]); }} 
                      disabled={isSequentialLocked}
                      className={`py-2 px-4 shadow-md transition-all ${isSequentialLocked ? 'bg-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed border border-slate-300 flex items-center gap-2' : 'btn-primary hover:shadow-lg'}`}
                    >
                      {isSequentialLocked ? '🔒 Locked' : 'Update Progress'}
                    </button>
                  )}
                </div>
              </div>
            );
          });
        })()}
        </div>
      </div>

      {progressModalOp && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Daily Update: {progressModalOp.name}</h3>
              <button onClick={() => setProgressModalOp(null)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={progressDate} onChange={(e) => setProgressDate(e.target.value)} />
              </div>
              <p className="text-sm text-slate-500 mb-6">Enter the quantity of pairs you completed on this date for each size.</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {sizePairs.map((sp: any) => sp.size && (
                  <div key={sp.id}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Size {sp.size} <span className="text-[10px] text-slate-400 ml-1">/ {sp.pairs}</span></label>
                    <input 
                      type="number" 
                      min="0" 
                      max={sp.pairs}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={progressForm[sp.size] || ''}
                      onChange={e => setProgressForm({...progressForm, [sp.size]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setProgressModalOp(null)} className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
              <button onClick={handleUpdateProgress} disabled={progressLoading} className="btn-primary px-6 py-2 shadow-md">{progressLoading ? 'Saving...' : 'Save Update'}</button>
            </div>
          </div>
        </div>
      )}

      {completeModalOp && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Complete: {completeModalOp.name}</h3>
              <button onClick={() => setCompleteModalOp(null)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">Please confirm that you have completed this step. You can also add remarks or comments below.</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Remarks / Comments (Optional)</label>
                <textarea 
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none mb-4"
                  placeholder="E.g. Material received but slightly different shade, or completed with minor adjustments..."
                  value={completeRemarks}
                  onChange={e => setCompleteRemarks(e.target.value)}
                />
                
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Step Photos (Optional, helps bulk production)</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {completePhotos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group bg-slate-50">
                      <ZoomableImage src={photo} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setCompletePhotos(completePhotos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-blue-600 gap-1 bg-white">
                    <UploadCloud size={20} />
                    <span className="text-[10px] font-semibold text-center leading-tight">Add<br/>Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        if (!e.target.files) return;
                        Array.from(e.target.files).forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => setCompletePhotos(p => [...p, reader.result as string]);
                          reader.readAsDataURL(file);
                        });
                      }} 
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setCompleteModalOp(null)} className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
              <button onClick={handleMarkComplete} disabled={loadingStep === completeModalOp.id} className="btn-primary px-6 py-2 shadow-md bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5">{loadingStep === completeModalOp.id ? 'Saving...' : 'Mark as Done'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
