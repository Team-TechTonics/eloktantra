'use client';

import { useState, useEffect } from 'react';
import { 
  AlertOctagon, Globe, MapPin, 
  ArrowRight, Search, Info, ShieldAlert,
  MessageSquare, Share2, ThumbsUp
} from 'lucide-react';

export default function IssuesHierarchyPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  
  const [isLoadingElections, setIsLoadingElections] = useState(true);
  const [isLoadingConstituencies, setIsLoadingConstituencies] = useState(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  // 1. Initial Load: Fetch Active Elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch('/api/elections?active=true');
        const data = await res.json();
        setElections(data.elections || []);
        if (data.elections?.length > 0) {
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

  // 3. Fetch Issues when Constituency changes
  useEffect(() => {
    if (!selectedElection || !selectedConstituency) {
      setIssues([]);
      return;
    }
    const fetchIssues = async () => {
      setIsLoadingIssues(true);
      try {
        // Updated API call to match hierarchical requirement
        const res = await fetch(`/api/issues?electionId=${selectedElection}&constituencyId=${selectedConstituency}`);
        const data = await res.json();
        setIssues(data.issues || []);
      } catch (err) {
        console.error('Fetch Issues Err:', err);
      } finally {
        setIsLoadingIssues(false);
      }
    };
    fetchIssues();
  }, [selectedElection, selectedConstituency]);

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-red-500/30">
      {/* Header */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 backdrop-blur-xl mb-8">
            <ShieldAlert className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Live Civic Audit Hub</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Constituency <br />
            <span className="text-red-500">Grievances</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            Filter by election cycle and region to view local civic issues reported by verified voters.
          </p>
        </div>
      </section>

      {/* Selector Flow (STICKY) */}
      <div className="sticky top-0 z-40 bg-[#020408]/80 backdrop-blur-3xl border-b border-white/5 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            
            <div className="w-full lg:w-1/2 group">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block group-hover:text-red-500 transition-colors">Select Election Scope</label>
              <div className="relative">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-14 pr-5 py-5 font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none cursor-pointer transition-all"
                >
                  {isLoadingElections ? <option>Syncing Elections...</option> : null}
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`w-full lg:w-1/2 group transition-opacity ${!selectedElection ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1 mb-2 block group-hover:text-red-500 transition-colors">Regional Filter</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  disabled={!selectedElection}
                  value={selectedConstituency}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-2xl pl-14 pr-5 py-5 font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="">Select Constituency...</option>
                  {constituencies.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Issues Feed */}
      <section className="container mx-auto px-6 py-20 min-h-[500px]">
        {!selectedElection || !selectedConstituency ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/2 rounded-[3rem] opacity-50 grayscale">
            <Search className="w-16 h-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Scope Required</h3>
            <p className="text-gray-500 font-medium">Select an election scope to view reported grievances.</p>
          </div>
        ) : isLoadingIssues ? (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 bg-white/2 border border-white/5 rounded-[3rem]">
            <Info className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No live issues reported in this constituency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {issues.map((issue) => (
              <div key={issue._id} className="group bg-[#0d1117] border border-white/5 rounded-[2.5rem] p-10 hover:border-red-500/30 transition-all duration-500 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <AlertOctagon className="w-24 h-24 text-red-500" />
                </div>

                <div className="space-y-6 relative z-10">
                  <header className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-red-500 transition-colors leading-none">{issue.title}</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Digital Audit ID: {issue._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </header>

                  <p className="text-gray-400 font-medium leading-relaxed italic">
                    "{issue.description}"
                  </p>

                  <footer className="pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center space-x-6 text-gray-500">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest hover:text-white cursor-pointer transition-all">
                            <ThumbsUp className="w-3.5 h-3.5 mr-2" /> 2.4k Upvotes
                        </div>
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest hover:text-white cursor-pointer transition-all">
                            <MessageSquare className="w-3.5 h-3.5 mr-2" /> 12 Comments
                        </div>
                    </div>
                    <button className="flex items-center text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                        Evidence Review <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1" />
                    </button>
                  </footer>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
