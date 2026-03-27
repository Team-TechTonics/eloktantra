'use client';

import { BarChart3, ChevronRight, Vote, Clock } from 'lucide-react';
import Link from 'next/link';

interface Election {
  id: string;
  _id?: string;
  name?: string;
  title?: string;
  status?: string;
  constituency?: string;
  is_active?: boolean;
  isActive?: boolean;
  endDate?: string;
  end_time?: string;
}

interface ActivePollingStreamsProps {
  elections: Election[];
  loading?: boolean;
}

export default function ActivePollingStreams({ elections, loading }: ActivePollingStreamsProps) {
  if (loading) {
    return (
      <div className="bg-[#0b0f17] p-10 rounded-[3rem] border border-white/5 animate-pulse">
        <div className="h-8 bg-white/5 w-1/3 rounded-lg mb-10"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter for active and upcoming only
  const displayElections = elections.filter(e => {
    const endDateStr = e.end_time || e.endDate;
    const isExpired = endDateStr ? new Date(endDateStr) < new Date() : false;
    const isEnded = e.status === 'COMPLETED' || e.status === 'ENDED';
    const isLive = e.status === 'ACTIVE' || e.status === 'UPCOMING' || (e.is_active || e.isActive);
    
    return isLive && !isExpired && !isEnded;
  }).slice(0, 3); // Top 3 as per reference design

  return (
    <section className="bg-[#0b0f17] border border-white/5 rounded-[3rem] p-10 overflow-hidden relative shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center text-white">
          <BarChart3 className="w-6 h-6 mr-3 text-amber-500" /> Active Polling Streams
        </h2>
        <Link 
          href="/elections" 
          className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors flex items-center"
        >
          Full Archive <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {displayElections.length === 0 ? (
        <div className="py-20 text-center opacity-30 italic font-medium text-white">
          No live elections in digital ledger.
        </div>
      ) : (
        <div className="space-y-4">
          {displayElections.map((e, idx) => {
            const id = e.id || e._id;
            const status = e.status || ((e.is_active || e.isActive) ? 'ACTIVE' : 'UPCOMING');
            const isPollingOpen = status === 'ACTIVE';

            return (
              <div 
                key={id} 
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:border-amber-500/30 transition-all duration-500 gap-6"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center font-black text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none mb-1">
                      {e.name || e.title}
                    </h3>
                    <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span className={`${isPollingOpen ? 'text-amber-500' : 'text-blue-500'} mr-2`}>
                        {isPollingOpen ? 'POLLING OPEN' : 'UPCOMING'}
                      </span> 
                      · {e.constituency || 'National'}
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/elections/${id}`} 
                  className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all shadow-xl active:scale-95 text-center"
                >
                  Manage Cycle
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
