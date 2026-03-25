'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function ElectionsPage() {
  const router = useRouter();
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        // Fetching from the central backend (Local Gateway or Render)
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://backend-elokantra.onrender.com';
        const response = await fetch(`${baseUrl}/api/elections`);
        const result = await response.json();
        
        // Handle both standard list and wrapped object responses
        const list = Array.isArray(result) ? result : (result.elections || result.data || []);
        setElections(list);
      } catch (error) {
        console.error('Election Ledger Sync Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchElections();
  }, [router]);


  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Ending Soon";
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted font-black uppercase tracking-widest text-[10px]">Syncing with Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        {/* Header Section */}
        <header className="mb-20 text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            <span className="orange-text-gradient">
              Active Elections
            </span>
          </h1>
          <p className="text-muted font-medium text-xs md:text-base max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            Participate in secure, anonymous, and blockchain-verified voting. 
            <span className="block text-foreground/70 mt-1">Your vote is your power.</span>
          </p>
        </header>

        {/* Elections Grid */}
        <div className="flex justify-center">
            {elections.length === 0 ? (
                <div className="text-center py-20 glass-card w-full max-w-2xl">
                    <Info className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-muted font-bold uppercase tracking-widest text-sm">No active voting windows found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                {elections.map((election, idx) => (
                    <div 
                    key={election.id || election._id || idx} 
                    className="group relative glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_50px_-12px_rgba(255,107,44,0.15)] flex flex-col animate-in fade-in zoom-in-95 duration-500"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    >
                    <div className="p-8 md:p-10 flex-grow space-y-8">
                        {/* Top Bar */}
                        <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            {election.status || 'ACTIVE'}
                            </span>
                        </div>
                        </div>

                        {/* Election Title */}
                        <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-black text-foreground group-hover:orange-text-gradient transition-all duration-500 leading-tight">
                            {election.title || election.name || 'Untitled'}
                        </h2>
                        </div>

                        {/* Meta Data */}
                        <div className="space-y-6 pt-2">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Constituency</p>
                            <p className="text-primary/80 font-bold text-sm tracking-wide">
                            {election.constituency || 'National / General'}
                            </p>
                        </div>
                        
                        <div className="w-full h-px bg-border" />

                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Ends On</p>
                            <p className="text-foreground/60 font-bold text-sm tracking-wide italic">
                            {formatDate(election.end_time || election.end_date)}
                            </p>
                        </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="px-2 pb-2">
                        <button 
                            onClick={() => router.push(`/vote/${election.id || election._id}`)}
                            className="w-full bg-primary hover:bg-accent text-white py-6 flex items-center justify-center space-x-3 transition-all duration-300 rounded-[2rem] shadow-xl shadow-primary/10"
                        >
                            <span className="text-sm font-black uppercase tracking-[0.15em]">Cast Your Vote</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Developer Note */}
                    <div className="py-4 text-center">
                        <button 
                            onClick={() => router.push(`/vote/${election.id || election._id}?dev=true&token=DEV-CONSENSUS-MASTER`)}
                            className="text-[9px] font-black text-primary/40 hover:text-primary uppercase tracking-[0.3em] transition-colors"
                        >
                        Developer: Test Vote (No Limits)
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </div>

        {/* Footer Link */}
        <footer className="mt-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <button className="inline-flex items-center space-x-3 px-8 py-4 bg-surface hover:bg-surface/80 border border-border rounded-full transition-all group scale-100 hover:scale-105 active:scale-95 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">
              Verify Your Past Vote Hash
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
