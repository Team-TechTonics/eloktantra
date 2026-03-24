'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  BarChart3, Users, Globe, LayoutDashboard, 
  ChevronRight, AlertCircle, ShieldCheck, 
  ArrowRight, Landmark, Vote as VoteIcon
} from 'lucide-react';

interface DashboardStats {
  totalCandidates: number;
  totalVotes: number;
  activeElections: number;
  openIssues: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setElections(data.activeElections || []);
          setIssues(data.recentIssues || []);
        }
      })
      .catch(err => console.error('Dashboard Err:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center animate-pulse">
            <LayoutDashboard className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Decrypting Governance Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Superior Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl">
              <ShieldCheck className="w-4 h-4 text-primary mr-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Biometric Authenticated Session</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                Command <br /> <span className="text-primary/10 stroke-text border-primary">Center</span>
            </h1>
          </div>
          <div className="text-right hidden md:block border-l border-white/5 pl-8 h-fit">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Local Identity Registry</p>
            <p className="text-xl font-black text-white">CITIZENID-X92-2024</p>
          </div>
        </header>

        {/* Global Key Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Live Ballots', value: stats?.activeElections || 0, icon: Globe, color: 'text-blue-500' },
            { label: 'Blockchain Votes', value: stats?.totalVotes?.toLocaleString() || 0, icon: VoteIcon, color: 'text-emerald-500' },
            { label: 'Verified Candidates', value: stats?.totalCandidates || 0, icon: Users, color: 'text-orange-500' },
            { label: 'Audit Alerts', value: stats?.openIssues || 0, icon: AlertCircle, color: 'text-red-500' },
          ].map((s, i) => (
            <div key={i} className="group bg-[#0d1117] border border-white/5 p-8 rounded-[2rem] hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                <s.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 group-hover:scale-110 transition-transform duration-700 ${s.color}`} />
                <div className={`${s.color} mb-4`}><s.icon className="w-6 h-6" /></div>
                <div className="text-4xl font-black mb-1 group-hover:translate-x-1 transition-transform">{s.value}</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Active Polling Streams */}
            <section className="bg-[#0d1117] border border-white/5 rounded-[3rem] p-10 overflow-hidden relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center">
                   <BarChart3 className="w-6 h-6 mr-3 text-primary" /> Active Polling Streams
                </h2>
                <Link href="/elections" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center">
                  Full Archive <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {elections.length === 0 ? (
                <div className="py-20 text-center opacity-30 italic font-medium">No live elections in decentralized ledger.</div>
              ) : (
                <div className="space-y-4">
                  {elections.map((e, idx) => (
                    <div key={e.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl hover:border-primary/30 transition-all duration-500 gap-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">0{idx+1}</div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">{e.title}</h3>
                          <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                            <span className="text-primary mr-2">POLLING OPEN</span> · {e.constituency || 'National Scope'}
                          </div>
                        </div>
                      </div>
                      <Link href={`/vote?electionId=${e.id}`} className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 text-center">
                        Secure Vote
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Audit Logs / Issues */}
            <section className="bg-[#0d1117] border border-white/5 rounded-[3rem] p-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center">
                   <AlertCircle className="w-6 h-6 mr-3 text-red-500" /> Recent Audit Alerts
                </h2>
                <Link href="/issues" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors flex items-center">
                  Live Feed <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-3">
                {issues.map(issue => (
                  <div key={issue.id} className="p-5 bg-white/2 border border-white/5 rounded-2xl hover:border-red-500/20 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-sm uppercase tracking-tight text-gray-200">{issue.title}</h4>
                        <span className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">{issue.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium italic">"{issue.description.slice(0, 80)}..."</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Quick Gateways */}
            <section className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tighter text-primary">Electoral Access</h2>
              <div className="space-y-3">
                {[
                  { label: 'Candidate Profiles', href: '/candidates', icon: Users },
                  { label: 'Election Directory', href: '/elections', icon: Landmark },
                  { label: 'Report Violation', href: '/issues', icon: AlertCircle },
                ].map((item, i) => (
                  <Link key={i} href={item.href} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-black/30 transition-all group">
                    <div className="flex items-center">
                        <item.icon className="w-4 h-4 text-primary mr-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Verification Status */}
            <div className="bg-[#0d1117] border border-white/5 rounded-[2.5rem] p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Verified Citizen</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
                        Your identity hashing is confirmed via DigiLocker Consensus. 
                        Your ballot is unlocked and anonymous.
                    </p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
