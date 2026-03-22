'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { Calendar, Save, X, Info } from 'lucide-react';
import axios from 'axios';
import backendAPI from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateElectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    constituency: 'National',
    start_time: '',
    end_time: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Documentation specifies /election/create for Admin
      await backendAPI.post('/election/create', formData);
      toast.success('Election initialized on backend');
      router.push('/elections');
    } catch (error: any) {
      console.error('CREATE_ELECTION_ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize election');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Initialize Election" 
        subtitle="Create a new digital election and deploy the consensus contract"
      />

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Election Title</label>
            <input 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
              placeholder="e.g. Lok Sabha General Elections 2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Scope & Description</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-gray-700 resize-none"
              placeholder="Brief overview of the election scope..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Constituency / Region</label>
            <input 
              required
              value={formData.constituency}
              onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
              placeholder="e.g. National, New Delhi, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Polling Start</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Polling End</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50/50 p-6 rounded-2xl flex items-start space-x-3 border border-amber-50">
          <Info className="w-5 h-5 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-800/70 font-medium leading-relaxed">
            By clicking save, you will trigger a smart contract deployment on the blockchain. 
            This action cannot be undone and will incur gas costs on the network.
          </p>
        </div>

        <div className="pt-4 flex justify-between items-center">
           <button 
             type="button" 
             onClick={() => router.back()}
             className="px-6 py-3 font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center"
           >
             <X className="w-4 h-4 mr-2" /> Discard
           </button>
           <button 
             type="submit" 
             disabled={isSubmitting}
             className="px-10 py-3.5 bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center"
           >
             <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Deploying...' : 'Create Election'}
           </button>
        </div>
      </form>
    </div>
  );
}
