'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VerifyPage() {
  const [resending, setResending] = useState(false);

  const handleResend = () => {
    setResending(true);
    // Logic to resend email would go here
    setTimeout(() => {
      setResending(false);
      alert('Verification email sent!');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="glass-card w-full max-w-md p-10 text-center shadow-2xl shadow-primary/10 border-white/5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
        
        <div className="mb-8 relative z-10 flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Verify Your Email</h2>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            We&apos;ve sent a verification link to your email address. 
            Please check your inbox and verify your email to activate your civic account.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-4 bg-primary hover:bg-accent text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <Link
              href="/login"
              className="block w-full py-4 glass-card border-white/10 text-gray-400 hover:text-white font-bold rounded-xl transition-all"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
