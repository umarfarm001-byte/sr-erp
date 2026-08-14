"use client";

import { Home, Layers, Users, Settings, Database, Activity, Scissors, Shirt, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const [currentRole, setCurrentRole] = useState('admin');
  const [users, setUsers] = useState<any[]>([]);
  const [testMode, setTestMode] = useState(false);

  const coreUsernames = ['designer', 'store_leather', 'store_lining', 'store_app', 'store_bottom', 'lc', 'ln', 'last', 'inj'];
  const currentUserObj = users.find(u => u.username === currentRole || u.id === currentRole);
  const isBulkUser = currentUserObj && currentUserObj.role === 'worker' && !coreUsernames.includes(currentUserObj.username);
  const isSampleUser = currentUserObj && currentUserObj.role === 'worker' && coreUsernames.includes(currentUserObj.username);
  const ordersMenuName = isSampleUser ? 'Sample / Production' : (isBulkUser ? 'Bulk Production' : 'Orders & Job Cards');

  const canViewTools = ['admin', 'director', 'designer', 'purch_leather', 'store_leather'].includes(currentRole);

  const menuItems = [
    ...(currentRole === 'admin' || currentRole === 'director' ? [{ name: 'Dashboard', icon: Home, href: '/' }] : []),
    ...(currentRole === 'admin' || currentRole === 'director' ? [
      { name: 'Sample / Production', icon: Layers, href: '/orders?type=sample' },
      { name: 'Bulk Production', icon: Layers, href: '/orders?type=bulk' }
    ] : [
      { name: ordersMenuName, icon: Layers, href: `/orders?type=${isSampleUser ? 'sample' : 'bulk'}` }
    ]),
    ...(currentRole === 'admin' || currentRole === 'director' ? [{ name: 'Departments', icon: Activity, href: '/departments' }] : []),
    ...(canViewTools ? [{ name: 'Tools', icon: Scissors, href: '/tools' }] : []),
    ...(currentRole === 'admin' ? [
      { name: 'Users', icon: Users, href: '/users' },
      { name: 'Master Data', icon: Database, href: '/master-data' },
      { name: 'Settings', icon: Settings, href: '/settings' }
    ] : []),
  ];

  useEffect(() => {
    setCurrentRole(localStorage.getItem('erp_role') || 'admin');
    setTestMode(localStorage.getItem('erp_test_mode') === 'true');
    fetch('/api/users').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setUsers(data);
    });
  }, []);

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-600 font-black text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white">ERP</span>
          </div>
          SR
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium text-sm"
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User size={18} className="text-slate-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Current Role</div>
            {testMode ? (
              <select 
                className="text-xs text-slate-500 font-medium bg-transparent border-none p-0 cursor-pointer focus:ring-0 max-w-[120px] truncate"
                value={currentRole}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setCurrentRole(newRole);
                  localStorage.setItem('erp_role', newRole);
                  window.location.reload();
                }}
              >
                <option value="admin">Admin</option>
                <option value="director">Director</option>
                <optgroup label="Sample/Prod Users">
                  {users.filter(u => u.role === 'worker' && coreUsernames.includes(u.username)).map(u => (
                    <option key={u.id} value={u.username}>{u.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Bulk Users">
                  {users.filter(u => u.role === 'worker' && !coreUsernames.includes(u.username)).map(u => (
                    <option key={u.id} value={u.username}>{u.name}</option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <div className="text-xs text-slate-500 font-medium max-w-[120px] truncate capitalize">
                {users.find(u => u.username === currentRole)?.name || currentRole}
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={async () => {
            localStorage.clear();
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
