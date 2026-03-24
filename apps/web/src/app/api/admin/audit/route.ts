import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/adminAuth';
import { AuditLog } from '@/models/CoreModels';

/**
 * GET /api/admin/audit
 * Returns system audit logs for administrative inspection.
 */
export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    await connectDB();
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .lean();
      
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
