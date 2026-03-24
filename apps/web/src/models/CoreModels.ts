import mongoose, { Schema, Document, Model } from 'mongoose';

// ════════════════════════════════════════════════════
// PARTY MODEL (Hierarchical Root)
// ════════════════════════════════════════════════════
export interface IParty extends Document {
  name: string;
  abbreviation: string;
  logo_url: string; 
  color: string;
  ideology: string;
  founded_year: number;
  headquarters: string;
  president: string;
  website: string;
}

const PartySchema = new Schema<IParty>({
  name: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true },
  logo_url: { type: String },
  color: { type: String },
  ideology: { type: String },
  founded_year: { type: Number },
  headquarters: { type: String },
  president: { type: String },
  website: { type: String },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// ELECTION MODEL
// ════════════════════════════════════════════════════
export interface IElection extends Document {
  title: string;
  type: 'General' | 'State' | 'By-Election';
  status: 'Upcoming' | 'Active' | 'Completed';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // ─── Legacy Persistence Bridge (For /server compatibility) ───
  constituency?: string; 
  start_time?: Date;
  end_time?: Date;
}

const ElectionSchema = new Schema<IElection>({
  title: { type: String, required: true },
  type: { type: String, enum: ['General', 'State', 'By-Election'], default: 'General' },
  status: { type: String, enum: ['Upcoming', 'Active', 'Completed'], default: 'Upcoming' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },

  // ─── Migration Bridge (Required by legacy collection) ───
  constituency: { type: String, default: 'National' },
  start_time: { type: Date },
  end_time: { type: Date },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// CONSTITUENCY MODEL (Scoped to Election)
// ════════════════════════════════════════════════════
export interface IConstituency extends Document {
  name: string;
  electionId: mongoose.Types.ObjectId;
  state: string;
  regionCode?: string;
  totalVoters?: number;
}

const ConstituencySchema = new Schema<IConstituency>({
  name: { type: String, required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  state: { type: String, required: true },
  regionCode: { type: String },
  totalVoters: { type: Number, default: 0 },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// CANDIDATE MODEL (The Scoped Representative)
// ════════════════════════════════════════════════════
export interface ICandidate extends Document {
  name: string;
  partyId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  constituencyId: mongoose.Types.ObjectId;
  photo_url?: string;
  assets?: string;
  criminalCases: number;
  education?: string;
  biography?: string;
  is_active: boolean;
}

const CandidateSchema = new Schema<ICandidate>({
  name: { type: String, required: true },
  partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  constituencyId: { type: Schema.Types.ObjectId, ref: 'Constituency', required: true },
  photo_url: { type: String },
  assets: { type: String },
  criminalCases: { type: Number, default: 0 },
  education: { type: String },
  biography: { type: String },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

// ════════════════════════════════════════════════════
// ISSUE MODEL (Scoped to Constituency)
// ════════════════════════════════════════════════════
export interface IIssue extends Document {
  title: string;
  description: string;
  electionId: mongoose.Types.ObjectId;
  constituencyId: mongoose.Types.ObjectId;
  reportedCount: number;
}

const IssueSchema = new Schema<IIssue>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  constituencyId: { type: Schema.Types.ObjectId, ref: 'Constituency', required: true },
  reportedCount: { type: Number, default: 0 },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// MANIFESTO MODEL (Legacy Promises Deleted)
// ════════════════════════════════════════════════════
export interface IManifesto extends Document {
  title: string;
  content: string;
  candidateId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  constituencyId: mongoose.Types.ObjectId;
  priorities: string[];
}

const ManifestoSchema = new Schema<IManifesto>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  constituencyId: { type: Schema.Types.ObjectId, ref: 'Constituency', required: true },
  priorities: [{ type: String }],
}, { timestamps: true });

// ════════════════════════════════════════════════════
// VOTE MODEL (Blockchain Linked)
// ════════════════════════════════════════════════════
export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  constituencyId: mongoose.Types.ObjectId;
  blockchainHash: string;
}

const VoteSchema = new Schema<IVote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  constituencyId: { type: Schema.Types.ObjectId, ref: 'Constituency', required: true },
  blockchainHash: { type: String, required: true },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// BOOTH OFFICER MODEL
// ════════════════════════════════════════════════════
export interface IBoothOfficer extends Document {
  name: string;
  username: string;
  booth_id: string;
  device_id: string;
  status: 'Online' | 'Offline';
  is_active: boolean;
}

const BoothOfficerSchema = new Schema<IBoothOfficer>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  booth_id: { type: String, required: true },
  device_id: { type: String, required: true },
  status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// AUDIT LOG MODEL
// ════════════════════════════════════════════════════
export interface IAuditLog extends Document {
  event_type: string;
  detail: string;
  booth_id: string;
  ip_hash: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  event_type: { type: String, required: true },
  detail: { type: String, required: true },
  booth_id: { type: String, default: 'System' },
  ip_hash: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// ════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════
export const Party: Model<IParty> = mongoose.models.Party || mongoose.model<IParty>('Party', PartySchema);
export const Election: Model<IElection> = mongoose.models.Election || mongoose.model<IElection>('Election', ElectionSchema);
export const Constituency: Model<IConstituency> = mongoose.models.Constituency || mongoose.model<IConstituency>('Constituency', ConstituencySchema);
export const Candidate: Model<ICandidate> = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
export const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
export const Manifesto: Model<IManifesto> = mongoose.models.Manifesto || mongoose.model<IManifesto>('Manifesto', ManifestoSchema);
export const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
export const BoothOfficer: Model<IBoothOfficer> = mongoose.models.BoothOfficer || mongoose.model<IBoothOfficer>('BoothOfficer', BoothOfficerSchema);
export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
