"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function OrderHeaderActions({ filterType }: { filterType?: string }) {
  const [role, setRole] = useState('admin');

  useEffect(() => {
    setRole(localStorage.getItem('erp_role') || 'admin');
  }, []);

  if (role !== 'admin') {
    return null; // Hide for workers & directors
  }

  return (
    <div className="flex gap-3">
      <Link href={`/articles/new?type=${filterType || ''}`}>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
          <Plus size={16} /> Raise {filterType === 'bulk' ? 'Bulk Order' : 'New Order'}
        </button>
      </Link>
    </div>
  );
}
