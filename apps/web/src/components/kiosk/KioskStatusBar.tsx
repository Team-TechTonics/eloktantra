import React, { useEffect, useState } from 'react';
import { getKioskDeviceId } from './KioskDeviceBinding';
import { KioskOfflineQueue } from './KioskOfflineQueue';
import { apiClient } from '@/lib/api/client';

export default function KioskStatusBar({ status = 'ACTIVE' }: { status?: string }) {
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    
    // Process queue and sync status if online
    const syncNetworkAndQueue = async () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) {
        await KioskOfflineQueue.processQueue(apiClient);
      }
      setQueued(KioskOfflineQueue.getVotes().length);
    };

    const handleOnline = () => syncNetworkAndQueue();
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Fallback polling for queue length
    const interval = setInterval(syncNetworkAndQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-blue-900 text-gray-300 p-2 px-8 flex justify-between items-center text-sm font-mono font-bold shadow-2xl z-[999999]">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
        Term. ID: {getKioskDeviceId()}
      </div>
      <div className="flex gap-10 items-center">
        {queued > 0 && <span className="text-orange-400 bg-orange-400/10 border border-orange-400 px-3 py-1 rounded inline-flex gap-2 items-center"><span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span> Queued: {queued}</span>}
        <span className={online ? 'text-green-400' : 'text-red-400'}>
          {online ? '✓ CONNECTED' : '⚠ OFFLINE'}
        </span>
        <span className="text-blue-200">State: {status}</span>
        <div className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
