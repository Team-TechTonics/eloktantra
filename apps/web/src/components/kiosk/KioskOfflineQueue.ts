export interface QueuedVote {
  id: string;
  payload: any;
  timestamp: number;
}

export const KioskOfflineQueue = {
  addVote: (payload: any) => {
    if (typeof window === 'undefined') return;
    const queue = KioskOfflineQueue.getVotes();
    queue.push({ id: crypto.randomUUID(), payload, timestamp: Date.now() });
    localStorage.setItem('kiosk_offline_queue', JSON.stringify(queue));
  },
  
  getVotes: (): QueuedVote[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('kiosk_offline_queue');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  removeVote: (id: string) => {
    if (typeof window === 'undefined') return;
    const queue = KioskOfflineQueue.getVotes().filter(v => v.id !== id);
    localStorage.setItem('kiosk_offline_queue', JSON.stringify(queue));
  },
  
  processQueue: async (apiClient: any) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const queue = KioskOfflineQueue.getVotes();
    for (const vote of queue) {
      try {
        await apiClient.post('/vote/submit', vote.payload, {
          headers: { Authorization: `Bearer ${vote.payload.token}` }
        });
        KioskOfflineQueue.removeVote(vote.id);
      } catch (err: any) {
        // Stop on validation errors (e.g. token expired, machine blocked) to avoid infinite loops,
        // but retry on network errors next time.
        if (err.response && String(err.response.status).startsWith('4')) {
           console.error('Offline vote rejected permanently', err);
           KioskOfflineQueue.removeVote(vote.id);
        }
      }
    }
  }
};
