'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import PageHeader from '@/components/layout/PageHeader';
import { Users, Flag, Map, Vote, Activity, Hash, Clock } from 'lucide-react';
import axios from 'axios';
import backendAPI from '@/lib/api';
import RecentActivity from '@/components/dashboard/RecentActivity';
import VoteChart from '@/components/dashboard/VoteChart';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    candidates: 0,
    parties: 0,
    constituencies: 0,
    activeElection: 'Loading...',
    totalVotes: 0,
    pendingSync: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cRes, pRes, coRes] = await Promise.all([
          axios.get('/api/candidates'),
          axios.get('/api/parties'),
          axios.get('/api/constituencies'),
        ]);

        let activeElection: any = { title: 'None', id: null };
        try {
          // Pointing to user's documented NestJS endpoint
          const eRes = await backendAPI.get('/election/active');
          activeElection = eRes.data || { title: 'None', id: null };
        } catch (error) {
          console.warn('Dashboard: Remote active election not found at /election/active');
        }
        
        let voteCount = 0;
        if (activeElection._id || activeElection.id) {
          const vRes = await backendAPI.get(`/vote/count/${activeElection._id || activeElection.id}`).catch(() => ({ data: 0 }));
          // Handle object response { total, committed, pending } or simple number
          voteCount = vRes.data?.total !== undefined ? vRes.data.total : (typeof vRes.data === 'number' ? vRes.data : 0);
        }

        setStats({
          candidates: cRes.data.data?.length || 0,
          parties: pRes.data.data?.length || 0,
          constituencies: coRes.data.data?.length || 0,
          activeElection: activeElection.title || 'None',
          totalVotes: voteCount,
          pendingSync: 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard data');
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
          subtitle="Real-time insights into the eLoktantra democratic network"
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <VoteChart />
        <RecentActivity />
      </div>
    </div>
  );
}
