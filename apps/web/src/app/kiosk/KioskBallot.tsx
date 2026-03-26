import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function KioskBallot({
  electionId,
  constituencyId,
  onSelectCandidate
}: {
  electionId?: string,
  constituencyId?: string,
  onSelectCandidate: (candidateId: string) => void
}) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const queryParams = electionId ? `?electionId=${electionId}` : '';
        const res = await apiClient.get(`/candidates${queryParams}`);
        
        let list = res.data.candidates || res.data.data || res.data || [];
        // Strict mapping based on constituency ID check
        if (constituencyId) {
           list = list.filter((c: any) => 
               c.constituency === constituencyId || 
               c.constituencyId === constituencyId ||
               String(c.constituency).toLowerCase().trim() === String(constituencyId).toLowerCase().trim()
           );
        }
        setCandidates(list);
      } catch (err) {
        console.error('Failed to fetch candidates', err);
        // Fallback demo hardware candidates if no connection
        setCandidates([
          { id: '1', _id: '1', name: 'DEMO CANDIDATE 1', party: 'PARTY A' },
          { id: '2', _id: '2', name: 'DEMO CANDIDATE 2', party: 'PARTY B' },
          { id: '3', _id: '3', name: 'DEMO CANDIDATE 3', party: 'PARTY C' },
          { id: 'NOTA', _id: 'NOTA', name: 'NONE OF THE ABOVE', party: 'NOTA' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [electionId, constituencyId]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl text-blue-900 font-bold text-center animate-pulse">Loading Electronic Ballot...</div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 min-h-screen flex flex-col justify-center">
      <h2 className="text-6xl font-black text-blue-900 mb-12 text-center border-b-8 border-orange-500 pb-8 uppercase tracking-tight">
         Electronic Ballot Paper
      </h2>
      
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-300 overflow-hidden mb-12">
        {candidates.map((candidate, idx) => (
          <div key={candidate.id || candidate._id} className={`flex items-center justify-between p-10 border-b border-gray-200 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="w-40 h-40 bg-white rounded-full border-4 border-gray-200 overflow-hidden shadow-inner flex items-center justify-center mr-8 flex-shrink-0">
               <img 
                 src={`/party-symbols/${candidate.party.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`} 
                 alt={candidate.party}
                 className="max-w-[80%] max-h-[80%] object-contain"
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = '/party-symbols/placeholder.png'; // Fallback
                   (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
                 }}
               />
            </div>
            
            <div className="flex-1 border-r border-gray-300 pr-8">
              <h3 className="text-4xl font-extrabold text-gray-900 mb-3 uppercase">{candidate.name}</h3>
              <p className="text-3xl text-blue-800 font-bold uppercase">{candidate.party}</p>
            </div>
            
            <div className="ml-10">
              <button 
                onClick={() => onSelectCandidate(candidate.id || candidate._id)}
                className="w-56 h-32 bg-blue-700 hover:bg-blue-800 active:bg-orange-600 focus:bg-orange-500 text-white font-black text-4xl rounded-xl shadow-lg transition-colors flex items-center justify-center tracking-widest"
              >
                VOTE
              </button>
            </div>
          </div>
        ))}
        {candidates.length === 0 && (
          <div className="p-16 text-center text-3xl text-red-500 font-bold border-t border-gray-200">
             NO CANDIDATES REGISTERED FOR THIS CONSTITUENCY.
          </div>
        )}
      </div>
    </div>
  );
}
