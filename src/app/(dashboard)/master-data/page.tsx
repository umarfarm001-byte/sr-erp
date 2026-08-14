"use client";

import { useState, useEffect } from 'react';
import { Database, Trash2, Plus, Search, Layers, Box, Tag, Users, Ruler, Scissors } from 'lucide-react';

const CATEGORIES = [
  { id: 'customer', label: 'Customers / Parties', icon: Users },
  { id: 'articleCode', label: 'Article Codes', icon: Tag },
  { id: 'last', label: 'Shoe Lasts', icon: Ruler },
  { id: 'mould', label: 'Moulds & Dies', icon: Box },
  { id: 'pattern', label: 'Patterns', icon: Scissors },
  { id: 'upper', label: 'Upper Materials (Leather/PU)', icon: Layers },
  { id: 'lining', label: 'Lining Materials', icon: Layers },
  { id: 'sole', label: 'Soles', icon: Layers },
  { id: 'insole', label: 'Insoles', icon: Layers },
  { id: 'toecap', label: 'Toe Caps / Counters', icon: Layers },
  { id: 'dring', label: 'D-Rings & Eyelets', icon: Layers },
  { id: 'logo', label: 'Logos & Labels', icon: Layers },
  { id: 'lace', label: 'Laces', icon: Layers },
  { id: 'thread', label: 'Threads', icon: Layers },
];

export default function MasterDataPage() {
  const [data, setData] = useState<Record<string, string[]>>({});
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dropdowns');
      const json = await res.json();
      
      const parsedData: Record<string, string[]> = {
        customer: json.customers || [],
        articleCode: json.articleCodes || [],
        last: json.lasts || [],
        ...(json.materials || {})
      };
      
      setData(parsedData);
    } catch(e) {
      console.error("Error fetching master data", e);
    }
  };

  const addData = async () => {
    if (!newValue.trim()) return;
    try {
      await fetch('/api/dropdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeCategory, value: newValue.trim() })
      });
      setNewValue('');
      fetchData();
    } catch(e) {
      console.error(e);
    }
  };

  const deleteData = async (value: string) => {
    if (!confirm("Are you sure you want to delete " + value + "?")) return;
    try {
      await fetch('/api/dropdowns?type=' + activeCategory + '&value=' + encodeURIComponent(value), {
        method: 'DELETE'
      });
      fetchData();
    } catch(e) {
      console.error(e);
    }
  };

  const currentList = data[activeCategory] || [];
  const filteredList = currentList.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const currentCategoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Data</h1>
          <p className="text-slate-500 text-sm mt-1">Manage global factory inventories and standardized lists.</p>
        </div>
        <Database className="text-blue-500" size={32} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[700px]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 flex-shrink-0 card-premium flex flex-col p-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Categories</div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = (data[cat.id] || []).length;
              return (
                <button 
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); setNewValue(''); }}
                  className={"w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-colors " + (isActive ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium")}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-blue-200' : 'text-slate-400'} />
                    {cat.label}
                  </div>
                  <span className={"text-xs font-bold px-2 py-0.5 rounded-full " + (isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 card-premium flex flex-col overflow-hidden">
          
          {/* Header & Search */}
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">{currentCategoryLabel}</h2>
              <p className="text-xs text-slate-500 mt-1">Add or remove items for this category.</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search list..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Add New Input */}
          <div className="p-4 flex gap-3 border-b border-slate-100 shadow-sm z-10 relative">
            <input 
              type="text" 
              placeholder={"Add new " + currentCategoryLabel + "..."} 
              className="input-premium flex-1"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addData()}
            />
            <button onClick={addData} className="btn-primary px-6 bg-blue-600 shadow-md">
              <Plus size={18} className="mr-2" /> Add Record
            </button>
          </div>
          
          {/* List Area */}
          <div className="flex-1 overflow-auto bg-slate-50/50">
            {filteredList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <Box size={48} className="text-slate-200 mb-4" />
                <p className="font-medium text-slate-600">No records found.</p>
                <p className="text-sm mt-1 text-center">Use the input field above to add your first record to this category.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredList.map((item, i) => (
                  <li key={i} className="flex justify-between items-center p-4 hover:bg-white group transition-all">
                    <span className="font-bold text-slate-700">{item}</span>
                    <button 
                      onClick={() => deleteData(item)} 
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}
