import axios from 'axios';
import { getSession } from 'next-auth/react';

// URL for Content (MongoDB) - handled by our main Next.js web app
const CONTENT_API_URL = process.env.NEXT_PUBLIC_WEB_API_URL || 'http://localhost:3000';

// URL for Voting (Blockchain/Ledger) - handled by the Render backend
const VOTING_API_URL = process.env.NEXT_PUBLIC_VOTING_API_URL || 
                      (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://backend-elokantra.onrender.com');

/** 
 * CONTENT API CLIENT (MongoDB)
 */
const contentAPI = axios.create({
  baseURL: CONTENT_API_URL,
  timeout: 15000,
});

contentAPI.interceptors.request.use(async (config) => {
  const session: any = await getSession();
  const adminKey = session?.adminKey || process.env.ADMIN_SECRET_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';
  config.headers['x-admin-key'] = adminKey;
  return config;
});

/**
 * VOTING API CLIENT (Render / Blockchain)
 */
const votingAPI = axios.create({
  baseURL: VOTING_API_URL,
  timeout: 15000,
});

votingAPI.interceptors.request.use(async (config) => {
  const session: any = await getSession();
  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }
  return config;
});

export { contentAPI, votingAPI };
export default contentAPI; // default to content for legacy compatibility

// ─── CONTENT OPERATIONS (MongoDB) ───────────────────────────────────────────

export const adminGetConstituencies = (electionId?: string) =>
  votingAPI.get(`/api/admin/constituency${electionId ? `?electionId=${electionId}` : ''}`);

export const adminCreateConstituency = (data: any) =>
  votingAPI.post('/api/admin/constituency', data);

export const adminGetCandidates = (params: { electionId?: string, constituencyId?: string }) =>
  votingAPI.get('/api/candidates', { params });

export const adminCreateCandidate = (data: any) =>
  votingAPI.post('/api/admin/candidate', data);

export const adminCreateIssue = (data: any) =>
  votingAPI.post('/api/admin/issue', data);

export const adminGetIssues = () =>
  votingAPI.get('/api/admin/issue');

export const adminGetParties = () =>
  votingAPI.get('/api/admin/party');

export const adminCreateParty = (data: any) =>
  votingAPI.post('/api/admin/party', data);

export const adminDeleteParty = (id: string) =>
  votingAPI.delete(`/api/admin/party?id=${id}`);

export const adminCreateManifesto = (data: any) =>
  votingAPI.post('/api/admin/manifesto', data);

export const adminGetManifestos = () =>
  votingAPI.get('/api/admin/manifesto');

export const adminDeleteManifesto = (id: string) =>
  votingAPI.delete(`/api/admin/manifesto?id=${id}`);


/** Fetch all elections from MongoDB (Source of Truth for Hierarchy) */
export const adminGetElections = () =>
  votingAPI.get('/api/admin/election');

/** Create a root election entry */
export const adminCreateElection = (data: any) =>
  votingAPI.post('/api/admin/election', data);

/** Toggle election status in MongoDB */
export const adminActivateElection = (id: string) =>
  votingAPI.post('/api/admin/election/status', { id, isActive: true });

export const adminDeactivateElection = (id: string) =>
  votingAPI.post('/api/admin/election/status', { id, isActive: false });

export const adminGetActiveElection = () =>
  votingAPI.get('/api/election/active');

// ─── VOTING OPERATIONS (Render - Ledger Only) ─────────────────────────────

/** Sync status with Blockchain Ledger */
export const votingSyncElection = (id: string) =>
  votingAPI.patch(`/voting/elections/${id}`, { status: 'ACTIVE' });

export const adminGetVotesMonitor = () =>
  votingAPI.get('/votes/monitor');
