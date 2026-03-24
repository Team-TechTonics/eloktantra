'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, X, ChevronRight, User, Shield, Globe, Award } from 'lucide-react';
import { Party, Constituency, Election } from '@/types';
import { contentAPI as backendAPI, adminGetParties, adminGetConstituencies, adminCreateCandidate, adminGetActiveElection } from '@/lib/api';

const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  party: z.string().min(1, 'Select a party'),
  partyId: z.string().min(1),
  constituency: z.string().min(1, 'Select a constituency'),
  constituencyId: z.string().min(1),
  photo_url: z.string().url().optional().or(z.literal('')),
  age: z.number().min(25, 'Min age for candidates is 25'),
  gender: z.enum(['Male', 'Female', 'Other']),
  education: z.string().optional(),
  net_worth: z.string().optional(),
  criminal_cases: z.number().default(0),
  criminal_details: z.string().optional(),
  manifesto_summary: z.string().optional(),
  social_links: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    website: z.string().optional()
  }).optional(),
  electionId: z.string().min(1, 'Election link required'),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

export default function CandidateForm({ initialData, id }: { initialData?: any, id?: string }) {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: initialData || {
      name: '',
      partyId: '',
      constituencyId: '',
      gender: 'Male',
      age: 25,
      criminal_cases: 0,
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, cRes, eRes] = await Promise.all([
          adminGetParties(),
          adminGetConstituencies(),
          adminGetActiveElection().catch(() => ({ data: { data: [] } }))
        ]);
        setParties(pRes.data.data || []);
        setConstituencies(cRes.data.data || []);
        setActiveElections(Array.isArray(eRes.data) ? eRes.data : eRes.data.data || []);
      } catch (error) {
        console.error('Failed to load form dependencies', error);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (values: CandidateFormValues) => {
    try {
      await adminCreateCandidate({
         ...values,
         id: id // Pass current ID if editing
      });
      toast.success(id ? 'Candidate updated successfully' : 'Candidate nominated successfully');
      router.push('/candidates');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save candidate');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'legal', label: 'Financial & Legal', icon: Shield },
    { id: 'election', label: 'Campaign Details', icon: Award },
    { id: 'social', label: 'Social & Media', icon: Globe },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-8 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap
              ${activeTab === tab.id ? 'border-orange-500 text-orange-500 bg-amber-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-300'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-10">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                {...register('name')}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                placeholder="e.g. Narendra Modi"
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 px-1 uppercase">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Political Party</label>
              <select 
                onChange={(e) => {
                  const party = parties.find(p => p._id === e.target.value);
                  if (party) {
                    setValue('partyId', party._id);
                    setValue('party', party.name);
                  }
                }}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">Select Party</option>
                {parties.map(p => <option key={p._id} value={p._id} selected={watch('partyId') === p._id}>{p.name} ({p.abbreviation})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Constituency</label>
              <select 
                onChange={(e) => {
                  const consti = constituencies.find(c => c._id === e.target.value);
                  if (consti) {
                    setValue('constituencyId', consti._id);
                    setValue('constituency', consti.name);
                  }
                }}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">Select Constituency</option>
                {constituencies.map(c => <option key={c._id} value={c._id} selected={watch('constituencyId') === c._id}>{c.name} ({c.state})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                <input 
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                <select 
                  {...register('gender')}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Education Qualification</label>
              <input 
                {...register('education')}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                placeholder="e.g. M.A. in Political Science"
              />
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Declared Net Worth</label>
                <input 
                  {...register('net_worth')}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                  placeholder="e.g. ₹1.5 Cr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Criminal Cases</label>
                <input 
                  type="number"
                  {...register('criminal_cases', { valueAsNumber: true })}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Case Details (If any)</label>
              <textarea 
                {...register('criminal_details')}
                rows={4}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium resize-none"
                placeholder="Describe pending criminal cases according to EC guidelines..."
              />
            </div>
          </div>
        )}

        {activeTab === 'election' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Active Election Link</label>
              <select 
                {...register('electionId')}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">Select active election...</option>
                {activeElections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <p className="text-[10px] text-gray-400 font-bold px-1 italic">This candidate will be automatically added to the ballot for the selected election.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Manifesto Summary</label>
              <textarea 
                {...register('manifesto_summary')}
                rows={5}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium resize-none"
                placeholder="Briefly describe the candidate's vision and core promises..."
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
              <input 
                {...register('photo_url')}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Twitter (X) Profile</label>
              <input 
                {...register('social_links.twitter')}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Facebook Page</label>
              <input 
                {...register('social_links.facebook')}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </button>
          
          <div className="flex space-x-3">
            {activeTab !== 'social' ? (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="px-8 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all flex items-center active:scale-95 shadow-lg shadow-gray-900/10"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-3.5 bg-orange-500 text-white text-sm font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center active:scale-95 shadow-lg shadow-orange-500/20 uppercase tracking-widest"
              >
                <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Finalize Nomination'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
