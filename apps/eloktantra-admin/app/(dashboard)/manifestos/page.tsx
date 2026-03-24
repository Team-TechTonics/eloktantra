'use client';

import { useState, useEffect } from 'react';
import { adminGetElections, adminGetConstituencies, adminGetCandidates, adminCreateManifesto, adminGetManifestos } from '@/lib/api';
import { FileText, Plus, Search, Vote, Target, ShieldCheck, User, Trash2, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import backendAPI from '@/lib/api';

export default function ManifestosAdmin() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [manifestos, setManifestos] = useState<any[]>([]);
  
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);

  const [newManifesto, setNewManifesto] = useState({
    title: '',
    content: '',
    priorities: ['', ''],
  });

  const fetchInitialData = async () => {
    try {
      const res = await adminGetElections();
      const list = Array.isArray(res.data) ? res.data : (res.data.elections || res.data.data || []);
      setElections(list);
    } catch (err) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const fetchManifestos = async () => {
    try {
      const res = await adminGetManifestos();
      const list = Array.isArray(res.data) ? res.data : (res.data.manifestos || res.data.data || []);
      setManifestos(list);
    } catch (err) {
       console.error('Failed to sync manifesto ledger');
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchManifestos();
  }, []);

  useEffect(() => {
    if (!selectedElection) {
        setConstituencies([]);
        return;
    };
    const fetchCons = async () => {
      try {
        const res = await adminGetConstituencies(selectedElection);
        const list = Array.isArray(res.data) ? res.data : (res.data.constituencies || res.data.data || []);
        setConstituencies(list);
        setSelectedConstituency('');
        setCandidates([]);
        setSelectedCandidate('');
      } catch (err) {
        toast.error('Failed to load regions');
      }
    };
    fetchCons();
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedConstituency) {
        setCandidates([]);
        return;
    };
    const fetchCans = async () => {
      try {
        const res = await adminGetCandidates({ electionId: selectedElection, constituencyId: selectedConstituency });
        const list = Array.isArray(res.data) ? res.data : (res.data.candidates || res.data.data || []);
        setCandidates(list);
        setSelectedCandidate('');
      } catch (err) {
        toast.error('Failed to load candidates');
      }
    };
    fetchCans();
  }, [selectedConstituency]);

  const handleCreateManifesto = async () => {
    if (!selectedCandidate || !selectedElection || !newManifesto.title || !newManifesto.content) {
      toast.error('Selection and data fields are mandatory');
      return;
    }

    setLoading(true);
    try {
      await adminCreateManifesto({
        ...newManifesto,
        candidateId: selectedCandidate,
        electionId: selectedElection,
        constituencyId: selectedConstituency
      });
      toast.success('Digital Manifesto Deployed and Verified');
      setNewManifesto({ title: '', content: '', priorities: ['', ''] });
      fetchManifestos();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteManifesto = async (id: string) => {
    try {
        await backendAPI.delete(`/api/admin/manifesto?id=${id}`);
        toast.success('Manifesto entry purged from ledger');
        fetchManifestos();
    } catch (error) {
        toast.error('Failed to remove manifesto');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-[10px] mb-2">
            <FileText className="w-3 h-3" />
            <span>Policy Platform Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Candidate <span className="text-emerald-500">Manifestos</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-lg font-bold uppercase tracking-wider">
            Curate and upload the official digital platform for candidates. Linked to the hierarchical ledger.
          </p>
        </div>
        <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                Blueprints Deployed: {manifestos.length}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configuration Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 space-y-6 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight uppercase border-b border-white/5 pb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Create Platform
            </h3>
            
            <div className="space-y-4">
              {/* Hierarchy Chain */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Election Chain</label>
                <select 
                    value={selectedElection}
                    onChange={(e) => setSelectedElection(e.target.value)}
                    className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-emerald-500 outline-none transition-all"
                >
                    <option value="">Select Election</option>
                    {elections.map(el => <option key={el.id || el._id} value={el.id || el._id}>{el.title || el.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Constituency Node</label>
                <select 
                    value={selectedConstituency}
                    disabled={!selectedElection}
                    onChange={(e) => setSelectedConstituency(e.target.value)}
                    className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-emerald-500 outline-none disabled:opacity-30 transition-all"
                >
                    <option value="">Select Constituency</option>
                    {constituencies.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Candidate</label>
                <select 
                    value={selectedCandidate}
                    disabled={!selectedConstituency}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-emerald-500 outline-none disabled:opacity-30 transition-all"
                >
                    <option value="">Select Candidate</option>
                    {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.party})</option>)}
                </select>
              </div>

              {/* Data Fields */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Manifesto Headline</label>
                <input 
                  type="text"
                  placeholder="e.g. Vision 2030 (Digital Revolution)"
                  className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-emerald-500 outline-none transition-all"
                  value={newManifesto.title}
                  onChange={e => setNewManifesto({...newManifesto, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Content (EVM Compatible)</label>
                <textarea 
                  rows={4}
                  placeholder="Core platform details and ideology..."
                  className="w-full p-4 bg-black border-2 border-white/10 rounded-2xl font-bold text-sm focus:border-emerald-500 outline-none resize-none transition-all"
                  value={newManifesto.content}
                  onChange={e => setNewManifesto({...newManifesto, content: e.target.value})}
                />
              </div>

              <button 
                onClick={handleCreateManifesto}
                disabled={loading}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Deploy Manifesto</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Stream of manifestos */}
        <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manifestos.length === 0 ? (
                    <div className="col-span-full h-96 border-2 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-12 grayscale opacity-50">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Tag className="w-10 h-10 text-gray-700" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-500">No Manifestos Deployed</h3>
                        <p className="text-gray-600 font-black uppercase tracking-[0.2em] text-[10px] mt-2">Historical platforms will appear here once cryptographically verified.</p>
                    </div>
                ) : (
                    manifestos.map((m) => (
                        <div key={m.id || (m as any)._id} className="p-8 rounded-[3rem] bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-6">
                                <button 
                                    onClick={() => handleDeleteManifesto(m.id || (m as any)._id)}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                             
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                                    {m.candidateId?.photo_url ? (
                                        <img src={m.candidateId.photo_url} alt={m.candidateId.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-gray-700" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-lg leading-tight truncate max-w-[180px]">{m.candidateId?.name || 'Unknown Candidate'}</h4>
                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">{m.constituencyId?.name || 'Global'}</p>
                                </div>
                             </div>

                             <h3 className="text-xl font-black text-white mb-3 line-clamp-2">{m.title}</h3>
                             <p className="text-gray-500 text-sm font-medium line-clamp-4 leading-relaxed mb-6 italic">"{m.content}"</p>
                             
                             <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Verified Blueprint</span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-800 group-hover:text-emerald-500 transition-colors" />
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
