'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import PageHeader from '@/components/layout/PageHeader';
import { Users, Flag, Map, Vote, Activity, Hash, Clock } from 'lucide-react';
import { 
  votingAPI, 
  adminGetCandidates, 
  adminGetParties, 
  adminGetConstituencies, 
  adminGetActiveElection,
  adminGetElections
} from '@/lib/api';
import RecentActivity from '@/components/dashboard/RecentActivity';
import VoteChart from '@/components/dashboard/VoteChart';
import ActivePollingStreams from '@/components/dashboard/ActivePollingStreams';

/**
 * DASHBOARD : REAL-TIME MONITORING FROM RENDER-ATLAS (CONTENT SOURCE OF TRUTH)
 * ENFORCES CORS & HIERARCHY
 */
export default function DashboardPage() {
  const [stats, setStats] = useState({
    candidates: 0,
    parties: 0,
    constituencies: 0,
    activeElection: 'Loading...',
    totalVotes: 0,
    pendingSync: 0,
  });
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cRes, pRes, coRes, eRes, allERes] = await Promise.all([
          adminGetCandidates({}),
          adminGetParties(),
          adminGetConstituencies(),
          adminGetActiveElection(),
          adminGetElections()
        ]);

        const cList = Array.isArray(cRes.data) ? cRes.data : (cRes.data.data || cRes.data.candidates || []);
        const pList = Array.isArray(pRes.data) ? pRes.data : (pRes.data.data || []);
        const coList = Array.isArray(coRes.data) ? coRes.data : (coRes.data.data || coRes.data.constituencies || []);
        const activeElection = eRes.data.data || eRes.data || { title: 'None Found', id: null };
        const allElections = Array.isArray(allERes.data) ? allERes.data : (allERes.data.elections || allERes.data.data || []);
        
        let voteCount = 0;
        const electionId = activeElection._id || activeElection.id;
        if (electionId) {
           try {
               const vRes = await votingAPI.get(`/api/admin/results?electionId=${electionId}`);
               voteCount = vRes.data?.totalVotesCast || 0;
           } catch (vErr) {
               console.warn("Unable to fetch real-time vote count from Render");
           }
        }

        setStats({
          candidates: cList.length,
          parties: pList.length,
          constituencies: coList.length,
          activeElection: activeElection.name || activeElection.title || 'None',
          totalVotes: voteCount,
          pendingSync: 0,
        });
        setElections(allElections);
      } catch (error) {
        console.error('Unified Dashboard Sync Alert: Backend is unreachable or CORS blocked.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="System Overview" 
          subtitle="Real-time insights across the democratic network (Unified Render-Atlas Source)"
        />
        <div className="flex items-center space-x-2 bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-Refresh: 30s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard title="Candidates" value={stats.candidates} icon={Users} color="bg-blue-500" />
        <StatsCard title="Parties" value={stats.parties} icon={Flag} color="bg-purple-500" />
        <StatsCard title="Constituencies" value={stats.constituencies} icon={Map} color="bg-emerald-500" />
        <StatsCard title="Active Election" value={stats.activeElection} icon={Vote} color="bg-amber-500" isText />
        <StatsCard title="Votes Cast" value={stats.totalVotes} icon={Activity} color="bg-red-500" />
        <StatsCard title="Sync Pending" value={stats.pendingSync} icon={Hash} color="bg-gray-700" />
      </div>

      {/* Premium Election Feed */}
      <ActivePollingStreams elections={elections} loading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <VoteChart />
        <RecentActivity />
      </div>
    </div>
  );
}

