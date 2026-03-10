'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VotingPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const candidates = [
    { id: '1', name: 'Arvind Sharma', party: 'Independent' },
    { id: '2', name: 'Priya Verma', party: 'Socialist Party' },
    { id: '3', name: 'Rahul Gupta', party: 'National Party' },
    { id: '4', name: 'Sneha Reddy', party: 'Regional Front' },
  ];

  const handleVote = () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    // Blockchain voting logic would go here
    setTimeout(() => {
      setIsSubmitting(false);
      setHasVoted(true);
    }, 2000);
  };

  if (hasVoted) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto glass-card p-12 border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/20 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Vote Confirmed</h2>
            <p className="text-gray-400 font-bold mb-8 leading-relaxed">
              Your vote has been securely recorded on the blockchain. Transparency and anonymity are guaranteed.
            </p>
            <div className="p-4 bg-secondary/50 rounded-xl border border-white/5 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Vote Hash</p>
              <p className="text-xs font-mono text-primary break-all">0x7a2d...f3b9e1d2c3b4a5d6e7f8g9h0</p>
            </div>
            <div className="space-y-4">
              <Link href="/vote/verify" className="block w-full py-4 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20">
                Verify Vote Hash
              </Link>
              <Link href="/dashboard" className="block w-full py-4 glass-card border-white/10 text-gray-400 hover:text-white font-black uppercase tracking-widest rounded-xl transition-all">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Digital Ballot</h1>
          <p className="text-gray-400 font-medium text-lg">General Assembly 2024 • South Delhi</p>
        </header>

        <div className="glass-card p-8 md:p-12 border-white/5 space-y-8 shadow-2xl shadow-primary/5">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Select Candidate</h3>
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                    selectedCandidate === candidate.id
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
                    : 'bg-secondary/50 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border transition-all ${
                      selectedCandidate === candidate.id 
                      ? 'bg-white text-primary border-transparent' 
                      : 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20'
                    }`}>
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">
                        {candidate.name}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${
                        selectedCandidate === candidate.id ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {candidate.party}
                      </div>
                    </div>
                  </div>
                  {selectedCandidate === candidate.id && (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || isSubmitting}
              className="w-full py-5 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Securing Vote on Blockchain...' : 'Cast Anonymous Vote'}
            </button>
            <p className="text-[10px] text-gray-500 text-center font-black uppercase tracking-widest">
              By casting your vote, you agree to our blockchain-verified anonymous voting protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
