'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Power, ShieldCheck, BarChart3, Clock, Pencil, Trash2, Calendar } from 'lucide-react';
import { Election } from '@/types';
import backendAPI from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchElections = async () => {
    try {
      const { data } = await backendAPI.get('/election');
      setElections(data.elections || data || []);
    } catch (error) {
      console.error('FETCH_ELECTIONS_ERROR:', error);
      toast.error('Election Ledger (NestJS) unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleActivate = async (id: string) => {
    try {
      await backendAPI.patch(`/voting/elections/${id}`, { status: 'ACTIVE' });
      toast.success('Election activated');
      fetchElections();
    } catch (error) {
      toast.error('Activation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await backendAPI.delete(`/election/${deleteId}`);
      toast.success('Election deleted successfully');
      setDeleteId(null);
      fetchElections();
    } catch (error: any) {
      console.error('DELETE_ELECTION_ERROR:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = [
    { 
      header: 'Election Name', 
      render: (e: Election) => (
        <span className="font-bold text-gray-900 leading-tight block max-w-xs truncate">
          {e.title || (e as any).name || 'Untitled Election'}
        </span>
      ) 
    },
    { 
      header: 'Region / Scope', 
      render: (e: Election) => (
        <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
          {e.constituency || 'National'}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      render: (e: Election) => (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          e.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 
          e.status === 'ENDED' || e.status === 'COMPLETED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
        }`}>
          {e.status || 'UPCOMING'}
        </span>
      ) 
    },
    { 
      header: 'Start Date', 
      render: (e: Election) => (
        <div className="flex items-center text-[11px] font-bold text-gray-600">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> 
          {e.start_date || (e as any).start_time?.split('T')[0] || 'N/A'}
        </div>
      ) 
    },
    { 
      header: 'End Date', 
      render: (e: Election) => (
        <div className="flex items-center text-[11px] font-bold text-gray-600">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary/50" /> 
          {e.end_date || (e as any).end_time?.split('T')[0] || 'N/A'}
        </div>
      ) 
    },
    { 
      header: 'Consensus', 
      render: (e: Election) => (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${e.contract_address ? 'bg-blue-500' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-xs font-black text-gray-700 uppercase tracking-tight">
              {e.contract_address ? 'Deployed' : 'In Queue'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 w-fit">
            {e.contract_address ? `${e.contract_address.slice(0, 6)}...${e.contract_address.slice(-4)}` : 'VOTING_ENGINE_PENDING'}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Metrics', 
      render: (e: Election) => (
        <div className="flex space-x-3">
          <div className="flex items-center text-[10px] font-black uppercase text-blue-500"><BarChart3 className="w-3 h-3 mr-1" /> {e.total_votes || 0} Votes</div>
        </div>
      ) 
    },
    { 
      header: 'Actions', 
      render: (e: Election) => (
        <div className="flex items-center space-x-2">
          {e.status !== 'ACTIVE' && (
            <button 
              onClick={() => handleActivate(e._id || e.id)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center shadow-lg shadow-green-600/10 transition-all hover:scale-105"
            >
              <Power className="w-3 h-3 mr-1.5" /> Activate
            </button>
          )}
          <button 
            onClick={() => setDeleteId(e._id || e.id)}
            className="p-2.5 hover:bg-red-50 text-red-600 rounded-xl transition-all hover:scale-110"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-xl transition-all hover:scale-110">
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="Digital Elections" 
          subtitle="Oversee election lifecycles and blockchain consensus layers"
        />
        <Link 
          href="/elections/create"
          className="flex items-center px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Initialize New Election
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={elections} 
        isLoading={isLoading} 
        emptyMessage="No digital elections found in the ledger."
      />

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Election"
        message="Are you sure you want to remove this election? This will delete all associated data from the local database. Blockchain records will remain immutable."
      />
    </div>
  );
}
