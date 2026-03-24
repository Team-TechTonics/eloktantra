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
  id: string;
  _id?: string;
  name: string;
  abbreviation: string;
  logo_url: string;
  color: string;
  is_active: boolean;
  ideology: string;
  founded_year: number;
}


export interface Constituency {
  id: string;
  _id?: string;
  name: string;
  electionId: string;
  state: string;
}

export interface Election {
  id: string;
  _id?: string;
  name: string; // Standardized with NestJS
  title?: string; // Alias for backward compatibility
  type: 'General' | 'State';
  start_time: string; // Standardized with NestJS
  startDate?: string; // Alias
  end_time: string; // Standardized with NestJS
  endDate?: string; // Alias
  is_active: boolean; // Standardized with NestJS
  isActive?: boolean; // Alias
  constituency?: string;
}

export interface Issue {
  id: string;
  _id?: string;
  title: string;
  description: string;
  constituencyId: string;
  electionId: string;
  reportedCount?: number;
}

export interface Manifesto {
  id: string;
  _id?: string;
  candidateId: any; // Can be string or popped object
  electionId: string;
  constituencyId: any; // Can be string or popped object
  title: string;
  content: string;
}

export interface Voter {
  id: string;
  _id?: string;
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
  id: string;
  _id?: string;
  event_type: string;
  detail: string;
  booth_id: string;
  ip_hash: string;
  timestamp: string;
}

export interface Officer {
  id: string;
  _id?: string;
  name: string;
  username: string;
  booth_id: string;
  device_id: string;
  status: 'Online' | 'Offline';
  is_active: boolean;
}
