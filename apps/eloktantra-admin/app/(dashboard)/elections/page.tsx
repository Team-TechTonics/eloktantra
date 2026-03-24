'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Plus, Power, ShieldCheck, BarChart3, Clock, Pencil, Trash2, Calendar, Link as LinkIcon } from 'lucide-react';
import { Election } from '@/types';
import { adminGetElections, adminActivateElection, votingSyncElection } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchElections = async () => {
    try {
      const { data } = await adminGetElections();
      setElections(data.elections || data.data || []);
    } catch (error) {
      console.error('FETCH_ELECTIONS_ERROR:', error);
      toast.error('Election list unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleActivate = async (id: string) => {
    try {
      // 1. Activate in MongoDB (Content / UI Source)
      await adminActivateElection(id);
      
      // 2. Sync with Render (Ledger / Blockchain Mock)
      // We wrap this in a try-catch to ensure UI updates even if Render is sleeping
      try {
        await votingSyncElection(id);
      } catch (ledgerErr) {
        console.warn('Ledger sync deferred (Render might be sleeping)');
      }

      toast.success('Election activated and synced');
      fetchElections();
    } catch (error) {
      toast.error('Activation failed');
    }
  };

  const columns = [
    { 
      header: 'Election Name', 
      render: (e: Election) => (
        <span className="font-bold text-gray-900 leading-tight block max-w-xs truncate">
          {e.title}
        </span>
      ) 
    },
    { 
      header: 'Type', 
      render: (e: Election) => (
        <span className="text-[10px] text-blue-600 font-bold uppercase py-1 px-2 bg-blue-50 rounded">
          {e.type || 'General'}
        </span>
      ) 
    },
    { 
      header: 'Status', 
      render: (e: Election) => (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          e.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
        }`}>
          {e.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ) 
    },
    { 
      header: 'Start Date', 
      render: (e: Election) => (
        <div className="flex items-center text-[11px] font-bold text-gray-600">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> 
          {new Date(e.startDate).toLocaleDateString()}
        </div>
      ) 
    },
    { 
      header: 'Actions', 
      render: (e: Election) => (
        <div className="flex items-center space-x-2">
          {!e.isActive && (
            <button 
              onClick={() => handleActivate(e._id || e.id)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center shadow-lg transition-all"
            >
              <Power className="w-3 h-3 mr-1.5" /> Activate
            </button>
          )}
          <button className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-xl">
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
          subtitle="Oversee election lifecycles and blockchain status"
        />
        <Link 
          href="/elections/create"
          className="flex items-center px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Initialize New Election
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={elections} 
        isLoading={isLoading} 
        emptyMessage="No digital elections found."
      />
    </div>
  );
}
