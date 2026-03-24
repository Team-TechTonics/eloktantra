import { useQuery } from '@tanstack/react-query';

import { apiClient } from './client';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  photo_url?: string;
  age?: number;
  education: string | null;
  net_worth: string | null;
  criminal_cases: number;
  promises: Array<{
    title: string;
    status: string;
  }>;
}

export const fetchCandidates = async (): Promise<Candidate[]> => {
  const { data } = await apiClient.get('/candidates');
  return data.candidates || data.data || [];
};

export const fetchCandidateById = async (id: string): Promise<Candidate> => {
  const { data } = await apiClient.get(`/candidates?id=${id}`);
  return data.candidate || data.data || data;
};

export const fetchCandidatesByConstituency = async (constituencyId: string): Promise<Candidate[]> => {
  const { data } = await apiClient.get(`/candidates/${constituencyId}`);
  return data.candidates || data.data || [];
};

export const useCandidates = () => {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: fetchCandidates,
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => fetchCandidateById(id),
    enabled: !!id,
  });
};

export const useConstituencyCandidates = (constituencyId: string) => {
  return useQuery({
    queryKey: ['constituencyCandidates', constituencyId],
    queryFn: () => fetchCandidatesByConstituency(constituencyId),
    enabled: !!constituencyId,
  });
};
