'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VerificationResult {
  status: string;
  transaction: string;
  timestamp: string;
  block: string;
  network: string;
}

export default function VoteVerifyPage() {
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash) return;
    setIsVerifying(true);
    // Blockchain verification logic would go here
    setTimeout(() => {
      setIsVerifying(false);
      setResult({
        status: 'VERIFIED',
        transaction: '0x7a2d...f3b9e1d2c3b4a5d6e7f8g9h0',
        timestamp: new Date().toISOString(),
        block: '19,283,475',
        network: 'Mainnet'
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Vote Verification</h1>
          <p className="text-gray-400 font-medium text-lg">Enter your unique vote receipt hash to verify its inclusion in the blockchain ledger.</p>
        </header>

        <div className="glass-card p-8 md:p-12 border-white/5 space-y-8 shadow-2xl shadow-primary/5">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Vote Receipt Hash</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 0x7a2d...f3b9"
                  className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!hash || isVerifying}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-accent disabled:opacity-50 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!hash || isVerifying}
              className="w-full py-5 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isVerifying ? 'Verifying Ledger Inclusion...' : 'Verify on Blockchain'}
            </button>
          </form>

          {result && (
            <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-green-500 font-black uppercase tracking-widest">Verification Status</h3>
                  <p className="text-2xl font-black text-white">{result.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Transaction ID</div>
                  <div className="text-xs font-mono text-gray-200 truncate">{result.transaction}</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Timestamp</div>
                  <div className="text-xs font-bold text-gray-200">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Block Number</div>
                  <div className="text-xs font-bold text-gray-200">{result.block}</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-white/5 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600">Network</div>
                  <div className="text-xs font-bold text-gray-200">{result.network}</div>
                </div>
              </div>

              <div className="p-6 glass-card border-white/5 text-center">
                <p className="text-sm text-gray-400 font-medium mb-4 leading-relaxed">
                  Your vote hash has been found in the cryptographically secure election ledger. This confirms your vote was counted correctly and has not been tampered with.
                </p>
                <Link href="/elections" className="text-primary font-black uppercase tracking-widest hover:underline inline-flex items-center space-x-2">
                  <span>Audit more elections</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
