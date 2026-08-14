import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Users, TrendingUp, Settings } from 'lucide-react';

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white flex items-center gap-4">
          <Link href="/login" className="hover:bg-blue-700 p-2 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">SR Footwear ERP - User Manual</h1>
            <p className="text-blue-100 mt-2">Complete guide to operating the factory management software.</p>
          </div>
        </div>
        
        <div className="p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Layers size={24} /></div>
                <h3 className="text-lg font-bold text-slate-800">1. Master Data</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Before creating any orders, you must set up your Master Data. This includes Customers, Materials (Upper, Lining, Sole), and Shoe Lasts.
              </p>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Navigate to <strong>Master Data</strong> on the left sidebar.</li>
                <li>Select a category and click <em>+ Add New</em> to add items.</li>
                <li>Items added here will appear in dropdowns during Order Creation.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><TrendingUp size={24} /></div>
                <h3 className="text-lg font-bold text-slate-800">2. Order Management</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Orders are divided into Sample Production and Bulk Production.
              </p>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Click <strong>New Order</strong> from the Dashboard.</li>
                <li>Fill in the exhaustive Job Card details (Materials, Last, Logo).</li>
                <li>Upon saving, the system automatically creates operation steps (Cutting, Stitching, etc.) with deadlines.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Users size={24} /></div>
                <h3 className="text-lg font-bold text-slate-800">3. Worker Tracking & Alerts</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Workers can log in to update their daily progress.
              </p>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Workers select their Role in the system.</li>
                <li>They open an Order and submit <em>Daily Progress</em> (Pairs completed).</li>
                <li>If a task is delayed, a <strong>Red Bell Alert</strong> automatically notifies the Admin.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Settings size={24} /></div>
                <h3 className="text-lg font-bold text-slate-800">4. Archiving (New Year)</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                At the end of the financial year, you can clear the dashboard safely.
              </p>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Go to <strong>Settings</strong> and type <em>NEW_YEAR</em>.</li>
                <li>This wipes old orders but keeps all your Master Data and Users intact.</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
