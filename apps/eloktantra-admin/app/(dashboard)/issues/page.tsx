'use client';

import { useState, useEffect } from 'react';
import { adminGetElections, adminGetConstituencies, adminCreateIssue, adminGetIssues } from '@/lib/api';
import { AlertCircle, Plus, Search, Vote, Target, Check, Trash2, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import backendAPI from '@/lib/api';

export default function IssuesAdmin() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');

  const fetchInitialData = async () => {
    try {
        const res = await adminGetElections();
        setElections(Array.isArray(res.data) ? res.data : (res.data.elections || res.data.data || []));
    } catch (err) {
        toast.error('Source of truth offline');
    }
  };

  const fetchIssues = async () => {
    if (!selectedElection || !selectedConstituency) {
        setIssues([]);
        return;
    }
    setLoading(true);
    try {
      const res = await backendAPI.get(`/api/admin/issue?electionId=${selectedElection}&constituencyId=${selectedConstituency}`);
      const list = Array.isArray(res.data) ? res.data : (res.data.issues || res.data.data || []);
      setIssues(list);
    } catch (err) {
      toast.error('Failed to sync issues ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      const fetchCons = async () => {
        try {
          const res = await adminGetConstituencies(selectedElection);
          // Standardize response extraction for Render/Local
          const list = Array.isArray(res.data) 
            ? res.data 
            : (res.data.constituencies || res.data.data || res.data.list || []);
            
          setConstituencies(list);
          setSelectedConstituency('');
        } catch (err) {
          toast.error('Failed to load regions');
        }
      };
      fetchCons();
    } else {
        setConstituencies([]);
    }
  }, [selectedElection]);

  useEffect(() => {
    fetchIssues();
  }, [selectedElection, selectedConstituency]);

  const handleDeleteIssue = async (id: string) => {
    try {
        await backendAPI.delete(`/api/admin/issue?id=${id}`);
        toast.success('Issue entry purged');
        fetchIssues();
    } catch (error) {
        toast.error('Failed to remove issue');
    }
  }

  const handleResolveIssue = async (id: string) => {
    try {
        await backendAPI.patch(`/api/admin/issue/${id}/status`); // Controller defaults to toggle or fixed update
        toast.success('Issue marked as Resolved');
        fetchIssues();
    } catch (error) {
        toast.error('Failed to update status');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-orange-600 font-black uppercase tracking-widest text-[10px] mb-2">
            <AlertCircle className="w-3 h-3" />
            <span>Digital Moderation Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">
            Citizen <span className="text-orange-500">Grievances</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-lg font-bold uppercase tracking-wider">
            Review and moderate problems reported by verified voters from the user portal.
          </p>
        </div>
        <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                Scoped Reports: {issues.length}
            </div>
        </div>
      </div>

      {/* Selection Hierarchy Bar */}
      <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block text-left">Active Election</label>
            <select 
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 text-sm focus:border-orange-500 outline-none transition-all"
            >
                <option value="">Select Election Cycle</option>
                {elections.map(el => <option key={el.id || el._id} value={el.id || el._id}>{el.title}</option>)}
            </select>
        </div>
        <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block text-left">Target Region</label>
            <select 
                value={selectedConstituency}
                disabled={!selectedElection}
                onChange={(e) => setSelectedConstituency(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-900 text-sm focus:border-orange-500 outline-none disabled:opacity-30 transition-all"
            >
                <option value="">Select Constituency</option>
                {constituencies.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
            </select>
        </div>
      </div>

      <div className="w-full">
        {/* Right: Live Stream of Issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.length === 0 ? (
                <div className="col-span-full h-64 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 grayscale opacity-50 bg-white">
                        <Search className="w-10 h-10 mb-4 text-gray-300" />
                        <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">Registry Is Empty</p>
                </div>
            ) : (
                issues.map((issue) => (
                    <div key={issue.id || (issue as any)._id} className={`p-8 rounded-[2.5rem] bg-white border transition-all group shadow-sm hover:shadow-xl shadow-gray-200/50 ${issue.status === 'RESOLVED' ? 'border-emerald-500/20' : 'border-gray-100 hover:border-orange-500/30'}`}>
                            <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl transition-colors ${issue.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-50 text-gray-400 group-hover:bg-orange-500/10 group-hover:text-orange-500'}`}>
                                {issue.status === 'RESOLVED' ? <Check className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                            </div>
                            <div className="flex gap-2">
                                {issue.status !== 'RESOLVED' && (
                                    <button 
                                        onClick={() => handleResolveIssue(issue.id || (issue as any)._id)}
                                        className="p-2 bg-emerald-50/50 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                                        title="Mark Resolved"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDeleteIssue(issue.id || (issue as any)._id)}
                                    className="p-2 opacity-10 group-hover:opacity-100 bg-red-50/50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                    title="Delete Entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <h4 className="font-black text-gray-900 text-xl leading-tight">{issue.title}</h4>
                                <div className="flex gap-2">
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter bg-gray-50 px-2 py-0.5 rounded">
                                        ID: {(issue.id || (issue as any)._id).slice(-6).toUpperCase()}
                                    </span>
                                    {issue.status === 'RESOLVED' && (
                                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded">
                                            RESOLVED
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-500 text-sm font-medium line-clamp-4 mb-6 leading-relaxed italic">
                                "{issue.description}"
                            </p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Election Cycle</span>
                                <span className="text-[10px] font-black text-gray-900 truncate max-w-[120px] uppercase">{issue.electionId}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Region</span>
                                <span className="text-[10px] font-black text-orange-500 uppercase">{issue.constituencyId}</span>
                            </div>
                            </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
