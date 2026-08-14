"use client";

import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, UserPlus, Shield, Activity, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '123', role: 'worker', department: 'cutting' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', password: '' });

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, password: user.password || '123' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if(res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };


  const [role, setRole] = useState('admin');

  useEffect(() => {
    setRole(localStorage.getItem('erp_role') || 'admin');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if(Array.isArray(data)) setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ name: '', username: '', password: '123', role: 'worker', department: 'cutting' });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><Shield size={32} /></div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-md">Only Administrators have permission to view or manage users in the system.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary mt-6 px-6 py-2">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage factory workers, directors, and administrators.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add New User
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="card-premium p-6 bg-blue-50/50 border-blue-200 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
          <div className="md:col-span-3 text-sm font-bold text-blue-800 border-b border-blue-200 pb-2">Create New User</div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label><input required type="text" className="input-premium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Username (Login)</label><input required type="text" className="input-premium" value={form.username} onChange={e => setForm({...form, username: e.target.value})} /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label><input required type="text" className="input-premium" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">System Role</label>
            <select className="input-premium" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="worker">Factory Worker</option>
              <option value="admin">Administrator</option>
              <option value="director">Director</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
            <select className="input-premium" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
              <option value="cutting">Cutting</option>
              <option value="closing">Closing / Stitching</option>
              <option value="prep">Preparation</option>
              <option value="lasting">Lasting / Injection</option>
              <option value="packing">Packing</option>
              <option value="purchase">Purchase (Raw Materials)</option>
              <option value="store">Store (Components)</option>
              <option value="management">Management / Other</option>
            </select>
          </div>
          <div className="flex items-end"><button type="submit" disabled={loading} className="btn-primary w-full py-2.5 shadow-md">Create User</button></div>
        </form>
      )}

      
      {editingUser && (
        <form onSubmit={handleEditSubmit} className="card-premium p-6 bg-purple-50/50 border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
          <div className="md:col-span-2 flex justify-between items-center text-sm font-bold text-purple-800 border-b border-purple-200 pb-2">
            <div>Edit User</div>
            <button type="button" onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-slate-800">Cancel</button>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">System Username (Locked)</label>
            <input type="text" className="input-premium bg-slate-100 text-slate-500 cursor-not-allowed" value={editingUser.username} disabled />
            <p className="text-xs text-slate-500 mt-1">System usernames cannot be changed to prevent workflow lock issues.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Real Name</label>
            <input required type="text" className="input-premium" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input required type="text" className="input-premium" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 shadow-md bg-purple-600 hover:bg-purple-700">Save Changes</button>
          </div>
        </form>
      )}

      
      <div className="card-premium overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">Sample & Admin Users</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">Management & Phase 1</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">System Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Join Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.filter(u => u.role === 'admin' || u.role === 'director' || u.username === 'designer' || u.username?.startsWith('store_') || ['lc','ln','last','inj'].includes(u.username)).map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 font-medium">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'director' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role === 'admin' && <Shield size={12}/>}
                    {user.role === 'director' && <Activity size={12}/>}
                    {user.role === 'worker' && <UsersIcon size={12}/>}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">
                  {user.department || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(user)} className="text-slate-400 hover:text-purple-500 transition-colors p-2 text-sm font-bold mr-2">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No users found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-premium overflow-hidden mt-6">
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">Bulk Production Users</h2>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Phase 3 Factory</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">System Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Join Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.filter(u => !(u.role === 'admin' || u.role === 'director' || u.username === 'designer' || u.username?.startsWith('store_') || ['lc','ln','last','inj'].includes(u.username))).map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 font-medium">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'director' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role === 'admin' && <Shield size={12}/>}
                    {user.role === 'director' && <Activity size={12}/>}
                    {user.role === 'worker' && <UsersIcon size={12}/>}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700 uppercase text-xs tracking-wider">
                  {user.department || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(user)} className="text-slate-400 hover:text-purple-500 transition-colors p-2 text-sm font-bold mr-2">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {users.filter(u => !(u.role === 'admin' || u.role === 'director' || u.username === 'designer' || u.username?.startsWith('store_') || ['lc','ln','last','inj'].includes(u.username))).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No bulk users found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
