import React from 'react';

export default function KioskSuccess({
  txHash,
  onReset
}: {
  txHash?: string,
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-t-[16px] border-t-green-500 border-x-4 border-x-gray-100 border-b-4 border-b-gray-100 p-16 w-full max-w-3xl text-center">
        <div className="w-40 h-40 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10 border-8 border-green-200">
          <svg className="w-24 h-24 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-6xl font-black text-gray-900 mb-8 tracking-tight">Vote Submitted!</h2>
        <p className="text-4xl text-blue-800 font-bold mb-16 uppercase tracking-wider">Your voice has been safely recorded.</p>
        
        {txHash && (
          <div className="bg-gray-50 border-4 border-gray-200 rounded-xl p-8 mb-16">
            <p className="text-xl text-gray-500 uppercase font-black tracking-widest mb-4">Blockchain Receipt Hash</p>
            <p className="font-mono text-2xl text-gray-800 word-break break-all">{txHash}</p>
          </div>
        )}

        <button 
          onClick={onReset}
          className="w-full bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-black text-4xl py-10 rounded-xl shadow-xl transition-colors uppercase tracking-widest"
        >
          FINISH
        </button>
      </div>
    </div>
  );
}
