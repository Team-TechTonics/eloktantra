'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Supabase auth logic would go here
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="glass-card w-full max-w-md p-8 shadow-2xl shadow-primary/10 border-white/5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16" />
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black mb-2 orange-text-gradient">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your civic account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-gray-300">Password</label>
              <Link href="#" className="text-xs text-primary hover:text-accent font-medium">Forgot Password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center space-x-2 ml-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded border-white/10 bg-secondary text-primary focus:ring-primary"
            />
            <label htmlFor="remember" className="text-sm text-gray-400 font-medium">Remember me</label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-accent text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
