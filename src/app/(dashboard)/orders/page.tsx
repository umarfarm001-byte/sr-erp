import Link from 'next/link';
import { Search, Filter, SlidersHorizontal, Settings, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import OrderActions from './OrderActions';
import OrderHeaderActions from './OrderHeaderActions';
import OrderList from './OrderList';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const resolvedParams = await searchParams;
  const filterType = resolvedParams.type;

  let whereClause = {};
  if (filterType === 'sample') {
    whereClause = { type: { in: ['sample', 'production'] } };
  } else if (filterType === 'bulk') {
    whereClause = { type: 'bulk' };
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    include: {
      operations: {
        orderBy: { opId: 'asc' }
      }
    },
    orderBy: { date: 'desc' }
  });

  const pageTitle = filterType === 'sample' 
    ? 'Sample & Production' 
    : filterType === 'bulk' 
      ? 'Bulk Production' 
      : 'Job Cards & Orders';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all production job cards and timelines.</p>
        </div>
        <OrderHeaderActions filterType={filterType} />
      </div>

      <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by serial or party..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      <OrderList initialArticles={articles} />
    </div>
  );
}
