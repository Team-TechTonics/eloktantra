import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

/**
 * ELOKTANTRA UNIFIED DATABASE BRIDGE 🛡️🔐⚡
 * Port 3000 & 3001 Connection Sync with Fallback
 */

const MONGODB_URI = process.env.MONGODB_URI as string;
const LOCAL_FALLBACK = 'mongodb://127.0.0.1:27017/eloktantra';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is undefined in environment');
}

// ─── MONGOOSE CONNECTION (Standardized per eloktantra-admin) ──────────────────
let mongooseCache = (global as any)._mongooseCache;
if (!mongooseCache) {
  mongooseCache = (global as any)._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  const opts = { bufferCommands: false };

  if (!mongooseCache.promise) {
    console.log('🌍 DATABASE: Handshaking with Gateway Ledger...');
    mongooseCache.promise = mongoose.connect(MONGODB_URI, opts).catch((err) => {
      console.warn('🛰️ ATLAS: Connection timeout for Port 3000. Switching to Local Cluster...');
      return mongoose.connect(LOCAL_FALLBACK, opts);
    });
  }

  try {
    mongooseCache.conn = await mongooseCache.promise;
    console.log('✅ Mongoose: Unified connection established');
    return mongooseCache.conn;
  } catch (e: any) {
    console.error('❌ Mongoose: Total database handshake failure', e.message);
    mongooseCache.promise = null;
    throw e; // Throw so caller sees the real cause
  }
}

// ─── MONGO CLIENT (Legacy / Direct operations) ──────────────────────────────
let clientCache: MongoClient | null = null;
let clientPromise: Promise<MongoClient | null> | null = null;

export async function getClient(): Promise<MongoClient | null> {
  if (clientCache) return clientCache;

  if (!clientPromise) {
    clientPromise = MongoClient.connect(MONGODB_URI).catch(() => {
        return MongoClient.connect(LOCAL_FALLBACK);
    });
  }
  
  clientCache = await clientPromise;
  return clientCache;
}

const clientDefaultPromise: Promise<MongoClient | null> = getClient();
export default clientDefaultPromise;
