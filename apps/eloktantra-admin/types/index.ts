export interface Candidate {
  _id: string;
  name: string;
  party: string;
  partyId: string;
  constituency: string;
  constituencyId: string;
  photo_url: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  education: string;
  net_worth: string;
  criminal_cases: number;
  criminal_details?: string;
  manifesto_summary?: string;
  promises: { title: string; status: 'Pending' | 'InProgress' | 'Completed' }[];
  previous_terms: number;
  social_links: {
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  election_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Party {
  _id: string;
  name: string;
  abbreviation: string;
  logo_url: string;
  color: string;
  ideology?: string;
  founded_year?: number;
  headquarters?: string;
  president?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
}

export interface Constituency {
  _id: string;
  name: string;
  state: string;
  constituency_number: number;
  type: 'General' | 'SC' | 'ST';
  total_voters: number;
  district?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Election {
  id: string;
  _id?: string;
  title: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ENDED';
  start_date: string;
  end_date: string;
  candidates_count: number;
  contract_address?: string;
  total_votes?: number;
  description?: string;
  constituency?: string;
}

export interface Voter {
  _id: string;
  voter_id_hash: string;
  booth_id: string;
  has_voted: boolean;
  election_id: string;
  registered_at: string;
}

export interface Vote {
  id: string;
  vote_hash: string;
  election_id: string;
  booth_id: string;
  status: 'PENDING' | 'COMMITTED' | 'FAILED';
  tx_hash?: string;
  submitted_at: string;
}

export interface AuditLog {
  id: string;
  event_type: 'VOTE_COMMITTED' | 'SIGNATURE_FAILED' | 'DUPLICATE_ATTEMPT' | 'BOOTH_LOGIN';
  voter_id_hash?: string;
  booth_id: string;
  ip_hash: string;
  detail: string;
  timestamp: string;
}

export interface Officer {
  _id?: string;
  id: string;
  username: string;
  name: string;
  booth_id: string;
  last_login?: string;
  is_active: boolean;
  device_id?: string;
}
