import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/vote/submit — Cast a verified, blockchain-backed vote.
 * Forward to Render Backend (Source of Truth)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing session' }, { status: 401 });
    }

    const body = await request.json();
    const res = await axios.post(`${BACKEND_URL}/vote`, body, {
      headers: {
        'Authorization': authHeader,
        'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024'
      }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Vote submission proxy error:', err.response?.data || err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.response?.data?.error || 'Source of truth offline' 
    }, { status: 502 });
  }
}
