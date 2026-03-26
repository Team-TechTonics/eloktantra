'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KioskOfflineQueue } from './KioskOfflineQueue';

export default function KioskAdminPanel() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  // Example simple pin for demo purposes
  const ADMIN_PIN = '0000';

  const handleUnlock = () => {
    if (pin === ADMIN_PIN) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center border-t-8 border-orange-500">
          <h1 className="text-4xl font-bold mb-8 tracking-widest uppercase">Booth Officer</h1>
          {error && <p className="text-red-400 mb-6 font-bold">{error}</p>}
          <input 
             type="password"
             value={pin}
             onChange={(e) => setPin(e.target.value)}
             className="w-full bg-gray-700 text-4xl text-center p-6 rounded-xl mb-8 tracking-[1em] focus:outline-none focus:ring-4 focus:ring-blue-500"
             placeholder="****"
             maxLength={4}
          />
          <button 
             onClick={handleUnlock}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-6 rounded-xl transition-colors tracking-widest"
          >
            UNLOCK TERMINAL
          </button>
          
          <button onClick={() => router.push('/kiosk')} className="mt-8 text-gray-400 hover:text-white underline">
            Return to Voting Mode
          </button>
        </div>
      </div>
    );
  }

  const queueLength = typeof window !== 'undefined' ? KioskOfflineQueue.getVotes().length : 0;
  const lastVote = typeof window !== 'undefined' ? localStorage.getItem('kiosk_last_vote_time') : null;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight">Kiosk Override Panel</h1>
          <button 
             onClick={() => router.push('/kiosk')}
             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-8 rounded-xl"
          >
            Exit Admin
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-500 mb-4 uppercase">System State</h3>
            <div className="text-4xl font-black text-green-500 mb-6">ONLINE</div>
            <p className="text-gray-500 font-mono">Last Vote: {lastVote ? new Date(parseInt(lastVote)).toLocaleString() : 'Never'}</p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-500 mb-4 uppercase">Offline Queue</h3>
            <div className={`text-6xl font-black mb-6 ${queueLength > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
              {queueLength}
            </div>
            {queueLength > 0 && (
              <button onClick={() => alert('Connect to network to sync. Feature handles automatically.')} 
                      className="text-orange-600 font-bold underline">
                Pending Sync
              </button>
            )}
          </div>

          <div className="col-span-2 mt-8 flex flex-col space-y-6">
             <button 
                onClick={() => {
                  if (confirm('Are you sure you want to hard reset the session? This will wipe the current voter progress.')) {
                    localStorage.removeItem('kiosk_session_state');
                    alert('Session reset.');
                    router.push('/kiosk');
                  }
                }}
                className="w-full bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 font-bold text-3xl py-10 rounded-2xl transition-colors"
             >
               FORCE RESET VOTER SESSION
             </button>

             <button 
                onClick={() => {
                   alert('Terminal disabled. Return to home screen.');
                   router.push('/');
                }}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold text-3xl py-10 rounded-2xl transition-colors"
             >
               DISABLE VOTING TERMINAL
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
