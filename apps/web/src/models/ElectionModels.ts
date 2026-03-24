import mongoose, { Schema, Document, Model } from 'mongoose';

// ════════════════════════════════════════════════════
// ELECTORAL ROLL MODEL (The Definitive Voter Record)
// ════════════════════════════════════════════════════
export interface IElectoralRoll extends Document {
  name: string;
  phone: string;
  voterId: string;
  aadhaarHash: string;
  address: string;
  electionId?: mongoose.Types.ObjectId;
  constituencyId: mongoose.Types.ObjectId;
  faceEmbedding: string; // Mock vector or hash for face verification
  solToken: string;      // Pre-generated for the Sol Token System
  solTokenUsed: boolean; // Tracking for "One Person, One Vote" logic
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ElectoralRollSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  voterId: { type: String, required: true, unique: true },
  aadhaarHash: { type: String, required: true },
  address: { type: String, required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election' },
  constituencyId: { type: Schema.Types.ObjectId, ref: 'Constituency', required: true },
  faceEmbedding: { type: String, required: true },
  solToken: { type: String, required: true, unique: true },
  solTokenUsed: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ElectoralRoll: Model<IElectoralRoll> = mongoose.models.ElectoralRoll || mongoose.model<IElectoralRoll>('ElectoralRoll', ElectoralRollSchema);

// ════════════════════════════════════════════════════
// USER MODEL (The Active Citizen Session)
// ════════════════════════════════════════════════════
export interface IUser extends Document {
  name: string;
  phone: string;
  aadhaarHash?: string;
  constituencyId: mongoose.Types.ObjectId;
  isVerified: boolean;
  hasVoted: boolean;
  votedOffline: boolean; // Metadata override flag for manual voting
  
  // Security Fingerprints (SESSION LOCK)
  deviceId?: string;
  sessionId?: string; // Unique per-verification attempt
  lastLoginIP?: string;
  faceHash?: string;   // Cryptographic lock of the biometric signature
  tokenHash?: string;  // Device + Session bound voting token
  
  suspicious: boolean;
  locationStatus?: string; // Geo-consistency check (Matched / Mismatched)
  
  // Face Verification Trace
  sessionFaceEmbedding?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  aadhaarHash: { type: String },
  constituencyId: { type: Schema.Types.ObjectId, ref: 'Constituency', required: true },
  isVerified: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  votedOffline: { type: Boolean, default: false },
  
  deviceId: { type: String },
  sessionId: { type: String },
  lastLoginIP: { type: String },
  faceHash: { type: String },
  tokenHash: { type: String },
  
  suspicious: { type: Boolean, default: false },
  locationStatus: { type: String, default: 'PENDING' },
  
  sessionFaceEmbedding: { type: String }
}, { timestamps: true });


export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ════════════════════════════════════════════════════
// OTP STORE MODEL
// ════════════════════════════════════════════════════
export interface IOTPStore extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
}

const OTPStoreSchema: Schema = new Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '5m' } }
}, { timestamps: true });

export const OTPStore: Model<IOTPStore> = mongoose.models.OTPStore || mongoose.model<IOTPStore>('OTPStore', OTPStoreSchema);
