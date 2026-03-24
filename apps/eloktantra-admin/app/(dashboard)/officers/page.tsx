'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Trash2, Edit2, ShieldAlert, Monitor, Wifi, WifiOff } from 'lucide-react';
import { Officer } from '@/types';
import backendAPI from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Modal from '@/components/shared/Modal';
import OfficerForm from '@/components/officers/OfficerForm';

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchOfficers = async () => {
    try {
      const { data } = await backendAPI.get('/api/admin/officer'); // Unified route
      setOfficers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to load booth officers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await backendAPI.delete(`/api/admin/officer?id=${isDeleting}`);
      toast.success('Officer access revoked');
      fetchOfficers();
    } catch (error) {
      toast.error('Failed to remove officer');
    } finally {
      setIsDeleting(null);
    }
  };

  const columns = [
    { 
      header: 'Officer', 
      render: (o: Officer) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-bold text-gray-900">{o.name}</span>
        </div>
      )
    },
    { header: 'Booth ID', render: (o: Officer) => <span className="font-mono text-xs font-black px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase">{o.booth_id}</span> },
    { header: 'Device ID', render: (o: Officer) => <span className="font-mono text-[10px] text-gray-400">{o.device_id}</span> },
    { 
      header: 'Status', 
      render: (o: Officer) => (
        <div className="flex items-center">
          {o.status === 'Online' ? (
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <Wifi className="w-3 h-3 mr-1.5" /> Online
            </span>
          ) : (
            <span className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
              <WifiOff className="w-3 h-3 mr-1.5" /> Offline
            </span>
          )}
        </div>
      ) 
    },
    { 
      header: 'Actions', 
      render: (o: Officer) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => setEditingOfficer(o)}
            className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDeleting(o._id)}
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
          title="Booth Officers" 
          subtitle="Manage verified personnel and device authorizations for regional centers"
        />
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Onboard Officer
        </button>
      </div>

      <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="font-black text-red-900 text-sm uppercase tracking-tight">Security Protocol Required</h4>
            <p className="text-xs text-red-700/80 leading-relaxed font-medium mt-0.5">
              Only authorized devices with matching Device IDs can access the officer dashboard. 
              Revoke access immediately if an officer reports a compromised terminal.
            </p>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={officers} 
        isLoading={isLoading} 
        emptyMessage="No booth officers onboarded yet."
      />

      <ConfirmDialog 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="Revoke Access"
        message="Are you sure? This officer will immediately lose access to the booth terminal. You will need to re-onboard them to restore access."
      />

      <Modal 
        isOpen={isAddModalOpen || !!editingOfficer} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingOfficer(null);
        }}
        title={editingOfficer ? "Edit Officer" : "Onboard New Officer"}
      >
        <OfficerForm 
          initialData={editingOfficer}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setEditingOfficer(null);
            fetchOfficers();
          }} 
        />
      </Modal>
    </div>
  );
}
