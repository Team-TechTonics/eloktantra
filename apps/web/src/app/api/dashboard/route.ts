import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Election, Vote, Issue, Candidate } from '@/models/CoreModels';

/**
 * GET /api/dashboard — aggregated stats for the dashboard
 */
export async function GET() {
  try {
    await connectDB();

    const [
      totalCandidates,
      totalVotes,
      activeElectionsCount,
      openIssuesCount,
      recentIssues,
      activeElectionsList,
    ] = await Promise.all([
      Candidate.countDocuments(),
      Vote.countDocuments(),
      Election.countDocuments({ isActive: true }),
      Issue.countDocuments(),
      Issue.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      Election.find({ isActive: true }).sort({ startDate: -1 }).limit(5).lean(),
    ]);

    const elections = activeElectionsList.map((e: any) => ({ ...e, id: e._id.toString() }));
    const issues = recentIssues.map((i: any) => ({ ...i, id: i._id.toString() }));

    return NextResponse.json({
      success: true,
      stats: {
        totalCandidates,
        totalVotes,
        activeElections: activeElectionsCount,
        openIssues: openIssuesCount,
      },
      recentIssues: issues,
      activeElections: elections,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
