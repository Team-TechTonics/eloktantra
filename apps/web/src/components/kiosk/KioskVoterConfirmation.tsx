import React from 'react';

export default function KioskVoterConfirmation({
  profile,
  electionId,
  onConfirm,
  onCancel,
  loading
}: {
  profile: any,
  electionId: string,
  onConfirm: () => void,
  onCancel: () => void,
  loading: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-gray-200 p-16 w-full max-w-3xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-4 bg-orange-500"></div>
        
        <h2 className="text-6xl font-black text-blue-900 mb-12 uppercase tracking-tight pb-6 border-b-2 border-gray-100">
           Confirm Identity
        </h2>
        
        <div className="bg-blue-50/50 rounded-2xl p-10 mb-12 border border-blue-100 text-left grid grid-cols-2 gap-y-8 gap-x-12 shadow-sm">
           <div className="col-span-2">
             <p className="text-xl text-gray-400 font-bold uppercase tracking-widest mb-2">Voter Name</p>
             <p className="text-5xl text-gray-900 font-black tracking-tight">{profile?.name || 'VOTER'}</p>
           </div>
           
           <div>
             <p className="text-xl text-gray-400 font-bold uppercase tracking-widest mb-2">EPIC/Voter ID</p>
             <p className="text-3xl text-blue-800 font-bold">{profile?.voterId || profile?._id || 'N/A'}</p>
           </div>
           
           <div>
             <p className="text-xl text-gray-400 font-bold uppercase tracking-widest mb-2">Constituency</p>
             <p className="text-3xl text-blue-800 font-bold uppercase">{profile?.constituency || profile?.constituencyId || 'N/A'}</p>
           </div>
        </div>

        <div className="flex gap-8 mt-12">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black text-4xl py-10 rounded-2xl shadow transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-[2] bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-black text-4xl py-10 rounded-2xl shadow-xl transition-colors disabled:opacity-50 tracking-widest flex items-center justify-center gap-4"
          >
            {loading ? 'PROCESSING...' : (
              <>
                CONFIRM & PROCEED <span className="text-orange-400 text-5xl relative top-[-2px]">➔</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
