"use client";

import { useState, useEffect } from 'react';
import { Shield, Scissors, Shirt, Package, Database, CheckSquare, ListTodo, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DepartmentsClient({ operations, users }: { operations: any[], users: any[] }) {
  const [role, setRole] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('erp_role') || '');
  }, []);

  if (role && role !== 'admin' && role !== 'director') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-md">Only Administrators and Directors can view the Departments overview.</p>
        <Link href="/" className="btn-primary mt-6 px-6 py-2 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  const deptMap: { [key: string]: { label: string; icon: any; ops: any[] } } = {
    cutting: { label: 'Cutting', icon: Scissors, ops: [] },
    closing: { label: 'Closing & Stitching', icon: Shirt, ops: [] },
    prep: { label: 'Preparation', icon: Activity, ops: [] },
    lasting: { label: 'Lasting & Injection', icon: Database, ops: [] },
    packing: { label: 'Packing', icon: Package, ops: [] },
    purchase: { label: 'Purchase (Raw Materials)', icon: CheckSquare, ops: [] },
    store: { label: 'Store (Components)', icon: Database, ops: [] },
    management: { label: 'Management / Other', icon: ListTodo, ops: [] }
  };

  operations.forEach(op => {
    const user = users.find(u => u.username === op.assignedUserId);
    const deptKey = user?.department || 'management';
    if (deptMap[deptKey]) {
      deptMap[deptKey].ops.push({ ...op, assignedUserName: user?.name || op.assignedUserId });
    }
  });

  const selectedOps = selectedDept ? deptMap[selectedDept].ops : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Factory Departments</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of all pending and active operations categorized by department.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(deptMap).map(key => {
          const dept = deptMap[key];
          const Icon = dept.icon;
          const isSelected = selectedDept === key;
          
          return (
            <div 
              key={key}
              onClick={() => setSelectedDept(isSelected ? null : key)}
              className={`card-premium p-6 cursor-pointer transition-all hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-black text-slate-800">{dept.ops.length}</div>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{dept.label}</h3>
              <p className="text-xs text-slate-500 mt-1">Pending tasks</p>
            </div>
          );
        })}
      </div>

      {selectedDept && (
        <div className="card-premium overflow-hidden animate-in fade-in slide-in-from-bottom-4 mt-8">
          <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">{deptMap[selectedDept].label} Queue</h2>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">{selectedOps.length} Operations</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Operation</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedOps.map(op => (
                  <tr key={op.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{op.article.articleName}</div>
                      <div className="text-xs text-slate-500 font-medium">#{op.article.serial} • {op.article.party}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {op.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{op.assignedUserName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {op.targetDate ? (
                        <div className="text-sm font-bold text-orange-600">{new Date(op.targetDate).toLocaleDateString()}</div>
                      ) : (
                        <div className="text-sm text-slate-400 italic">No deadline set</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/orders/${op.articleId}`}>
                        <button className="btn-primary px-4 py-1.5 text-xs shadow-sm">
                          View Job Card
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {selectedOps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No pending operations for this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
