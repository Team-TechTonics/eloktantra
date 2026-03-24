'use client';

import { useEffect, useState } from 'react';

interface Promise {
  id: string;
  title: string;
  description: string;
  constituency: string;
  progress: number;
  status: string;
  deadline?: string;
  candidateId: { name: string; party: string } | string;
}

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  IN_PROGRESS: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  COMPLETED:   'bg-green-500/10 text-green-400 border-green-500/20',
  BROKEN:      'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PromisesPage() {
  const [promises, setPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/promises?${params}`)
      .then(r => r.json())
      .then(d => setPromises(d.promises || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const getCandidateName = (c: Promise['candidateId']) =>
    typeof c === 'object' && c !== null ? c.name : 'Unknown';
  const getCandidateParty = (c: Promise['candidateId']) =>
    typeof c === 'object' && c !== null ? c.party : '';

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black mb-2 orange-text-gradient uppercase tracking-tight">
          Promise Tracker
        </h1>
        <p className="text-muted font-medium text-base">
          Holding every candidate accountable — promise by promise.
        </p>
      </header>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {['', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BROKEN'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              statusFilter === s
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promises.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-muted font-bold">No promises found.</p>
          <p className="text-xs text-muted mt-2">Promises are added by the admin portal.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {promises.map(p => (
            <div key={p.id} className="glass-card p-6 md:p-8 hover:border-primary/20 transition-all group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-black group-hover:text-primary transition-colors mb-0.5">
                    {p.title}
                  </h2>
                  <p className="text-xs text-muted font-medium">
                    {getCandidateName(p.candidateId)}
                    {getCandidateParty(p.candidateId) && ` · ${getCandidateParty(p.candidateId)}`}
                    {p.constituency && ` · ${p.constituency}`}
                  </p>
                </div>
                <span className={`badge border shrink-0 ${STATUS_COLORS[p.status] || ''}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-5">{p.description}</p>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-muted">Progress</span>
                  <span className="text-primary">{p.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full orange-gradient rounded-full transition-all duration-1000"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              {p.deadline && (
                <p className="text-xs text-muted mt-3">
                  Deadline: {new Date(p.deadline).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
