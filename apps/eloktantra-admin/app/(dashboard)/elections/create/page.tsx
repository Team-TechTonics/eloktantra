'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { Calendar, Save, X, Info, Globe } from 'lucide-react';
import { adminCreateElection } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateElectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '', // Explicit unique code
    type: 'General',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Initialized in Render Backend (Source of Truth)
      await adminCreateElection({
        title: formData.title,
        code: formData.code,
        type: formData.type as 'General' | 'State',
        start_time: formData.startDate, // Explicitly map to NestJS expectation
        end_time: formData.endDate,     // Explicitly map to NestJS expectation
        isActive: formData.isActive
      });

      toast.success('Election initialized in secure ledger');
      router.push('/elections');
    } catch (error: any) {
      console.error('CREATE_ELECTION_ERROR:', error);
      
      if (error?.response?.status === 409) {
        toast.error('Election code already exists! Choose a unique ID.');
      } else {
        toast.error('Failed to initialize election. Check connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader 
        title="Initialize Hierarchy" 
        subtitle="Step 1: Create the root election entry in the national digital ledger"
      />

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe className="w-32 h-32 text-amber-500" />
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Election Code (Unique ID)</label>
              <input 
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-mono font-bold text-amber-600 uppercase"
                placeholder="e.g. INDIA_GEN_2024"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Election Title</label>
              <input 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
                placeholder="e.g. India General Elections 2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Election Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900 appearance-none cursor-pointer"
            >
              <option value="General">General (Lok Sabha)</option>
              <option value="State">State (Vidhan Sabha)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Polling Start</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Polling End</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 p-6 rounded-[1.5rem] flex items-start space-x-3 border border-blue-50">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-[11px] text-blue-800/70 font-bold leading-relaxed tracking-wide uppercase">
            This operation initializes the root of the election hierarchy. Once created, you can add state-wise constituencies and regional candidates.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
           <button 
             type="button" 
             onClick={() => router.back()}
             className="px-8 py-3.5 font-bold text-gray-400 hover:text-red-500 transition-all flex items-center group"
           >
             <X className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" /> Discard
           </button>
           <button 
             type="submit" 
             disabled={isSubmitting}
             className="px-12 py-4 bg-amber-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center"
           >
             <Save className="w-4 h-4 mr-3" /> {isSubmitting ? 'Initializing...' : 'Initialize Election'}
           </button>
        </div>
      </form>
    </div>
  );
}
