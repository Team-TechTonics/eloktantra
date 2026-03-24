export interface Candidate {
  id: string;
  _id?: string;
  name: string;
  party: string;
  constituencyId: string;
  electionId: string;
  assets?: string;
  criminalCases: number;
  photo_url?: string;
  is_active?: boolean;
}

export interface Party {
  _id: string;
  name: string;
  abbreviation: string;
  logo_url: string;
  color: string;
  is_active: boolean;
  ideology: string;
  founded_year: number;
}


export interface Constituency {
  _id: string;
  id?: string;
  name: string;
  electionId: string;
  state: string;
}

export interface Election {
  id: string;
  _id?: string;
  title: string;
  type: 'General' | 'State';
  startDate: string;
  endDate: string;
  isActive: boolean;
  constituency?: string; // fallback for legacy
}

export interface Issue {
  _id: string;
  id?: string;
  title: string;
  description: string;
  constituencyId: string;
  electionId: string;
}

export interface Manifesto {
  _id: string;
  id?: string;
  candidateId: string;
  electionId: string;
  constituencyId: string;
  title: string;
  description: string;
}

export interface Voter {
  _id: string;
  name: string;
  phone: string;
  voterId: string;
  electionId: string;
  constituencyId: string;
  solToken?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Vote {
  id: string;
  _id?: string;
  userId: string;
  candidateId: string;
  electionId: string;
  constituencyId: string;
  blockchainHash: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  id?: string;
  event_type: string;
  detail: string;
  booth_id: string;
  ip_hash: string;
  timestamp: string;
}

export interface Officer {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  booth_id: string;
  device_id: string;
  status: 'Online' | 'Offline';
  is_active: boolean;
}
