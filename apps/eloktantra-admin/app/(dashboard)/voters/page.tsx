'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { UserCheck, Upload, Search, ShieldCheck, Plus } from 'lucide-react';
import { Voter } from '@/types';
import axios from 'axios';
import backendAPI, { adminGetElections } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchVoters = async () => {
    if (!selectedElection) return;
    setIsLoading(true);
    try {
      const { data } = await backendAPI.get(`/api/admin/electoral-roll?electionId=${selectedElection}`);
      setVoters(data.voters || []);
    } catch (error) {
      toast.error('Voter Registry currently unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchVoters();
  }, [selectedElection]);

  const columns = [
    { 
      header: 'Voter ID', 
      render: (v: Voter) => (
        <div className="flex items-center font-mono text-[11px] text-gray-900">
          <span className="bg-orange-500/10 text-orange-600 px-2 py-1 rounded-md mr-2">IND</span>
          {v.voterId}
        </div>
      )
    },
    { header: 'Constituency ID', render: (v: Voter) => <span className="font-bold text-gray-900">{v.constituencyId || 'Global'}</span> },
    { 
      header: 'Status', 
      render: (v: Voter) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
          v.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {v.isActive ? 'Active' : 'Revoked'}
        </span>
      ) 
    },
    { header: 'Ledger Token', render: (v: Voter) => (
       v.solToken ? (
         <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 italic">
           {v.solToken.substring(0, 15)}...
         </span>
       ) : (
         <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded tracking-tighter">Unlinked</span>
       )
    ) },
    { header: 'Enrollment', render: (v: Voter) => <span className="text-xs text-gray-500">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'}</span> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="Voter Registry" 
          subtitle="Verified citizens authorized for digital ballot access"
        />
        <div className="flex space-x-3 items-center">
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
            <Link 
              href="/voters/register"
              className="flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Enroll
            </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">Privacy Shield Active</h4>
            <p className="text-xs text-blue-700/80 leading-relaxed font-medium mt-0.5">
              Personal Identifiable Information (PII) is encrypted. Administrators only see cryptographic hashes.
            </p>
          </div>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest ring-4 ring-blue-50">
          Total: {voters?.length || 0} Citizens
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={voters} 
        isLoading={isLoading} 
        emptyMessage="Voter registry is currently empty for this election."
      />
    </div>
  );
}
