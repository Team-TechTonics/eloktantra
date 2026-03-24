import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Party } from '@/models/CoreModels';

export async function GET() {
  await connectDB();
  const models = Object.keys(mongoose.models);
  const partyModel = mongoose.models.Party;
  
  let errorMsg = null;
  let sampleData = null;
  
  try {
    sampleData = await Party.find({}).limit(1);
  } catch (err: any) {
    errorMsg = err.message;
  }
  
  return NextResponse.json({
    models,
    partyRegistered: !!partyModel,
    path: !!Party,
    error: errorMsg,
    data: sampleData
  });
}
