import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Issue } from '@/models/CoreModels';
import { authenticate } from '@/lib/auth';

// GET /api/issues
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const constituency = searchParams.get('constituency');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const query: any = {};
    if (constituency) query.constituency = constituency;
    if (status) query.status = status;
    if (type) query.issueType = type;

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const normalized = issues.map(i => ({ ...i, id: i._id.toString() }));
    return NextResponse.json({ success: true, count: normalized.length, issues: normalized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/issues — citizen reports a new issue
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = await authenticate(request);
    const body = await request.json();
    const { title, description, location, constituency, issueType } = body;

    if (!title || !description || !location || !constituency || !issueType) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const issue = await Issue.create({
      title, description, location, constituency, issueType,
      reportedBy: payload?.userId || undefined,
    });

    return NextResponse.json({ success: true, issue }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
