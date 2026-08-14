"use client";

import { useState, useEffect } from 'react';
import { Calculator, Scaling, Save, History, Ruler, IndianRupee, Plus, Trash2 } from 'lucide-react';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'bom' | 'size' | 'cost'>('bom');
  const [history, setHistory] = useState<any[]>([]);

  // BOM State
  const [articleName, setArticleName] = useState('');
  const [leatherName, setLeatherName] = useState('');
  const [patternArea, setPatternArea] = useState('');
  const [grade, setGrade] = useState('A');
  const [wastage, setWastage] = useState('10');
  const [conversionFactor, setConversionFactor] = useState('9.29');
  const [ratePerSqFt, setRatePerSqFt] = useState('');
  const [totalPairs, setTotalPairs] = useState('');
  
  const [calculated, setCalculated] = useState<{ sqft: string, cost: string } | null>(null);

  // Size State
  const [startSize, setStartSize] = useState('39');
  const [endSize, setEndSize] = useState('45');
  const [sizeInputs, setSizeInputs] = useState<Record<number, string>>({});
  const [sizeResult, setSizeResult] = useState<any[]>([]);

  // Costing State
  const [materials, setMaterials] = useState<{id: number, name: string, qty: string, rate: string, waste: string}[]>([
    { id: 1, name: 'Upper Leather', qty: '2.5', rate: '90', waste: '10' }
  ]);
  const [fixedCosts, setFixedCosts] = useState({ mold: '0', dies: '2500', rnd: '5000' });
  const [labor, setLabor] = useState({ sample: '500', bulk: '60' });
  const [margin, setMargin] = useState('20');
  const [bulkQty, setBulkQty] = useState('1000');
  const [costResult, setCostResult] = useState<any>(null);


  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/tools/bom');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch(e) {
      console.error(e);
    }
  };

  const handleGradeChange = (e: any) => {
    const val = e.target.value;
    setGrade(val);
    if (val === 'A') setWastage('10');
    if (val === 'B') setWastage('15');
    if (val === 'C') setWastage('20');
  };

  const calculateBom = () => {
    const area = parseFloat(patternArea) || 0;
    const pairs = parseFloat(totalPairs) || 0;
    const waste = parseFloat(wastage) || 0;
    const conv = parseFloat(conversionFactor) || 9.29;
    const rate = parseFloat(ratePerSqFt) || 0;

    const baseDM2 = area * pairs;
    const totalDM2 = baseDM2 * (1 + (waste / 100));
    const totalSqFt = totalDM2 / conv;
    const totalCost = totalSqFt * rate;

    setCalculated({
      sqft: totalSqFt.toFixed(2),
      cost: totalCost.toFixed(2)
    });
  };

  const saveBomHistory = async () => {
    if (!calculated) return;
    try {
      await fetch('/api/tools/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleName, leatherName, patternArea, grade, wastage,
          totalSqFt: calculated.sqft, ratePerSqFt, totalCost: calculated.cost
        })
      });
      fetchHistory();
      alert("Saved to history!");
    } catch (e) {
      alert("Error saving history");
    }
  };

  const generateGrid = () => {
    const start = parseInt(startSize) || 39;
    const end = parseInt(endSize) || 45;
    if (start > end) return;
    
    const newInputs: Record<number, string> = {};
    for(let i = start; i <= end; i++) {
      newInputs[i] = sizeInputs[i] || ''; // preserve old if exists
    }
    setSizeInputs(newInputs);
    setSizeResult([]); // Clear previous results
  };


  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now(), name: '', qty: '', rate: '', waste: '0' }]);
  };
  
  const removeMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id));
  };
  
  const updateMaterial = (id: number, field: string, val: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const calculateCosting = () => {
    let sampleMaterialCost = 0;
    let bulkMaterialCost = 0;

    materials.forEach(m => {
      const q = parseFloat(m.qty) || 0;
      const r = parseFloat(m.rate) || 0;
      const w = parseFloat(m.waste) || 0;
      
      const baseCost = q * r;
      // Sample has higher waste assumption (+50% of the given waste)
      sampleMaterialCost += baseCost * (1 + ((w * 1.5) / 100));
      // Bulk has optimal waste
      bulkMaterialCost += baseCost * (1 + (w / 100));
    });

    const totalFixed = (parseFloat(fixedCosts.mold)||0) + (parseFloat(fixedCosts.dies)||0) + (parseFloat(fixedCosts.rnd)||0);
    const bQty = parseInt(bulkQty) || 1;
    
    const sampleLabor = parseFloat(labor.sample) || 0;
    const bulkLabor = parseFloat(labor.bulk) || 0;

    const sampleTotal = sampleMaterialCost + totalFixed + sampleLabor;
    const bulkPerPair = bulkMaterialCost + (totalFixed / bQty) + bulkLabor;

    const m = parseFloat(margin) || 0;
    const sampleSelling = sampleTotal * (1 + (m/100));
    const bulkSelling = bulkPerPair * (1 + (m/100));

    setCostResult({
      sample: {
        material: sampleMaterialCost,
        fixed: totalFixed,
        labor: sampleLabor,
        total: sampleTotal,
        selling: sampleSelling
      },
      bulk: {
        material: bulkMaterialCost,
        fixed: totalFixed / bQty,
        labor: bulkLabor,
        total: bulkPerPair,
        selling: bulkSelling,
        orderValue: bulkSelling * bQty
      }
    });
  };

  const calculateSizes = () => {
    let results = [];
    let total = 0;
    
    const sizes = Object.keys(sizeInputs).map(Number).sort((a,b) => a - b);
    
    for (const eu of sizes) {
      const pairs = parseInt(sizeInputs[eu]) || 0;
      if (pairs > 0) {
        const uk = eu - 33;
        const us = uk + 1;
        const cm = 24 + ((eu - 39) * 0.5); // Simplified rough conversion
        results.push({ eu, uk, us, cm, pairs });
        total += pairs;
      }
    }
    
    setSizeResult(results);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Footwear Tools</h1>
          <p className="text-slate-500 text-sm mt-1">Specialized calculators and utilities for manufacturing.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('bom')} className={`px-4 py-3 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bom' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Calculator size={18} /> BOM Estimator
        </button>
        <button onClick={() => setActiveTab('size')} className={`px-4 py-3 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'size' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Ruler size={18} /> Size Converter
        </button>
        <button onClick={() => setActiveTab('cost')} className={`px-4 py-3 font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'cost' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <IndianRupee size={18} /> Costing Tool
        </button>
      </div>

      {activeTab === 'bom' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-premium p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Calculator className="text-blue-500" /> Leather Yield & Cost Calculator</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Article Name</label><input type="text" className="input-premium" value={articleName} onChange={e => setArticleName(e.target.value)} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Leather Name</label><input type="text" className="input-premium" value={leatherName} onChange={e => setLeatherName(e.target.value)} /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Pattern Area (DM² / Pair)</label><input type="number" className="input-premium" value={patternArea} onChange={e => setPatternArea(e.target.value)} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Total Pairs</label><input type="number" className="input-premium" value={totalPairs} onChange={e => setTotalPairs(e.target.value)} /></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Leather Grade</label>
                  <select className="input-premium bg-white" value={grade} onChange={handleGradeChange}>
                    <option value="A">Grade A (Best)</option>
                    <option value="B">Grade B (Average)</option>
                    <option value="C">Grade C (Poor)</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Wastage % (Editable)</label><input type="number" className="input-premium bg-white" value={wastage} onChange={e => setWastage(e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">DM² to Sq.Ft Divider</label><input type="number" className="input-premium text-slate-500" value={conversionFactor} onChange={e => setConversionFactor(e.target.value)} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Rate per Sq.Ft (₹)</label><input type="number" className="input-premium" value={ratePerSqFt} onChange={e => setRatePerSqFt(e.target.value)} /></div>
              </div>

              <button onClick={calculateBom} className="w-full btn-primary py-3 text-lg mt-4 shadow-md">Calculate BOM</button>
            </div>

            {calculated && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-blue-500 uppercase">Total Leather Required</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{calculated.sqft} <span className="text-lg font-bold text-blue-600">Sq.Ft</span></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-500 uppercase">Estimated Cost</div>
                    <div className="text-3xl font-black text-emerald-600 mt-1">₹ {calculated.cost}</div>
                  </div>
                </div>
                <button onClick={saveBomHistory} className="mt-4 flex items-center justify-center w-full gap-2 py-2 px-4 bg-white border border-blue-200 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                  <Save size={18} /> Save to History
                </button>
              </div>
            )}
          </div>

          <div className="card-premium p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><History className="text-slate-400" /> Calculation History</h2>
            <div className="flex-1 overflow-auto max-h-[600px] pr-2">
              <div className="space-y-3">
                {history.length === 0 ? <p className="text-sm text-slate-500">No history found.</p> : history.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-800">{item.articleName || 'Unknown Article'}</div>
                      <div className="text-xs font-bold text-slate-400">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs text-slate-600 mb-3">{item.leatherName || 'Unknown Leather'} | Grade {item.grade} | Waste: {item.wastage}%</div>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white p-2 rounded border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Sq.Ft Req.</div>
                        <div className="font-black text-slate-700">{item.totalSqFt}</div>
                      </div>
                      <div className="flex-1 bg-white p-2 rounded border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Total Cost</div>
                        <div className="font-black text-emerald-600">₹{item.totalCost}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'size' && (
        <div className="card-premium p-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Scaling className="text-purple-500" /> Buyer Size Breakdown (Assortment)</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3">1. Define Size Range (EU)</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1">Start Size</label><input type="number" className="input-premium bg-white" value={startSize} onChange={e => setStartSize(e.target.value)} /></div>
                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1">End Size</label><input type="number" className="input-premium bg-white" value={endSize} onChange={e => setEndSize(e.target.value)} /></div>
                <button onClick={generateGrid} className="btn-primary py-2 px-6 bg-slate-800 hover:bg-slate-900 shadow-md">Generate Grid</button>
              </div>
            </div>

            {Object.keys(sizeInputs).length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-slate-700 mb-3">2. Enter Required Pairs (Buyer Breakdown)</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
                  {Object.keys(sizeInputs).map(Number).sort((a,b)=>a-b).map(size => (
                    <div key={size}>
                      <label className="block text-xs font-bold text-slate-500 text-center mb-1">EU {size}</label>
                      <input 
                        type="number" 
                        min="0"
                        className="input-premium text-center font-bold text-blue-700" 
                        placeholder="0"
                        value={sizeInputs[size]} 
                        onChange={e => setSizeInputs({...sizeInputs, [size]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
                <button onClick={calculateSizes} className="w-full btn-primary py-3 text-lg bg-purple-600 hover:bg-purple-700 shadow-md">Create Final Assortment Table</button>
              </div>
            )}
          </div>

          {sizeResult.length > 0 && (
            <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-100">
                <h3 className="font-bold text-purple-800 flex justify-between items-center">
                  Final Size Matrix
                  <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-black">Total: {sizeResult.reduce((a,b) => a + b.pairs, 0)} Pairs</span>
                </h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 border-b border-slate-200">EU Size</th>
                    <th className="p-4 border-b border-slate-200">UK</th>
                    <th className="p-4 border-b border-slate-200">US</th>
                    <th className="p-4 border-b border-slate-200">CM (Approx)</th>
                    <th className="p-4 border-b border-slate-200 text-right text-blue-600">Requested Pairs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sizeResult.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{row.eu}</td>
                      <td className="p-4 font-medium text-slate-600">{row.uk}</td>
                      <td className="p-4 font-medium text-slate-600">{row.us}</td>
                      <td className="p-4 font-medium text-slate-600">{row.cm}</td>
                      <td className="p-4 font-black text-blue-600 text-right bg-blue-50/30">{row.pairs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {activeTab === 'cost' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card-premium p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><IndianRupee className="text-emerald-500" /> Bill of Materials</h2>
                <button onClick={addMaterial} className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors"><Plus size={14} /> Add Item</button>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <div className="col-span-4">Material / Item Name</div>
                  <div className="col-span-2">Qty/Pair</div>
                  <div className="col-span-2">Rate (₹)</div>
                  <div className="col-span-3">Wastage (%)</div>
                  <div className="col-span-1"></div>
                </div>
                {materials.map(m => (
                  <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="col-span-4"><input type="text" placeholder="Item Name" className="w-full text-xs p-2 border rounded" value={m.name} onChange={e => updateMaterial(m.id, 'name', e.target.value)} /></div>
                    <div className="col-span-2"><input type="number" placeholder="Qty" className="w-full text-xs p-2 border rounded" value={m.qty} onChange={e => updateMaterial(m.id, 'qty', e.target.value)} /></div>
                    <div className="col-span-2"><input type="number" placeholder="Rate" className="w-full text-xs p-2 border rounded" value={m.rate} onChange={e => updateMaterial(m.id, 'rate', e.target.value)} /></div>
                    <div className="col-span-3"><input type="number" placeholder="Waste %" className="w-full text-xs p-2 border rounded" value={m.waste} onChange={e => updateMaterial(m.id, 'waste', e.target.value)} /></div>
                    <div className="col-span-1 flex justify-center"><button onClick={() => removeMaterial(m.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-premium p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Fixed Setup & Tooling Costs</h2>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Molds (₹)</label><input type="number" className="input-premium" value={fixedCosts.mold} onChange={e => setFixedCosts({...fixedCosts, mold: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Cutting Dies (₹)</label><input type="number" className="input-premium" value={fixedCosts.dies} onChange={e => setFixedCosts({...fixedCosts, dies: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">R&D / Patterns (₹)</label><input type="number" className="input-premium" value={fixedCosts.rnd} onChange={e => setFixedCosts({...fixedCosts, rnd: e.target.value})} /></div>
              </div>
            </div>

            <div className="card-premium p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Labor & Manufacturing Setup</h2>
              <div className="grid grid-cols-4 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Sample Labor (₹)</label><input type="number" className="input-premium" value={labor.sample} onChange={e => setLabor({...labor, sample: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Bulk Labor (₹)</label><input type="number" className="input-premium" value={labor.bulk} onChange={e => setLabor({...labor, bulk: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Bulk Qty</label><input type="number" className="input-premium text-blue-700 bg-blue-50" value={bulkQty} onChange={e => setBulkQty(e.target.value)} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Margin %</label><input type="number" className="input-premium text-emerald-700 bg-emerald-50" value={margin} onChange={e => setMargin(e.target.value)} /></div>
              </div>
              <button onClick={calculateCosting} className="w-full btn-primary py-3 mt-6 bg-emerald-600 hover:bg-emerald-700">Calculate Costing</button>
            </div>
          </div>

          <div>
            {costResult && (
              <div className="card-premium overflow-hidden animate-in fade-in slide-in-from-bottom-4 sticky top-6">
                <div className="bg-slate-900 text-white p-5 text-center">
                  <h2 className="text-xl font-bold">Costing Comparison</h2>
                  <p className="text-slate-400 text-xs mt-1">Single Pair vs {bulkQty} Pairs</p>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 text-xs font-bold text-slate-500">
                      <th className="p-4 border-b">Component</th>
                      <th className="p-4 border-b text-right border-r border-slate-200">Sample (1 Pair)</th>
                      <th className="p-4 border-b text-right text-blue-700 bg-blue-50">Bulk (Per Pair)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="p-4 font-medium text-slate-600">Net Material Cost <br/><span className="text-[10px] text-slate-400">Sample has +50% waste</span></td>
                      <td className="p-4 text-right font-bold text-slate-800 border-r border-slate-200">₹ {costResult.sample.material.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-blue-800 bg-blue-50/50">₹ {costResult.bulk.material.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate-600">Fixed Tooling Cost</td>
                      <td className="p-4 text-right font-bold text-slate-800 border-r border-slate-200 text-red-600">₹ {costResult.sample.fixed.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-blue-800 bg-blue-50/50">₹ {costResult.bulk.fixed.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate-600">Labor / Assembly</td>
                      <td className="p-4 text-right font-bold text-slate-800 border-r border-slate-200 text-red-600">₹ {costResult.sample.labor.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-blue-800 bg-blue-50/50">₹ {costResult.bulk.labor.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 font-bold text-slate-800 uppercase text-xs">Factory Cost</td>
                      <td className="p-4 text-right font-black text-slate-900 border-r border-slate-200">₹ {costResult.sample.total.toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-blue-900 bg-blue-100">₹ {costResult.bulk.total.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t-4 border-slate-200">
                      <td className="p-4 font-bold text-emerald-700">Suggested Price <br/><span className="text-[10px] text-emerald-600/70">With {margin}% Margin</span></td>
                      <td className="p-4 text-right font-black text-emerald-700 border-r border-slate-200 text-lg">₹ {costResult.sample.selling.toFixed(0)}</td>
                      <td className="p-4 text-right font-black text-emerald-700 bg-emerald-50 text-lg">₹ {costResult.bulk.selling.toFixed(0)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="p-4 bg-slate-900 text-center border-t border-slate-800">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-1">Total Order Value ({bulkQty} Pairs)</div>
                  <div className="text-2xl font-black text-emerald-400">₹ {costResult.bulk.orderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
