'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Power, ShieldCheck, Clock, Plus } from 'lucide-react';
import { Election } from '@/types';
import { adminGetElections, adminActivateElection, votingSyncElection } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchElections = async () => {
    try {
      const { data } = await adminGetElections();
      // NestJS returns the array directly or in a .data property
      const electionList = Array.isArray(data) ? data : (data.elections || data.data || []);
      setElections(electionList);
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
      await adminActivateElection(id);
      try {
        await votingSyncElection(id);
      } catch (ledgerErr) {
        console.warn('Ledger sync deferred');
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
          {e.name || e.title}
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
      render: (e: Election) => {
        const isActive = e.is_active !== undefined ? e.is_active : e.isActive;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
          }`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        );
      } 
    },
    { 
      header: 'Start Date', 
      render: (e: Election) => (
        <div className="flex items-center text-[11px] font-bold text-gray-600">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> 
          {new Date(e.start_time || e.startDate || '').toLocaleDateString()}
        </div>
      ) 
    },
    { 
      header: 'Actions', 
      render: (e: Election) => (
        <div className="flex items-center space-x-2">
          {!(e.is_active || e.isActive) && (
            <button 
              onClick={() => handleActivate(e.id || e._id || '')}
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
