import React, { useState, useCallback } from 'react';
import KioskQRScanner from '@/components/kiosk/KioskQRScanner';

export default function KioskScanner({ 
  onSubmit, 
  loading 
}: { 
  onSubmit: (phone: string, voterId: string) => void,
  loading: boolean
}) {
  const [phone, setPhone] = useState('');
  const [voterId, setVoterId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !voterId) return;
    onSubmit(phone, voterId);
  };

  const handleScan = useCallback((text: string) => {
    // Attempt to parse text if it's a JSON QR code from DigiLocker or physical card
    try {
      if (text.startsWith('{')) {
        const parsed = JSON.parse(text);
        if (parsed.voterId || parsed.phone) {
          onSubmit(parsed.phone || '', parsed.voterId || '');
          return;
        }
      }
    } catch(e) {}
    
    // If it's a plain string, assume voterId if alphanumeric, or phone if numeric
    if (/^\d{10}$/.test(text)) {
       onSubmit(text, '');
    } else {
       onSubmit('', text);
    }
  }, [onSubmit]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-12 w-full max-w-3xl text-center">
        <h1 className="text-5xl font-bold text-blue-900 mb-6 tracking-tight">Voter Check-In</h1>
        <p className="text-2xl text-gray-600 mb-8">Scan your Voter ID or manually enter details below to begin.</p>
        
        <KioskQRScanner onScan={handleScan} />

        <form onSubmit={handleSubmit} className="space-y-10 text-left">
          <div>
            <label className="block text-3xl font-semibold text-blue-800 mb-4">Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-3xl p-6 border-4 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. 9876543210"
              disabled={loading}
            />
          </div>
          
          <div className="text-center font-bold text-gray-400 text-2xl uppercase tracking-widest">- OR -</div>

          <div>
            <label className="block text-3xl font-semibold text-blue-800 mb-4">Voter ID (EPIC Number)</label>
            <input 
              type="text" 
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              className="w-full text-3xl p-6 border-4 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors uppercase"
              placeholder="e.g. ABC1234567"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || (!phone && !voterId)}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-4xl py-8 rounded-xl transition-colors disabled:opacity-50 mt-12 shadow-md"
          >
            {loading ? 'VERIFYING...' : 'START VOTING'}
          </button>
        </form>
      </div>
    </div>
  );
}
