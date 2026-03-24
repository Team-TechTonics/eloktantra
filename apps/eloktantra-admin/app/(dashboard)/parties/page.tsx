'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Trash2, Edit2, Flag } from 'lucide-react';
import { Party } from '@/types';
import { adminGetParties, adminDeleteParty } from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Modal from '@/components/shared/Modal';
import PartyForm from '@/components/parties/PartyForm';


export default function PartiesPage() {
  const [parties, setParties] = useState<Party[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchParties = async () => {
    try {
      const { data } = await adminGetParties();
      // NestJS returns the array directly
      const list = Array.isArray(data) ? data : (data.data || []);
      setParties(list);
    } catch (error) {
      toast.error('Failed to load national party records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await adminDeleteParty(isDeleting);
      toast.success('Party expunged from electoral record');
      fetchParties();
    } catch (error) {
      toast.error('Expunction failed');
    } finally {
      setIsDeleting(null);
    }
  };


  const columns = [
    { 
      header: 'Logo', 
      render: (p: Party) => (
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
          {p.logo_url ? (
            <img src={p.logo_url} alt={p.name} className="w-full h-full object-contain p-1" />
          ) : (
            <Flag className="w-5 h-5 text-gray-300" />
          )}
        </div>
      )
    },
    { header: 'Party Name', render: (p: Party) => <span className="font-bold text-gray-900">{p.name}</span> },
    { header: 'Abbr.', render: (p: Party) => <span className="text-xs font-black px-2 py-1 bg-gray-100 rounded-md text-gray-500 uppercase">{p.abbreviation}</span> },
    { header: 'Ideology', render: (p: Party) => p.ideology || 'N/A' },
    { header: 'Founded', render: (p: Party) => p.founded_year || 'N/A' },
    { 
      header: 'Actions', 
      render: (p: Party) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingParty(p)}
            className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDeleting(p.id || (p as any)._id)}
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
          title="Political Parties" 
          subtitle="Manage authorized political parties and their branding"
        />
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register Party
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={parties} 
        isLoading={isLoading} 
        emptyMessage="No parties registered yet. Start by adding a national or regional party."
      />

      <ConfirmDialog 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Party"
        message="Are you sure? This will permanently remove the party from the system. Candidates linked to this party will remain but without a party reference."
      />

      <Modal 
        isOpen={isAddModalOpen || !!editingParty} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingParty(null);
        }}
        title={editingParty ? "Edit Party" : "Register New Party"}
      >
        <PartyForm 
          initialData={editingParty}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setEditingParty(null);
            fetchParties();
          }} 
        />
      </Modal>
    </div>
  );
}
