'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { register } from '@/lib/api/auth';
import { fetchConstituencies } from '@/lib/api/voting';
import { UserRole } from '@eloktantra/types';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    constituency: '',
  });
  const [constituencies, setConstituencies] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchConstituencies();
      if (data && data.length > 0) {
        setConstituencies(data.map((c: any) => c.name || c));
      } else {
        setConstituencies([
          'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Central Delhi',
          'Chandni Chowk', 'North East Delhi', 'North West Delhi'
        ]);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        constituency: formData.constituency,
        role: UserRole.CITIZEN,
      });

      if (response.success) {
        // Registration success usually redirects to login or a verification page
        router.push('/login?registered=true');
      } else {
        setErrorMessage(response.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="glass-card w-full max-w-lg p-10 shadow-2xl shadow-primary/10 border-white/5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -ml-16 -mt-16" />
        
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-black mb-2 orange-text-gradient uppercase tracking-tight">Create Account</h2>
          <p className="text-gray-400">Join the civic revolution and make your voice heard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm font-medium">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="e.g. john@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Constituency</label>
            <select
              name="constituency"
              value={formData.constituency}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="bg-secondary">Select your constituency</option>
              {constituencies.map((c) => (
                <option key={c} value={c} className="bg-secondary">{c}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary hover:bg-accent text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
