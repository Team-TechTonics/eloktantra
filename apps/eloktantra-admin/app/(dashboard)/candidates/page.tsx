'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Trash2, Edit2, User, Search, Filter } from 'lucide-react';
import { Candidate } from '@/types';
import { adminGetCandidates } from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Link from 'next/link';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCandidates = async () => {
    try {
      const { data } = await adminGetCandidates({ electionId: undefined });
      // NestJS returns the array directly
      const candidateList = Array.isArray(data) ? data : (data.data || []);
      setCandidates(candidateList);
    } catch (error) {
      toast.error('Failed to load candidates from secure ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      // await adminDeleteCandidate(isDeleting);
      toast.error('Deletion restricted in secure ledger mode');
    } finally {
      setIsDeleting(null);
    }
  };

  const columns = [
    { 
      header: 'Profile', 
      render: (c: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden">
            {c.photo_url ? (
              <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900">{c.name}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">
              {c.gender || 'N/A'}, {c.age || '??'} yrs
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Party', 
      render: (c: any) => (
        <div className="flex items-center">
          <span className="font-bold text-gray-700">{c.party || 'Independent'}</span>
        </div>
      ) 
    },
    { 
      header: 'Election', 
      render: (c: any) => <span className="text-gray-600 font-medium">{c.electionName || 'National'}</span> 
    },
    { 
      header: 'Legal', 
      render: (c: any) => {
        const cases = c.criminal_cases ?? c.criminalCases ?? 0;
        return (
          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
            cases > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {cases} Cases
          </span>
        );
      } 
    },
    { 
      header: 'Net Worth', 
      render: (c: any) => <span className="font-medium text-gray-900">{c.net_worth || c.netWorth || 'N/A'}</span> 
    },
    { 
      header: 'Actions', 
      render: (c: any) => (
        <div className="flex space-x-2">
          <Link href={`/candidates/${c.id || c._id}`} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => setIsDeleting(c.id || c._id)}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="Candidates Management" 
          subtitle="Profiles synchronized with national digital ledger"
        />
        <Link 
          href="/candidates/add"
          className="flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nominate Candidate
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={candidates} 
        isLoading={isLoading} 
        emptyMessage="No candidates found in the ledger."
      />

      <ConfirmDialog 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Withdraw Nomination"
        message="This will restrict the candidate from the current election cycle. Proceed?"
      />
    </div>
  );
}
