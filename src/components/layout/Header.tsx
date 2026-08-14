"use client";

import { useState, useEffect } from 'react';
import { Bell, Search, AlertCircle, Info, Clock, CheckCircle, X } from 'lucide-react';

export default function Header() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const role = localStorage.getItem('erp_role') || 'admin';
      const res = await fetch(`/api/notifications?role=${encodeURIComponent(role)}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Filter out dismissed alerts from localStorage
        const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
        const activeAlerts = data.filter(n => !dismissed.includes(n.id));
        setNotifications(activeAlerts);
      }
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  };

  const dismissAlert = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent dropdown from closing if needed
    
    // Save to local storage
    const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem('dismissedAlerts', JSON.stringify(dismissed));
    }
    
    // Update state immediately
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    if (type === 'error') return <AlertCircle size={16} className="text-red-500 mt-1 flex-shrink-0" />;
    if (type === 'warning') return <Clock size={16} className="text-orange-500 mt-1 flex-shrink-0" />;
    if (type === 'info') return <Info size={16} className="text-blue-500 mt-1 flex-shrink-0" />;
    return <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search articles, orders, or users..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100"
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          )}
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800">Alerts</h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{notifications.length} New</span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">No new notifications.</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <li key={notif.id} className="hover:bg-slate-50 transition-colors flex items-start group relative">
                        <div className="flex gap-3 p-4 flex-1">
                          {getIcon(notif.type)}
                          <div className="pr-6">
                            <p className="text-xs font-bold text-slate-700 mb-0.5">{notif.title}</p>
                            <p className="text-xs text-slate-600 leading-tight">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notif.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => dismissAlert(e, notif.id)}
                          className="absolute right-4 top-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-50 rounded p-1 shadow-sm"
                          title="Delete Alert"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
