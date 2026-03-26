import React from 'react';

export default function KioskConfirmVote({
  candidateId,
  onConfirm,
  onCancel,
  loading
}: {
  candidateId: string,
  onConfirm: () => void,
  onCancel: () => void,
  loading: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-8 border-orange-500 p-16 w-full max-w-3xl text-center">
        <h2 className="text-6xl font-black text-red-600 mb-10 uppercase tracking-widest border-b-4 border-red-100 pb-8">
           Confirm Selection
        </h2>
        
        <div className="bg-blue-50 rounded-xl p-10 mb-16 border-4 border-blue-200 shadow-inner">
           <p className="text-4xl text-blue-900 mb-6 font-bold leading-tight uppercase">You are about to cast your vote.</p>
           <p className="text-2xl text-red-600 font-bold">This action CANNOT be undone!</p>
        </div>

        <div className="flex flex-col space-y-8">
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-black text-5xl py-10 rounded-xl shadow-xl transition-colors disabled:opacity-50 tracking-widest"
          >
            {loading ? 'RECORDING...' : 'CONFIRM VOTE'}
          </button>
          
          <button 
            onClick={onCancel}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-3xl py-8 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            GO BACK TO BALLOT
          </button>
        </div>
      </div>
    </div>
  );
}
