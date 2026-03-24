'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { Upload, X, Save, AlertTriangle, Layers, MapPin, Loader2 } from 'lucide-react';
import { contentAPI as backendAPI, adminGetElections, adminGetConstituencies } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterVoterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [payload, setPayload] = useState('');

  useEffect(() => {
    const loadElections = async () => {
      try {
        const { data } = await adminGetElections();
        setElections(data.elections || []);
      } catch (error) {
        toast.error('Failed to load election cycles');
      }
    };
    loadElections();
  }, []);

  useEffect(() => {
    if (!selectedElection) {
      setConstituencies([]);
      return;
    }
    const loadConstituencies = async () => {
      try {
        const { data } = await adminGetConstituencies(selectedElection);
        setConstituencies(data.constituencies || []);
      } catch (error) {
        toast.error('Failed to load regions');
      }
    };
    loadConstituencies();
  }, [selectedElection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElection || !selectedConstituency || !payload) {
      toast.error('Election, Constituency and Data required');
      return;
    }

    setIsSubmitting(true);
    try {
      const voters = JSON.parse(payload);
      
      // Bulk enrollment with Election Scoping
      await backendAPI.post('/api/admin/electoral-roll', {
        electionId: selectedElection,
        voters: Array.isArray(voters) ? voters.map(v => ({...v, constituencyId: selectedConstituency})) : [{...voters, constituencyId: selectedConstituency}]
      });

      toast.success('National citizen ledger updated');
      router.push('/voters');
    } catch (error: any) {
      toast.error(error.message || 'Enrollment failed. Verify JSON structure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader 
        title="Citizen Enrollment" 
        subtitle="Step 2: Scoped registration of voters into the national electoral ledger"
      />

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-8">
        
        {/* Selection Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Election Cycle
            </label>
            <select 
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-4 font-bold text-sm focus:border-orange-500 outline-none transition-all"
            >
              <option value="">Select Target Election</option>
              {elections?.map(el => (
                <option key={el._id || el.id} value={el._id || el.id}>
                  {el.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Target Constituency
            </label>
            <select 
              disabled={!selectedElection}
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-4 font-bold text-sm focus:border-orange-500 outline-none transition-all disabled:opacity-50"
            >
              <option value="">Select Region</option>
              {constituencies?.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl flex items-start space-x-3 border border-orange-100">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <p className="text-[11px] text-orange-800 font-bold uppercase tracking-wide leading-relaxed">
            CRITICAL: Enrollment requires pre-scrubbed JSON data. Voters will be linked specifically to the selected Election and Region code. 
            Cryptographic SOL tokens will be auto-generated for one-time ballot access.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Citizen Registry (JSON)</label>
            <span className="text-[9px] font-bold text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded">Election-Scoped Batch</span>
          </div>
          
          <div className="relative group">
            <textarea 
              required
              rows={10}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full px-8 py-8 bg-gray-900 border-2 border-transparent rounded-[2rem] focus:border-orange-500/30 outline-none transition-all font-mono text-sm text-orange-400 placeholder:text-gray-700 resize-none shadow-2xl"
              placeholder={`[
  { "name": "Rajesh Kumar", "phone": "9876543210", "voterId": "IND-12345678" }
]`}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-gray-50">
           <button 
             type="button" 
             onClick={() => router.back()}
             className="px-8 py-3.5 font-bold text-gray-400 hover:text-gray-900 transition-all flex items-center uppercase tracking-widest text-[10px]"
           >
             <X className="w-4 h-4 mr-2" /> Discard
           </button>
           <button 
             type="submit" 
             disabled={isSubmitting}
             className="px-12 py-4 bg-orange-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center"
           >
             {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" /> Commit to Ledger</>}
           </button>
        </div>
      </form>
    </div>
  );
}
