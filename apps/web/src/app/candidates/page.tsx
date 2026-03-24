'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, MapPin, Users, Heart, ShieldCheck, 
  ChevronRight, ArrowRight, Info, Search, Filter
} from 'lucide-react';

export default function CandidatesHierarchyPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  
  const [isLoadingElections, setIsLoadingElections] = useState(true);
  const [isLoadingConstituencies, setIsLoadingConstituencies] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // 1. Initial Load: Fetch Active Elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch('/api/elections?active=true');
        const data = await res.json();
        setElections(data.elections || []);
        if (data.elections?.length > 0) {
          // Auto-select first election if none selected
          setSelectedElection(data.elections[0].id);
        }
      } catch (err) {
        console.error('Fetch Elections Err:', err);
      } finally {
        setIsLoadingElections(false);
      }
    };
    fetchElections();
  }, []);

  // 2. Fetch Constituencies when Election changes
  useEffect(() => {
    if (!selectedElection) return;
    const fetchConstituencies = async () => {
      setIsLoadingConstituencies(true);
      setConstituencies([]);
      setSelectedConstituency('');
      try {
        const res = await fetch(`/api/constituencies?electionId=${selectedElection}`);
        const data = await res.json();
        setConstituencies(data.constituencies || []);
      } catch (err) {
        console.error('Fetch Constituencies Err:', err);
      } finally {
        setIsLoadingConstituencies(false);
      }
    };
    fetchConstituencies();
  }, [selectedElection]);

  // 3. Fetch Candidates when Constituency changes
  useEffect(() => {
    if (!selectedElection || !selectedConstituency) {
      setCandidates([]);
      return;
    }
    const fetchCandidates = async () => {
      setIsLoadingCandidates(true);
      try {
        const res = await fetch(`/api/candidates?electionId=${selectedElection}&constituencyId=${selectedConstituency}`);
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch (err) {
        console.error('Fetch Candidates Err:', err);
      } finally {
        setIsLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, [selectedElection, selectedConstituency]);

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-orange-500/30">
      {/* Dynamic Header */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10">
          <header className="max-w-4xl space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-xl mb-4">
              <ShieldCheck className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Verified Citizen Directory</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter">
              Election <br /> 
              <span className="text-orange-500">Hierarchy</span>
            </h1>
            <p className="text-gray-400 font-medium text-sm md:text-base max-w-2xl leading-relaxed uppercase tracking-wide">
              Data is strictly scoped to election cycles and regional constituencies to prevent cross-contamination of civic records.
            </p>
          </header>
        </div>
      </section>

      {/* Selector Flow (STICKY) */}
      <div className="sticky top-0 z-40 bg-[#020408]/80 backdrop-blur-3xl border-b border-white/5 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            
            {/* Step 1: Select Election */}
            <div className="w-full lg:w-1/3 group">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block group-hover:text-orange-500 transition-colors">1. Select Election Cycle</label>
              <div className="relative">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-14 pr-5 py-5 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer transition-all"
                >
                  {isLoadingElections ? <option>Loading...</option> : null}
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                  {elections.length === 0 && !isLoadingElections && <option>No Active Elections</option>}
                </select>
              </div>
            </div>

            <ChevronRight className="hidden lg:block w-5 h-5 text-gray-700 mt-6" />

            {/* Step 2: Select Constituency */}
            <div className={`w-full lg:w-1/3 group transition-opacity ${!selectedElection ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block group-hover:text-orange-500 transition-colors">2. Regional Constituency</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  disabled={!selectedElection}
                  value={selectedConstituency}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-14 pr-5 py-5 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="">Choose Area...</option>
                  {isLoadingConstituencies ? <option>Syncing Maps...</option> : null}
                  {constituencies.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden lg:flex items-center ml-auto">
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Global Status</p>
                    <div className="flex items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                        <span className="text-xs font-bold text-emerald-500 uppercase">Audit Systems Live</span>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Candidates Display Grid */}
      <section className="container mx-auto px-6 py-20 min-h-[500px]">
        {!selectedElection || !selectedConstituency ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/2 rounded-[3rem] opacity-50 grayscale">
            <Search className="w-16 h-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Scope Not Selected</h3>
            <p className="text-gray-500 font-medium">Please select an election and constituency to view candidates.</p>
          </div>
        ) : isLoadingCandidates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-96 bg-white/5 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20 bg-white/2 border border-white/5 rounded-[3rem]">
            <Info className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No verified candidates in this scope.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidates.map((c) => (
              <div key={c.id} className="group relative bg-[#0d1117] border border-white/5 rounded-[3rem] overflow-hidden hover:border-orange-500/30 transition-all duration-500 flex flex-col hover:shadow-[0_20px_50px_rgba(245,158,11,0.05)]">
                <div className="p-8 pb-4 flex-grow">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center font-black text-3xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 border border-orange-500/10 shadow-inner">
                      {c.name.charAt(0)}
                    </div>
                    <div className="px-5 py-2 rounded-full border border-white/10 bg-white/5 group-hover:border-orange-500/20 group-hover:bg-orange-500/10 transition-all">
                      <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-orange-500 tracking-widest">{c.party}</span>
                    </div>
                  </div>

                  <h3 className="text-4xl font-black mb-1 group-hover:text-orange-500 transition-colors uppercase tracking-tighter leading-none">{c.name}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Digital Candidate ID: {c.id.slice(-8).toUpperCase()}</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500 uppercase tracking-widest">Total Assets</span>
                        <span className="font-black text-white">₹ {c.assets || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500 uppercase tracking-widest">Criminal Record</span>
                        <span className={`font-black ${c.criminalCases > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{c.criminalCases} Cases</span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                    <Link 
                        href={`/candidates/${c.id}`}
                        className="w-full bg-white/5 py-6 flex items-center justify-center space-x-3 rounded-[2rem] border border-white/10 group-hover:bg-orange-500 transition-all duration-500"
                    >
                        <span className="text-xs font-black uppercase tracking-widest group-hover:text-white">Profile & Manifesto</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
