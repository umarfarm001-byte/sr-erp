"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('erp_user_id', user.id);
        localStorage.setItem('erp_role', user.role);
        localStorage.setItem('erp_username', user.username);
        localStorage.setItem('erp_name', user.name);
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side: Premium Branding */}
      <div className="hidden lg:flex flex-1 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/30 border border-white/20">
              <span className="text-blue-600 font-black text-2xl tracking-tighter">SR</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-3xl tracking-tight leading-none">Footwear</span>
              <span className="text-blue-200 font-bold text-xs tracking-[0.2em] uppercase mt-1.5">ERP System</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight mt-20">
            Dedicated Factory <br/> Management Engine.
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Secure, scalable, and isolated production tracking for modern footwear manufacturers.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to your dedicated workspace.</p>
          </div>

          <form className="card-premium p-8" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email / Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="username" 
                    className="input-premium !pl-10 !py-2.5 text-slate-800"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-premium !pl-10 !py-2.5 text-slate-800"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>

              {error && <div className="text-red-500 text-sm font-semibold mt-2">{error}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 mt-4 flex items-center justify-center gap-2 shadow-md">
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center space-y-2">
            <div className="flex justify-center gap-4 text-sm font-medium text-slate-500">
              <Link href="/manual" className="hover:text-blue-600 transition-colors">User Manual</Link>
              <span>&middot;</span>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">User Agreement</Link>
              <span>&middot;</span>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            </div>
            <p className="text-xs text-slate-400">
              Secure Single-Tenant Architecture &middot; SR Footwear
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
