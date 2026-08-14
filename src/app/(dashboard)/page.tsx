"use client";

import { Activity, Clock, AlertTriangle, CheckCircle, PackageOpen } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useState, useEffect } from 'react';

const timelineData = [
  { name: 'Mon', completed: 12, delayed: 2 },
  { name: 'Tue', completed: 19, delayed: 1 },
  { name: 'Wed', completed: 15, delayed: 4 },
  { name: 'Thu', completed: 22, delayed: 0 },
  { name: 'Fri', completed: 28, delayed: 2 },
  { name: 'Sat', completed: 35, delayed: 5 },
  { name: 'Sun', completed: 42, delayed: 1 },
];

const deptData = [
  { name: 'Cutting', onTime: 95, late: 5 },
  { name: 'Closing', onTime: 80, late: 20 },
  { name: 'Lasting', onTime: 90, late: 10 },
  { name: 'Packing', onTime: 99, late: 1 },
];

export default function Dashboard() {

  const [role, setRole] = useState('admin');
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Gantt States
  const [ganttData, setGanttData] = useState<any[]>([]);
  const [capacity, setCapacity] = useState('500'); // Pairs per day


  useEffect(() => {
    setIsClient(true);
    const r = localStorage.getItem('erp_role') || 'admin';
    setRole(r);
    
    // Redirect workers to their tasks page
    if (r !== 'admin' && r !== 'director') {
      window.location.href = '/orders';
    } else {

      fetch('/api/dashboard')
        .then(res => res.json())
        .then(res => setData(res))
        .catch(err => console.error(err));
        
      fetch('/api/dashboard/gantt')
        .then(res => res.json())
        .then(res => setGanttData(res.activeOrders || []))
        .catch(err => console.error(err));

    }
  }, []);

  if (!isClient || (role !== 'admin' && role !== 'director')) {
    return <div className="p-10 flex justify-center text-slate-400">Loading your workspace...</div>;
  }

  const activePairsBulk = data?.activePairs?.bulk || 0;
  const activePairsSample = data?.activePairs?.sample || 0;
  const totalActiveOrders = data?.activeOrders?.total || 0;
  const overdueOps = data?.operations?.overdue || 0;
  const totalPending = data?.operations?.totalPending || 0;
  
  const onTimeRate = totalPending > 0 
    ? Math.round((data?.operations?.onTime / totalPending) * 100) 
    : 100;


  // Gantt Scheduling Algorithm
  const dailyCapacity = parseInt(capacity) || 500;
  let currentDate = new Date();
  let totalScheduledDays = 0;
  
  const scheduledOrders = ganttData.map(order => {
    // 1 day minimum for sample, or ceil for bulk
    const daysRequired = order.type === 'sample' 
      ? Math.max(1, Math.ceil(order.totalPairs / (dailyCapacity/4))) // sample assumes 4x slower 
      : Math.max(1, Math.ceil(order.totalPairs / dailyCapacity));
      
    const startDate = new Date(currentDate);
    
    // Add days to current date to find end date
    currentDate.setDate(currentDate.getDate() + daysRequired);
    const endDate = new Date(currentDate);
    
    totalScheduledDays += daysRequired;
    
    return {
      ...order,
      daysRequired,
      startDate: startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      endDate: endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
  });


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Director Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time factory metrics and production tracking.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Activity size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{activePairsBulk.toLocaleString()}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Active Bulk Pairs</p>
            <p className="text-xs text-blue-600 font-bold mt-1">+{activePairsSample.toLocaleString()} Sample Pairs</p>
          </div>
        </div>

        <div className="card-premium p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <PackageOpen size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{totalActiveOrders}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Total Active Orders</p>
            <p className="text-xs text-orange-600 font-bold mt-1">Sample: {data?.activeOrders?.sample || 0} | Bulk: {data?.activeOrders?.bulk || 0}</p>
          </div>
        </div>

        <div className="card-premium p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{overdueOps}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Overdue Operations</p>
            <p className="text-xs text-red-600 font-bold mt-1">Across all active jobs</p>
          </div>
        </div>

        <div className="card-premium p-6 flex flex-col justify-between bg-blue-600 border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white">{onTimeRate}%</h3>
            <p className="text-sm font-medium text-blue-100 mt-1">On-Time Pipeline Rate</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Production Flow Chart */}
        
        {/* Auto-Capacity Planner (Visual Gantt) */}
        <div className="card-premium p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Auto-Capacity Planner</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live Delivery Predictor</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2">
              <label className="text-xs font-bold text-blue-800 whitespace-nowrap">Factory Capacity:</label>
              <input 
                type="number" 
                className="w-20 bg-white border border-blue-200 rounded text-sm p-1 font-black text-center text-blue-700 outline-none"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
              />
              <span className="text-[10px] font-bold text-blue-600 uppercase">Pairs/Day</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto max-h-80 pr-2">
            <div className="space-y-4">
              {scheduledOrders.length === 0 ? (
                <div className="text-sm text-slate-500 italic p-4 text-center">No active orders in pipeline.</div>
              ) : scheduledOrders.map((order, idx) => {
                
                // Calculate width based on total scheduled days to simulate a gantt view
                // We'll give it a min width so it's always visible
                const widthPercent = Math.max(15, (order.daysRequired / Math.max(1, totalScheduledDays)) * 100);
                
                return (
                  <div key={order.id} className="relative group">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 px-1">
                      <span>{order.startDate}</span>
                      <span>{order.endDate}</span>
                    </div>
                    
                    {/* Gantt Bar */}
                    <div className="w-full bg-slate-100 rounded-lg h-10 flex items-center relative overflow-hidden">
                      <div 
                        className={`absolute top-0 bottom-0 left-0 rounded-lg flex items-center px-3 transition-all duration-500 ${order.type === 'sample' ? 'bg-orange-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, widthPercent)}%` }}
                      >
                        <div className="truncate text-white text-xs font-bold">
                          {order.name} <span className="opacity-75 font-normal ml-1">({order.totalPairs} pairs)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {scheduledOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500 inline-block"></span> Sample Order</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-600 inline-block"></span> Bulk Production</div>
            </div>
          )}
        </div>


        {/* Department Bottlenecks */}
        <div className="card-premium p-6">
          <h2 className="text-base font-bold text-slate-800 mb-6">Department Efficiency (Coming Soon)</h2>
          <div className="h-72 w-full opacity-50 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#0F172A', fontSize: 13, fontWeight: 600}} width={70} />
                <Bar dataKey="onTime" name="On Time %" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={16} />
                <Bar dataKey="late" name="Late %" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>

    </div>
  );
}
