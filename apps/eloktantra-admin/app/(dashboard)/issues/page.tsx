'use client';

import { useState, useEffect } from 'react';
import { adminGetElections, adminGetConstituencies, adminCreateIssue, adminGetIssues } from '@/lib/api';
import { AlertCircle, Plus, Search, Vote, Target, Check, Trash2, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import backendAPI from '@/lib/api';

export default function IssuesAdmin() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'Voter Concerns',
    impactLevel: 'High'
  });

  const fetchElections = async () => {
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

  const fetchIssues = async () => {
    try {
      const res = await adminGetIssues();
      const list = Array.isArray(res.data) ? res.data : (res.data.issues || res.data.data || []);
      setIssues(list);
    } catch (err) {
      toast.error('Failed to sync issues ledger');
    }
  };

  useEffect(() => {
    fetchElections();
    fetchIssues();
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
      } catch (err) {
        toast.error('Failed to load regions');
      }
    };
    fetchCons();
  }, [selectedElection]);

  const handleAddIssue = async () => {
    if (!selectedElection || !selectedConstituency || !newIssue.title || !newIssue.description) {
      toast.error('All fields including election and constituency are required');
      return;
    }

    try {
      await adminCreateIssue({
        ...newIssue,
        electionId: selectedElection,
        constituencyId: selectedConstituency
      });
      toast.success('Regional Issue Reported Successfully');
      setNewIssue({ title: '', description: '', category: 'Voter Concerns', impactLevel: 'High' });
      fetchIssues();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDeleteIssue = async (id: string) => {
    try {
        await backendAPI.delete(`/api/admin/issue?id=${id}`);
        toast.success('Issue entry purged');
        fetchIssues();
    } catch (error) {
        toast.error('Failed to remove issue');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-black uppercase tracking-widest text-[10px] mb-2">
            <AlertCircle className="w-3 h-3" />
            <span>Digital Red Flag Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            National <span className="text-orange-500">Issues</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-lg font-bold uppercase tracking-wider">
            Define local concerns and state-level problems to be addressed by candidates within the electoral hierarchy.
          </p>
        </div>
        <div className="flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                Active Issues: {issues.length}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configuration Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 space-y-6 shadow-2xl">
            <h3 className="text-xl font-black tracking-tight uppercase border-b border-white/5 pb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                Define New Issue
            </h3>
            
            <div className="space-y-4">
              {/* Hierarchical Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Election Cycle</label>
                <select 
                    value={selectedElection}
                    onChange={(e) => setSelectedElection(e.target.value)}
                    className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-orange-500 outline-none transition-all"
                >
                    <option value="">Select Election</option>
                    {elections.map(el => <option key={el.id || el._id} value={el.id || el._id}>{el.title || el.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Region</label>
                <select 
                    value={selectedConstituency}
                    disabled={!selectedElection}
                    onChange={(e) => setSelectedConstituency(e.target.value)}
                    className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-orange-500 outline-none disabled:opacity-30 transition-all"
                >
                    <option value="">Select Constituency</option>
                    {constituencies.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Data Fields */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Issue Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Clean Drinking Water Access"
                  className="w-full h-14 bg-black border-2 border-white/10 rounded-2xl px-4 font-bold text-sm focus:border-orange-500 outline-none"
                  value={newIssue.title}
                  onChange={e => setNewIssue({...newIssue, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Analytics Description</label>
                <textarea 
                  rows={4}
                  placeholder="Describe the problem scope..."
                  className="w-full p-4 bg-black border-2 border-white/10 rounded-2xl font-bold text-sm focus:border-orange-500 outline-none resize-none"
                  value={newIssue.description}
                  onChange={e => setNewIssue({...newIssue, description: e.target.value})}
                />
              </div>

              <button 
                onClick={handleAddIssue}
                className="w-full h-16 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? 'SYNCING...' : <><Plus className="w-5 h-5" /> Register Issue</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Stream of Issues */}
        <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issues.length === 0 ? (
                    <div className="col-span-full h-64 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 grayscale opacity-50">
                         <Search className="w-10 h-10 mb-4 text-gray-600" />
                         <p className="font-black uppercase tracking-widest text-[10px] text-gray-500">Registry Is Empty</p>
                    </div>
                ) : (
                    issues.map((issue) => (
                        <div key={issue.id || (issue as any)._id} className="p-6 rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 hover:border-orange-500/30 transition-all group">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-orange-500/10 transition-colors">
                                    <Tag className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <button 
                                    onClick={() => handleDeleteIssue(issue.id || (issue as any)._id)}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                             <h4 className="font-black text-white text-lg leading-tight mb-2">{issue.title}</h4>
                             <p className="text-gray-500 text-xs font-medium line-clamp-3 mb-4 leading-relaxed">{issue.description}</p>
                             
                             <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Impact: {issue.reportedCount || 0}
                                </div>
                                <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">
                                    {issue.constituencyId}
                                </div>
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
