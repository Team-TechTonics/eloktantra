import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { Constituency } from '@/models/CoreModels';

/**
 * GET /api/constituencies?electionId=
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    if (!electionId) {
      return NextResponse.json({ success: false, error: 'electionId is required' }, { status: 400 });
    }

    const constituencies = await Constituency.find({ electionId }).sort({ name: 1 });
    
    return NextResponse.json({ 
      success: true, 
      count: constituencies.length, 
      constituencies 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
