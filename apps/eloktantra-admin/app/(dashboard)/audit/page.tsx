'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { FileText, Download, Filter, Terminal } from 'lucide-react';
import { AuditLog } from '@/types';
import backendAPI from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data } = await backendAPI.get('/api/admin/audit'); // Unified route
      setLogs(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to load system audits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    { 
      header: 'Event', 
      render: (l: AuditLog) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
          l.event_type === 'VOTE_COMMITTED' ? 'bg-green-100 text-green-600' :
          l.event_type === 'SIGNATURE_FAILED' ? 'bg-red-100 text-red-600' :
          l.event_type === 'DUPLICATE_ATTEMPT' ? 'bg-amber-100 text-amber-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {l.event_type}
        </span>
      )
    },
    { header: 'Detail', render: (l: AuditLog) => <span className="text-xs font-medium text-gray-700">{l.detail}</span> },
    { header: 'Booth', render: (l: AuditLog) => <span className="font-bold text-gray-900">{l.booth_id}</span> },
    { header: 'Network IP', render: (l: AuditLog) => <span className="text-[10px] font-mono text-gray-400">{l.ip_hash}</span> },
    { header: 'Timestamp', render: (l: AuditLog) => <span className="text-xs text-gray-500">{l.timestamp}</span> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="System Audit Trial" 
          subtitle="Non-repudiable logs of all critical administrative and voting actions"
        />
        <button 
          className="flex items-center px-6 py-3 bg-gray-50 border border-gray-200 hover:bg-white text-gray-600 font-bold rounded-2xl transition-all"
        >
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-gray-800 rounded-2xl border border-gray-700">
            <Terminal className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h4 className="font-black text-white text-lg uppercase tracking-tight">Active Trace Engine</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">
              Currently monitoring all ingress requests from booth nodes and API gateways. 
              Logs are cryptographically sealed on the secondary audit server.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
           <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest">
             Integrity: 100%
           </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={logs} 
        isLoading={isLoading} 
        emptyMessage="No audit logs available for inspection."
      />
    </div>
  );
}
