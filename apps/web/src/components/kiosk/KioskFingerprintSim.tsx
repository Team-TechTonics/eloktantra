import React, { useEffect, useState } from 'react';

export default function KioskFingerprintSim({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    
    if (scanning) {
      timer1 = setTimeout(() => {
        setSuccess(true);
      }, 2500);
      timer2 = setTimeout(() => {
        onComplete();
      }, 4000);
    }
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [scanning, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-16 w-full max-w-2xl text-center">
        <h2 className="text-6xl font-black text-blue-900 mb-6 uppercase tracking-tight">Voter Biometrics</h2>
        <p className="text-3xl text-gray-600 mb-16 font-medium">Place your thumb firmly on the sensor pad.</p>
        
        <div className="relative mx-auto w-72 h-96 bg-gray-50 rounded-[4rem] border-[16px] border-gray-200 flex flex-col items-center justify-center mb-10 overflow-hidden shadow-inner cursor-pointer transition-transform active:scale-95"
             onClick={() => !scanning && setScanning(true)}>
           {!scanning && !success && (
             <div className="text-blue-500 animate-pulse text-2xl font-black uppercase flex flex-col items-center select-none">
               <svg className="w-40 h-40 mb-6 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                 <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.25.38 2.4 1 3.36l1.64-1.64C8.25 13.24 8 12.64 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .64-.25 1.24-.64 1.72l1.64 1.64c.62-.96 1-2.11 1-3.36 0-3.31-2.69-6-6-6z"/>
               </svg>
               TAP TO SCAN
             </div>
           )}
           {scanning && !success && (
             <div className="w-full h-full relative border-4 border-blue-400 rounded-[3rem]">
               <div className="absolute top-0 w-full h-4 bg-orange-500 shadow-[0_0_30px_theme('colors.orange.500')] animate-[scan_2s_ease-in-out_infinite] z-20"></div>
               <svg className="w-64 h-64 text-blue-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-70 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                 <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.25.38 2.4 1 3.36"/>
               </svg>
             </div>
           )}
           {success && (
             <div className="text-green-500 flex flex-col items-center bg-green-50 w-full h-full justify-center">
               <svg className="w-48 h-48 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
               </svg>
               <span className="text-4xl font-black mt-6 tracking-widest uppercase">MATCHED</span>
             </div>
           )}
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest">Aadhaar Bio-Match Service</p>
      </div>
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: calc(100% - 1rem); }
        }
      `}</style>
    </div>
  );
}
