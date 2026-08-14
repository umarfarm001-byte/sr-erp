"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderActions({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [role, setRole] = useState('admin');

  useEffect(() => {
    setRole(localStorage.getItem('erp_role') || 'admin');
  }, []);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const userInput = prompt('Type "DELETE" to confirm deletion of this order:');
    if (userInput !== 'DELETE') {
      if (userInput !== null) {
        alert('Deletion cancelled. You must type "DELETE" exactly.');
      }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete order');
        setLoading(false);
      }
    } catch (e) {
      alert('Error deleting order');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 shrink-0 md:ml-4 md:border-l md:border-slate-100 md:pl-6 justify-center">
      <Link href={`/orders/${articleId}`} className="flex-1 md:flex-none">
        <button disabled={loading} className="h-12 md:h-10 px-6 w-full rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">
          View Job Card
        </button>
      </Link>
      { (role === 'admin') && (<>
      <button 
        onClick={handleDelete}
        disabled={loading} 
        className="h-12 md:h-10 w-12 md:w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100"
        title="Delete Order"
      >
        <Trash2 size={16} />
      </button>
      </>)}
    </div>
  );
}

