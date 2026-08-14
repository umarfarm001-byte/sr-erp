"use client";

import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, ArchiveRestore } from 'lucide-react';

export default function SettingsPage() {
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({ name: 'SR Footwear', address: '', contactEmail: '', contactPhone: '', gstNumber: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetch('/api/settings/profile').then(res => res.json()).then(data => { if(data && !data.error) setCompanyProfile(data); });

    setTestMode(localStorage.getItem('erp_test_mode') === 'true');
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await fetch('/api/settings/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(companyProfile) });
      alert('Company Profile saved successfully!');
    } catch(e) { alert('Failed to save profile.'); } finally { setSavingProfile(false); }
  };

  const handleTestModeToggle = (e: any) => {
    const val = e.target.checked;
    setTestMode(val);
    localStorage.setItem('erp_test_mode', val ? 'true' : 'false');
    window.location.reload();
  };

  const handleArchive = async () => {
    if (confirmPhrase !== 'NEW_YEAR') {
      alert("Please type exactly 'NEW_YEAR' to confirm.");
      return;
    }

    if (!confirm("FINAL WARNING: This will archive all current orders and clear the active pipeline. Do you want to proceed?")) return;

    setIsArchiving(true);
    try {
      const res = await fetch('/api/settings/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPhrase })
      });
      const data = await res.json();
      if (data.success) {
        alert("Success! Financial year archived. All old orders are saved in backup. Factory is now ready for fresh orders!");
        window.location.href = '/';
      } else {
        alert("Error: " + data.error);
      }
    } catch(e) {
      alert("Failed to archive.");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your factory workspace and data.</p>
        </div>
        <Settings className="text-slate-300" size={32} />
      </div>

        <div className="card-premium p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Factory / Company Profile</h3>
              <p className="text-sm text-slate-500">Internal records of the company using this software.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Company Name</label>
              <input type="text" value={companyProfile.name} onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="e.g. XYZ Footwear" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">GST Number</label>
              <input type="text" value={companyProfile.gstNumber || ''} onChange={e => setCompanyProfile({...companyProfile, gstNumber: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="e.g. 07AABCU9603R1Z..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
              <input type="email" value={companyProfile.contactEmail || ''} onChange={e => setCompanyProfile({...companyProfile, contactEmail: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="admin@xyz.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Phone</label>
              <input type="text" value={companyProfile.contactPhone || ''} onChange={e => setCompanyProfile({...companyProfile, contactPhone: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" placeholder="+91 9876543210" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Full Address</label>
              <textarea value={companyProfile.address || ''} onChange={e => setCompanyProfile({...companyProfile, address: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" rows={2} placeholder="Factory Address"></textarea>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSaveProfile} disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
              {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </div>

        <div className="card-premium p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Developer / Test Mode</h3>
              <p className="text-sm text-slate-500">Enable the quick role-switcher in the sidebar without logging in.</p>
            </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={testMode}
              onChange={handleTestModeToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="card-premium p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center rounded-xl">
            <ArchiveRestore size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Start New Financial Year (Archive Session)</h2>
            <p className="text-sm text-slate-500">Safely backup current orders and start fresh.</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6 text-sm text-orange-800">
          <strong className="block mb-2 flex items-center gap-2">
            <ShieldAlert size={18} /> What happens when you do this?
          </strong>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            <li>A backup file of your entire database is created securely on the server.</li>
            <li>All active and completed <strong>Orders, Job Cards, and Operations</strong> are wiped from the live dashboard.</li>
            <li>Your <strong>Users, Master Data, Customers, and Article Codes</strong> will REMAIN intact for the new year.</li>
            <li>Use this only when you want to start a brand new season / financial year.</li>
          </ul>
        </div>

        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">To confirm, type <strong>NEW_YEAR</strong> below:</label>
            <input 
              type="text" 
              className="input-premium border-red-200 focus:border-red-500 focus:ring-red-500" 
              placeholder="Type NEW_YEAR"
              value={confirmPhrase}
              onChange={e => setConfirmPhrase(e.target.value)}
            />
          </div>
          <button 
            onClick={handleArchive}
            disabled={isArchiving || confirmPhrase !== 'NEW_YEAR'}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isArchiving ? 'Archiving Database...' : 'Confirm & Start Fresh Year'}
          </button>
        </div>
      </div>
    </div>
  );
}
