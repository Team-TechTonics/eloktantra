'use client';

import { useConstituencyCandidates } from '@/lib/api/candidates';
import Link from 'next/link';

export default function ConstituencyPage({ params }: { params: { id: string } }) {
  const { data: candidates, isLoading, isError } = useConstituencyCandidates(params.id);

  if (isLoading) return <div className="p-8 text-center text-gray-500 min-h-screen">Loading candidates for {params.id}...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 min-h-screen">Failed to load candidates for this constituency.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 sm:px-12">
      <header className="mb-12 max-w-5xl mx-auto border-b border-gray-200 pb-8">
        <Link href="/candidates" className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block">
          ← All Candidates
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          Constituency
          <span className="text-blue-600 bg-blue-100 px-4 py-1 rounded-full text-3xl font-bold">{params.id}</span>
        </h1>
        <p className="text-lg text-gray-600 mt-4 leading-relaxed max-w-2xl">
          Review all actively contesting candidates in this region. Transparency in local representation is vital for democracy.
        </p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates?.map((candidate) => (
          <Link href={`/candidates/${candidate.id}`} key={candidate.id} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {candidate.name}
                </h3>
                <span className="inline-flex mt-2 items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                  {candidate.party}
                </span>
                
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                  <div className={`px-2 py-1 rounded font-semibold ${candidate.criminal_cases > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    Cases: {candidate.criminal_cases}
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:block text-right">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Declared Net Worth</div>
                <div className="text-xl font-bold text-green-700">{candidate.net_worth || 'N/A'}</div>
                <div className="text-blue-600 mt-2 text-sm font-semibold group-hover:underline">View Profile →</div>
              </div>
            </div>
          </Link>
        ))}

        {candidates?.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-500">
            <h3 className="text-xl font-medium mb-2">No Candidates Found</h3>
            <p>We do not have any candidate records for the constituency &quot;{params.id}&quot; yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
