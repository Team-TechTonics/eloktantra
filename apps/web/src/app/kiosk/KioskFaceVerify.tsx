import React from 'react';

export default function KioskFaceVerify({
  onVerify,
  loading
}: {
  onVerify: () => void,
  loading: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-12 w-full max-w-3xl text-center">
        <h2 className="text-5xl font-bold text-blue-900 mb-6 tracking-tight">Biometric Verification</h2>
        <p className="text-2xl text-gray-600 mb-12">Please look directly into the camera lens.</p>
        
        <div className="relative mx-auto w-96 h-96 bg-gray-100 rounded-full overflow-hidden border-8 border-blue-100 flex items-center justify-center mb-12 shadow-inner">
           {/* Simulated camera feed area */}
           <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <svg className="w-40 h-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
           </div>
           {loading && (
             <div className="absolute inset-0 bg-blue-500/20 animate-pulse border-8 border-orange-500 rounded-full"></div>
           )}
        </div>

        <button 
          onClick={onVerify}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-4xl py-8 rounded-xl shadow-md transition-colors disabled:opacity-50 tracking-wider"
        >
          {loading ? 'SCANNING FACE...' : 'VERIFY BIOMETRICS'}
        </button>
      </div>
    </div>
  );
}
