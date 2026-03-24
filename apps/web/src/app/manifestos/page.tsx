'use client';

import { useState, useEffect } from 'react';
import { FileText, ArrowRight, User, Vote, Target, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function ManifestosPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [manifestos, setManifestos] = useState<any[]>([]);
  
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get('/api/elections');
        setElections(res.data.elections || []);
      } catch (err) {
        console.error('Failed to fetch elections', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  // 2. Fetch Constituencies when election changes
  useEffect(() => {
    if (!selectedElection) return;
    const fetchConstituencies = async () => {
      try {
        const res = await axios.get(`/api/constituencies?electionId=${selectedElection}`);
        setConstituencies(res.data.constituencies || []);
        setSelectedConstituency('');
      } catch (err) {
        console.error('Failed to fetch constituencies', err);
      }
    };
    fetchConstituencies();
  }, [selectedElection]);

  // 3. Fetch Manifestos when constituency changes
  useEffect(() => {
    if (!selectedConstituency) return;
    const fetchManifestos = async () => {
      try {
        const res = await axios.get(`/api/manifestos?constituencyId=${selectedConstituency}`);
        setManifestos(res.data.manifestos || []);
      } catch (err) {
        console.error('Failed to fetch manifestos', err);
      }
    };
    fetchManifestos();
  }, [selectedConstituency]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#050505] text-white">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest mb-6">
            <FileText className="w-3 h-3" />
            <span>Regional Policy Archive</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-none uppercase italic">
            Digital <span className="text-orange-500">Manifestos</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium leading-relaxed">
            Review the official promises and ideological blueprints of candidates within your constituency. 
            All manifestos are cryptographically verified and immutable once published.
          </p>
        </div>

        {/* Hierarchy Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 p-8 rounded-3xl bg-[#111] border border-white/5 shadow-2xl">
          
          {/* Election Filter */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Vote className="w-3 h-3" /> Step 1: Select Election
            </label>
            <div className="relative group">
              <select 
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="w-full h-16 bg-black border-2 border-white/10 rounded-2xl px-6 appearance-none focus:border-orange-500 transition-all outline-none font-bold text-lg cursor-pointer group-hover:bg-[#0a0a0a]"
              >
                <option value="">Choose an Election Cycle</option>
                {elections.map(el => (
                  <option key={el._id} value={el._id}>{el.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Constituency Filter */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Target className="w-3 h-3" /> Step 2: Constituency
            </label>
            <div className="relative group">
              <select 
                value={selectedConstituency}
                disabled={!selectedElection}
                onChange={(e) => setSelectedConstituency(e.target.value)}
                className="w-full h-16 bg-black border-2 border-white/10 rounded-2xl px-6 appearance-none focus:border-orange-500 transition-all outline-none font-bold text-lg disabled:opacity-30 cursor-pointer group-hover:bg-[#0a0a0a]"
              >
                <option value="">{selectedElection ? 'Select Local Region' : 'Await Election Selection'}</option>
                {constituencies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {selectedConstituency ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {manifestos.length > 0 ? (
              manifestos.map((m) => (
                <div key={m._id} className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-orange-500/20 to-transparent transition-all duration-500 hover:scale-[1.01]">
                  <div className="bg-[#0f0f0f] rounded-[2.2rem] p-10 h-full border border-white/10 flex flex-col">
                    
                    {/* Candidate Info */}
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <User className="w-10 h-10 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight">{m.candidateName}</h3>
                        <p className="text-orange-400 font-bold uppercase tracking-widest text-sm">{m.partyName}</p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">{m.title}</h2>
                    
                    <div className="flex-1 space-y-6 mb-10">
                      <p className="text-gray-400 leading-relaxed italic line-clamp-3">"{m.content}"</p>
                      
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]">Core Priorities</span>
                        <div className="flex flex-wrap gap-2">
                          {m.priorities?.map((p: string, i: number) => (
                            <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-2 text-green-500/60 font-black text-[10px] uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verified Digital Ledger Original</span>
                      </div>
                       <Link href={`/candidates/${m.candidateId}`} className="group/btn flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs transition-all hover:bg-orange-500 hover:text-white">
                        Full Profile
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center rounded-[3rem] border-2 border-dashed border-white/5 bg-[#0a0a0a]">
                <FileText className="w-16 h-16 text-gray-700 mx-auto mb-6 opacity-50" />
                <h3 className="text-3xl font-black uppercase tracking-tight text-gray-500">No Manifestos Registered</h3>
                <p className="text-gray-600 mt-2 font-black uppercase tracking-widest text-xs">Awaiting verified uploads for this constituency.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-40 text-center">
             <div className="relative inline-block mb-12">
               <div className="absolute inset-0 bg-orange-500 rounded-full blur-[80px] opacity-20 animate-pulse" />
               <div className="relative w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0a0a]">
                  <Target className="w-12 h-12 text-orange-500" />
               </div>
             </div>
             <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Awaiting Regional Lock</h2>
             <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-sm">Select an election and constituency to browse local ballots.</p>
          </div>
        )}

      </div>
    </div>
  );
}
