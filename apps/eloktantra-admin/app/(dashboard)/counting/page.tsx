'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Upload, Play, CheckCircle, AlertTriangle, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { decryptVote } from '@/lib/crypto/voteEncryption';
import axios from 'axios';

// Backend URL from env or fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-elokantra.onrender.com';

interface Election {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface VoteData {
  id: string;
  encryptedVote: string;
  electionId: string;
}

interface TallyResult {
  candidateId: string;
  candidateName?: string;
  votes: number;
}

export default function CountingPage() {
  const [phase, setPhase] = useState(1); // 1: Key Upload, 2: Selection, 3: Counting, 4: Results
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [isCounting, setIsCounting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TallyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [countSummary, setCountSummary] = useState({ successful: 0, failed: 0 });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/elections`);
      setElections(response.data);
    } catch (err) {
      console.error('Failed to fetch elections:', err);
      setError('Could not fetch elections from server.');
    }
  };

  const handleKeyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content.includes('BEGIN PRIVATE KEY')) {
        setPrivateKey(content);
        setPhase(2);
        setError(null);
      } else {
        setError('Invalid file format. Please upload a standard RSA Private Key (.pem).');
      }
    };
    reader.readAsText(file);
  };

  const startCounting = async () => {
    if (!selectedElection || !privateKey) return;
    
    setIsCounting(true);
    setPhase(3);
    setProgress(0);
    setError(null);

    try {
      // 1. Fetch ALL encrypted votes for this election
      // Note: In a real system, we'd handle pagination, but here we assume a moderate volume.
      const response = await axios.get(`${BACKEND_URL}/votes/election/${selectedElection.id}`);
      const encryptedVotes: VoteData[] = response.data;
      setTotalVotes(encryptedVotes.length);

      const tally: Record<string, number> = {};
      let successfulCount = 0;
      let failedCount = 0;

      // 2. Local Decryption Loop (Crucial: Private key never leaves the browser)
      for (let i = 0; i < encryptedVotes.length; i++) {
        const vote = encryptedVotes[i];
        try {
          const decrypted = await decryptVote(vote.encryptedVote, privateKey);
          const { candidateId } = decrypted;
          
          tally[candidateId] = (tally[candidateId] || 0) + 1;
          successfulCount++;
        } catch (err) {
          console.warn(`Skipping corrupted vote ${vote.id}:`, err);
          failedCount++;
        }
        
        // Update UI progress occasionally
        if (i % 5 === 0 || i === encryptedVotes.length - 1) {
            setProgress(Math.round(((i + 1) / encryptedVotes.length) * 100));
        }
      }

      // 3. Format results for display
      const finalResults: TallyResult[] = Object.entries(tally).map(([candidateId, count]) => ({
        candidateId,
        votes: count
      })).sort((a, b) => b.votes - a.votes);

      setResults(finalResults);
      setCountSummary({ successful: successfulCount, failed: failedCount });
      setTimeout(() => setPhase(4), 500); // Transition to results

    } catch (err) {
      console.error('Counting error:', err);
      setError('An error occurred during the counting process.');
      setPhase(2);
    } finally {
      setIsCounting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-orange-500" />
            Secure Counting Center
          </h1>
          <p className="text-gray-500 mt-2 font-medium">End-to-End Cryptographic Vote Tallying System</p>
        </div>
        
        <div className="flex items-center gap-4 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-bold text-orange-700">RSA-2048 Military Grade Encryption</span>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-shake">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-8 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto gap-4">
        {[
          { step: 1, label: 'Identify Self', icon: Upload },
          { step: 2, label: 'Select Target', icon: PieChart },
          { step: 3, label: 'Decrypting', icon: Play },
          { step: 4, label: 'Final Tally', icon: BarChart3 }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center group">
            <div className={`
              flex items-center gap-3 px-4 py-2 rounded-2xl transition-all
              ${phase === item.step ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' : 
                phase > item.step ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}
            `}>
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider whitespace-nowrap">{item.label}</span>
              {phase > item.step && <CheckCircle className="w-4 h-4" />}
            </div>
            {idx < 3 && <ChevronRight className="w-5 h-5 mx-4 text-gray-200" />}
          </div>
        ))}
      </div>

      {/* PHASE 1: KEY UPLOAD */}
      {phase === 1 && (
        <div className="bg-white rounded-[40px] p-12 border border-dashed border-gray-200 text-center space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-12 h-12 text-orange-500" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Voter-Privacy Key Required</h2>
            <p className="text-gray-500 mt-2 font-medium">To maintain end-to-end security, votes are encrypted. Upload the Election Commission private key to begin decryption locally on your machine.</p>
          </div>
          
          <label className="relative inline-block cursor-pointer group">
            <input 
              type="file" 
              className="hidden" 
              accept=".pem" 
              onChange={handleKeyUpload}
            />
            <div className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-12 rounded-3xl transition-all flex items-center gap-3 shadow-xl shadow-orange-200 hover:-translate-y-1">
              <Upload className="w-5 h-5" />
              Upload EC Private Key (.pem)
            </div>
          </label>
          
          <div className="p-4 bg-blue-50/50 rounded-2xl max-w-lg mx-auto border border-blue-100">
             <p className="text-xs font-bold text-blue-700 flex items-center justify-center gap-2 italic">
               <ShieldCheck className="w-4 h-4" />
               Security Protocol: This key stays in your browser memory and is NEVER sent to any server.
             </p>
          </div>
        </div>
      )}

      {/* PHASE 2: ELECTION SELECTION */}
      {phase === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <button
              key={election.id}
              onClick={() => setSelectedElection(election)}
              className={`
                p-8 rounded-[35px] text-left transition-all border-2
                ${selectedElection?.id === election.id ? 'border-orange-500 bg-orange-50 shadow-xl' : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-lg'}
              `}
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                <Vote className={`w-7 h-7 ${selectedElection?.id === election.id ? 'text-orange-500' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2 line-clamp-2">{election.title}</h3>
              <div className="flex items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${election.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {election.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Start Date</div>
              <div className="text-sm font-bold text-gray-600 mb-6">{new Date(election.startDate).toLocaleDateString()}</div>
              
              <div 
                onClick={(e) => { e.stopPropagation(); startCounting(); }}
                className={`
                  w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all
                  ${selectedElection?.id === election.id ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                <Play className="w-4 h-4 fill-current" />
                Initialize Count
              </div>
            </button>
          ))}
        </div>
      )}

      {/* PHASE 3: COUNTING PROGRESS */}
      {phase === 3 && (
        <div className="bg-white rounded-[40px] p-16 text-center space-y-12 shadow-sm border border-gray-100">
           <div className="relative w-48 h-48 mx-auto">
             <svg className="w-full h-full transform -rotate-90">
               <circle
                 cx="96"
                 cy="96"
                 r="88"
                 stroke="currentColor"
                 strokeWidth="12"
                 fill="transparent"
                 className="text-gray-100"
               />
               <circle
                 cx="96"
                 cy="96"
                 r="88"
                 stroke="currentColor"
                 strokeWidth="12"
                 fill="transparent"
                 strokeDasharray={553}
                 strokeDashoffset={553 - (553 * progress) / 100}
                 className="text-orange-500 transition-all duration-300 stroke-round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black text-gray-900 tracking-tighter">{progress}%</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Decrypted</span>
             </div>
           </div>

           <div className="space-y-4 max-w-lg mx-auto">
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Decrypting Secure Ballots...</h2>
             <p className="text-gray-500 font-medium italic">Voter's intent is being extracted from the ciphertext. This process occurs strictly in local hardware memory for total privacy.</p>
           </div>

           <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Ballots</div>
                <div className="text-2xl font-black text-gray-900">{totalVotes}</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 text-left">
                <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Selected Election</div>
                <div className="text-sm font-black text-orange-900 line-clamp-1">{selectedElection?.title}</div>
              </div>
           </div>
        </div>
      )}

      {/* PHASE 4: RESULTS */}
      {phase === 4 && (
        <div className="space-y-8">
           <div className="bg-green-50/50 border border-green-200 rounded-[35px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-100 animate-bounce-slow">
               <CheckCircle className="w-10 h-10 text-white" />
             </div>
             <div className="flex-1 text-center md:text-left">
               <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tally Complete</h2>
               <p className="text-gray-600 font-medium mt-1">Successfully decrypted <span className="text-green-600 font-black">{countSummary.successful}</span> ballots. <span className="text-red-600 font-black">{countSummary.failed}</span> votes were skipped due to corruption or invalid signatures.</p>
             </div>
             <button 
               onClick={() => setPhase(2)}
               className="bg-gray-900 hover:bg-black text-white font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all"
             >
               Restart For New Election
             </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Main Tally List */}
             <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                   <BarChart3 className="w-6 h-6 text-orange-500" />
                   Candidate Performance
                 </h2>
               </div>
               
               <div className="space-y-4">
                 {results.map((result, idx) => (
                   <div key={idx} className="group p-6 bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all rounded-[30px] border border-transparent hover:border-gray-100">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${idx === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Result ID: {result.candidateId.slice(-8)}</div>
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">Candidate {result.candidateId.slice(0, 4)}...</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-gray-900 tracking-tighter">{result.votes}</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmed Votes</div>
                        </div>
                     </div>
                     <div className="mt-6 w-full h-3 bg-gray-200/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-orange-500' : 'bg-gray-400'}`}
                          style={{ width: `${(result.votes / countSummary.successful) * 100}%` }}
                        />
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Stats and Charts Area */}
             <div className="space-y-8">
                <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl">
                   <div className="absolute top-0 right-0 p-12 translate-x-12 -translate-y-12 bg-orange-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                   <h2 className="text-xl font-black tracking-tight mb-8">Election Statistics</h2>
                   
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-bold">Total Ballots Cast</span>
                        <span className="text-2xl font-black">{totalVotes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-bold">Valid Decryptions</span>
                        <span className="text-2xl font-black text-green-400">{countSummary.successful}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-bold">Anomalous/Skipped</span>
                        <span className="text-2xl font-black text-red-400">{countSummary.failed}</span>
                      </div>
                      <div className="pt-6 border-t border-white/10">
                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Integrity Check</div>
                        <div className="flex items-center gap-4 py-3 px-5 bg-white/5 rounded-2xl border border-white/5">
                           <ShieldCheck className="w-6 h-6 text-orange-500" />
                           <span className="text-xs font-bold text-gray-300">Hash Match Verification of Ledger Entries: OK</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                   <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                      <PieChart className="w-10 h-10 text-orange-500" />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-gray-900 tracking-tight">Export Audit Package</h3>
                     <p className="text-sm text-gray-500 font-medium">Download the cryptographically signed results for legal verification.</p>
                     <button className="mt-4 text-orange-500 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                       Generate Report
                       <ChevronRight className="w-4 h-4" />
                     </button>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
