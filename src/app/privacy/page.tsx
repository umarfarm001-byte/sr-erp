import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
          <Link href="/login" className="hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="p-8 prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-8">Last Updated: August 2026</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            As an internal enterprise application, the Software collects information provided directly by the administrators and authorized employees. This includes names, roles, departmental assignments, and operational data (such as job completion times and daily production numbers).
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Data is strictly used for internal factory operations:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
            <li>Tracking production progress and identifying bottlenecks.</li>
            <li>Calculating accurate costing and capacity metrics.</li>
            <li>Generating automated Smart Alerts for delayed operations.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">3. Data Sharing & Third Parties</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            This is a closed-loop system. We do not sell, rent, or share any operational, personal, or financial data with external third parties. All data resides within the factory's designated server environment.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">4. Security Measures</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The system employs role-based access control (RBAC). A worker in the Cutting department cannot view the financial costing tools available only to the Director. System administrators are responsible for regularly archiving data via the built-in Settings module to prevent loss.
          </p>

        </div>
      </div>
    </div>
  );
}
