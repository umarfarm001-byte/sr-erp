import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
          <Link href="/login" className="hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">User Agreement (Terms of Service)</h1>
        </div>
        
        <div className="p-8 prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last Updated: August 2026</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            By accessing and using the SR Footwear Factory Management System (the "Software"), you agree to be bound by this User Agreement. If you do not agree to these terms, please do not use the Software.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The Software is a proprietary internal enterprise resource planning (ERP) system designed exclusively for the management of footwear production, including but not limited to job cards, capacity planning, and master data management. 
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. User Responsibilities & Security</h2>
          <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
            <li>Users must maintain the confidentiality of their login credentials.</li>
            <li>Users are strictly prohibited from sharing, exporting, or distributing internal factory data, costing formulas, or material lists to unauthorized third parties.</li>
            <li>Any unauthorized access or attempt to manipulate the database will result in immediate termination of access.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Data Ownership</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            All data entered into the Software, including article designs, client lists, and pricing, remains the exclusive intellectual property of the factory administration. The developers of this software claim no ownership over the data processed within.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">5. Limitation of Liability</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The Software is provided "as is". While every effort is made to ensure data integrity (via features like the Archival System), the administration is not liable for data loss due to hardware failures or improper usage.
          </p>

        </div>
      </div>
    </div>
  );
}
