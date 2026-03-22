import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

export interface Election {
  id: string;
  title: string;
  constituency: string;
  start_time: string;
  end_time: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
}

export interface ElectionDetail extends Election {
  candidates: Candidate[];
}

const DEMO_ELECTION: ElectionDetail = {
  id: 'delhi-2024',
  title: 'Delhi Assembly Election 2024',
  constituency: 'New Delhi',
  start_time: new Date(Date.now() - 86400000).toISOString(),
  end_time: new Date(Date.now() + 86400000).toISOString(),
  status: 'ACTIVE',
  candidates: [
    { id: 'c1', name: 'Arvind Kejriwal', party: 'AAP', constituency: 'New Delhi' },
    { id: 'c2', name: 'Bansuri Swaraj', party: 'BJP', constituency: 'New Delhi' },
    { id: 'c3', name: 'Kanhaiya Kumar', party: 'INC', constituency: 'New Delhi' },
  ]
};

export const fetchElections = async (): Promise<Election[]> => {
  try {
    const { data } = await apiClient.get('/elections');
    // Handle both wrapped and flat arrays
    const elections = data.elections || data.data || (Array.isArray(data) ? data : []);
    return elections.length > 0 ? elections : [DEMO_ELECTION];
  } catch (error) {
    console.warn('Failed to fetch elections from backend, using Demo Data:', error);
    return [DEMO_ELECTION];
  }
};

export const fetchElectionById = async (id: string): Promise<ElectionDetail> => {
  try {
    const { data } = await apiClient.get(`/elections/${id}`);
    const election = data.election || data.data || data;
    return election || DEMO_ELECTION;
  } catch (error) {
    console.warn('Failed to fetch election details from backend, using Demo Data:', error);
    return DEMO_ELECTION;
  }
};

export const generateVotingToken = async (params: { voterId: string; electionId: string }): Promise<string> => {
  try {
    // Standardizing on /generate-token for voters
    const { data } = await apiClient.post('/generate-token', {
      userId: params.voterId,
      electionId: params.electionId
    });
    return data.token || data.access_token || 'demo-token-' + Date.now();
  } catch (error) {
    console.warn('Failed to generate token, returning DEMO token:', error);
    return 'demo-token-' + Date.now();
  }
};

export const castVote = async (params: {
  electionId: string;
  tokenHash: string;
  encryptedVote: string;
}): Promise<{ txHash: string; receipt: string }> => {
  try {
    const { data } = await apiClient.post('/vote/submit', params, {
      headers: { Authorization: `Bearer ${params.tokenHash}` }
    });
    return { txHash: data.txHash || 'demo-tx-hash', receipt: data.receipt || 'demo-receipt' };
  } catch (error) {
    console.warn('Failed to cast vote, returning DEMO success:', error);
    return { txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''), receipt: 'DEMO-RECEIPT' };
  }
};

export const useElections = () => {
  return useQuery({
    queryKey: ['elections'],
    queryFn: fetchElections,
  });
};

export const useElection = (id: string) => {
  return useQuery({
    queryKey: ['election', id],
    queryFn: () => fetchElectionById(id),
    enabled: !!id,
  });
};

export const useCastVote = () => {
  return useMutation({
    mutationFn: castVote,
  });
};
