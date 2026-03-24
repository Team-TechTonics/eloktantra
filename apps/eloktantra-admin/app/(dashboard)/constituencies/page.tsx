'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Trash2, Edit2, Map } from 'lucide-react';
import { Constituency } from '@/types';
import { adminGetConstituencies } from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Modal from '@/components/shared/Modal';
import ConstituencyForm from '@/components/constituencies/ConstituencyForm';

export default function ConstituenciesPage() {
  const [constituencies, setConstituencies] = useState<Constituency[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingConstituency, setEditingConstituency] = useState<Constituency | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchConstituencies = async () => {
    try {
      const { data } = await adminGetConstituencies();
      // NestJS returns the array directly
      const list = Array.isArray(data) ? data : (data.data || []);
      setConstituencies(list);
    } catch (error) {
      toast.error('Failed to load constituency boundaries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConstituencies();
  }, []);

  const handleDelete = async () => {
    if (!isDeleting) return;
    toast.error('Deletion restricted in secure ledger mode');
    setIsDeleting(null);
  };

  const columns = [
    { 
      header: 'ID', 
      render: (c: any) => <span className="font-bold text-amber-600">#{c.id?.slice(0, 8) || 'N/A'}</span> 
    },
    { 
      header: 'Name', 
      render: (c: any) => <span className="font-bold text-gray-900">{c.name}</span> 
    },
    { 
      header: 'State', 
      render: (c: any) => c.state || 'National' 
    },
    { 
      header: 'Type', 
      render: (c: any) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
          c.type === 'General' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
        }`}>
          {c.type || 'General'}
        </span>
      ) 
    },
    { 
      header: 'Voters', 
      render: (c: any) => c.total_voters?.toLocaleString() || '0' 
    },
    { 
      header: 'Actions', 
      render: (c: any) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingConstituency(c)}
            className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
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
          title="Constituencies" 
          subtitle="Manage electoral boundaries and voter demographics in the ledger"
        />
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Constituency
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={constituencies} 
        isLoading={isLoading} 
        emptyMessage="No constituencies found in the digital ledger."
      />

      <ConfirmDialog 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Constituency"
        message="This will remove the constituency from the record. Proceed?"
      />
      
      <Modal 
        isOpen={isAddModalOpen || !!editingConstituency} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingConstituency(null);
        }}
        title={editingConstituency ? "Edit Constituency" : "Create Constituency"}
      >
        <ConstituencyForm 
          initialData={editingConstituency}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setEditingConstituency(null);
            fetchConstituencies();
          }} 
        />
      </Modal>
    </div>
  );
}
