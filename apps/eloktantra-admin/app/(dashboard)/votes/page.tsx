'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Activity, RefreshCw, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Vote } from '@/types';
import backendAPI, { adminGetElections } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VotesMonitorPage() {
  const [votes, setVotes] = useState<Vote[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, committed: 0, failed: 0 });
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');

  const fetchInitialData = async () => {
    try {
      const { data } = await adminGetElections();
      const list = data.elections || [];
      setElections(list);
      if (list.length > 0) {
        setSelectedElection(list[0]._id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load elections');
      setIsLoading(false);
    }
  };

  const fetchVotes = async () => {
    if (!selectedElection) return;
    try {
      const { data } = await backendAPI.get(`/api/admin/vote?electionId=${selectedElection}`); // Unified Route
      const list = Array.isArray(data) ? data : data.data || [];
      setVotes(list);
      
      setStats({
        total: list.length,
        pending: list.filter((v: any) => v.status === 'PENDING').length,
        committed: list.filter((v: any) => v.status === 'COMMITTED').length,
        failed: list.filter((v: any) => v.status === 'FAILED').length,
      });
    } catch (error) {
      console.error('Failed to sync with voting engine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, 10000);
    return () => clearInterval(interval);
  }, [selectedElection]);

  const columns = [
    { 
      header: 'Ballot Hash', 
      render: (v: Vote) => <span className="font-mono text-[10px] text-gray-400">{v.vote_hash.substring(0, 20)}...</span> 
    },
    { header: 'Booth', render: (v: Vote) => <span className="font-bold text-gray-700">{v.booth_id}</span> },
    { 
      header: 'Status', 
      render: (v: Vote) => (
        <div className="flex items-center">
          {v.status === 'PENDING' ? (
             <div className="flex items-center bg-amber-50 text-amber-600 px-2 py-1 rounded-md animate-pulse">
               <RefreshCw className="w-3 h-3 mr-1.5 animate-spin-slow" />
               <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
             </div>
          ) : v.status === 'COMMITTED' ? (
            <div className="flex items-center bg-green-50 text-green-600 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Committed</span>
            </div>
          ) : (
            <div className="flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-md">
              <AlertCircle className="w-3 h-3 mr-1.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Failed</span>
            </div>
          )}
        </div>
      ) 
    },
    { 
      header: 'Blockchain TX', 
      render: (v: Vote) => v.tx_hash ? (
        <a href={`https://etherscan.io/tx/${v.tx_hash}`} target="_blank" className="text-[10px] text-blue-500 font-bold hover:underline flex items-center">
          {v.tx_hash.substring(0, 10)}... <ExternalLink className="w-2 h-2 ml-1" />
        </a>
      ) : <span className="text-gray-300">---</span>
    },
    { header: 'Timestamp', render: (v: Vote) => <span className="text-xs text-gray-400 font-medium">{v.submitted_at}</span> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="Vote Stream Monitor" 
          subtitle="High-fidelity tracking of cryptographic ballots across the network"
        />
        <div className="flex space-x-2 items-center">
            <select 
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
            >
              <option value="">Select Election</option>
              {elections.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
            <button 
             onClick={fetchVotes}
             className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-amber-500 rounded-2xl transition-all shadow-sm"
            >
             <RefreshCw className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Logs</h3>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-amber-500 border-l-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-amber-500">In Sync</h3>
          <p className="text-3xl font-black text-amber-500">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-green-500 border-l-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-green-500">Finalized</h3>
          <p className="text-3xl font-black text-green-500">{stats.committed}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-red-500 border-l-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-red-500">Rejected</h3>
          <p className="text-3xl font-black text-red-500">{stats.failed}</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={votes} 
        isLoading={isLoading} 
        emptyMessage="No voting activity detected in the current stream."
      />
    </div>
  );
}
