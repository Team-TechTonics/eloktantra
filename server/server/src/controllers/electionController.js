const electionRepository = require('../repositories/electionRepository');

const getActiveElection = async (req, res) => {
  try {
    const election = await electionRepository.getActiveElection();
    if (!election) {
      return res.status(200).json({ success: true, title: 'No active election', id: null });
    }
    // Remote might expect the election directly or wrapped in data
    res.json(election);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active election' });
  }
};

const getElections = async (req, res) => {
  try {
    const elections = await electionRepository.findAll();
    res.json({
      success: true,
      elections: elections,
      data: elections // Backward compatibility with remote expectation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

const createElection = async (req, res) => {
  try {
    const data = { ...req.body };

    // Map frontend 'start_date' to model 'start_time'
    if (data.start_date && !data.start_time) {
      data.start_time = data.start_date;
    }
    // Map frontend 'end_date' to model 'end_time'
    if (data.end_date && !data.end_time) {
      data.end_time = data.end_date;
    }

    // Default constituency if missing (frontend form doesn't have it yet)
    if (!data.constituency) {
      data.constituency = 'National';
    }

    const election = await electionRepository.create(data);
    res.status(201).json({ success: true, election });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ error: 'Failed to create election', message: error.message });
  }
};

const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await electionRepository.deleteById(id);
    if (!election) {
      return res.status(404).json({ success: false, error: 'Election not found in MongoDB' });
    }
    res.json({ success: true, message: 'Election deleted from synchronized ledger' });
  } catch (error) {
    console.error('DELETE_ELECTION_ERROR:', error);
    res.status(500).json({ success: false, error: 'Failed to delete election' });
  }
};

const updateElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const election = await electionRepository.updateStatus(id, status);
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update election status' });
  }
};

const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await electionRepository.findById(id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Also fetch candidates for this election
    const Candidate = require('../models/Candidate');
    const candidates = await Candidate.find({ election_id: id });

    res.json({
      success: true,
      election: {
        ...election.toObject(),
        id: election._id,
        candidates: candidates.map(c => ({
          ...c.toObject(),
          id: c._id
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch election' });
  }
};

const updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Map dates
    if (data.start_date && !data.start_time) data.start_time = data.start_date;
    if (data.end_date && !data.end_time) data.end_time = data.end_date;

    const election = await electionRepository.update(id, data);
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update election' });
  }
};

const getElectionResults = async (req, res) => {
  try {
    const { id } = req.params;
    const Election = require('../models/Election');
    const Vote = require('../models/Vote');
    const Candidate = require('../models/Candidate');

    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ success: false, error: 'Election not found' });

    // Aggregate real votes from MongoDB
    const voteCounts = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$candidateId', count: { $sum: 1 } } }
    ]);

    const candidates = await Candidate.find({ election_id: id });

    const results = candidates.map(c => {
      const voteData = voteCounts.find(v => v._id.toString() === c._id.toString());
      return {
        candidateId: c._id,
        candidateName: c.name,
        party: c.party_name || 'Independent',
        votes: voteData ? voteData.count : 0
      };
    });

    res.json({
      success: true,
      election,
      totalVotes: results.reduce((sum, r) => sum + r.votes, 0),
      results: results.sort((a, b) => b.votes - a.votes)
    });
  } catch (error) {
    console.error('Results Extraction Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const getDashboardStats = async (req, res) => {
  try {
    // Check DB connection status
    if (mongoose.connection.readyState !== 1) {
      console.warn('Dashboard Stats: DB not ready, current state:', mongoose.connection.readyState);
      // Return partial or mock data if DB is connecting to keep UI responsive
      return res.json({
        success: true,
        stats: { totalCandidates: 0, totalVotes: 0, activeElections: 0, openIssues: 0 },
        recentIssues: [],
        activeElections: [],
        message: 'Database connecting...'
      });
    }

    const Candidate = require('../models/Candidate');
    const Vote = require('../models/Vote');
    const Issue = require('../models/Issue');
    const Election = require('../models/Election');

    // Add a timeout to the overall stats gathering
    const statsPromise = Promise.all([
      Candidate.countDocuments(),
      Vote.countDocuments(),
      Election.countDocuments({ status: 'ACTIVE' }),
      Issue.countDocuments(),
      Issue.find().sort({ createdAt: -1 }).limit(5),
      Election.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(5),
    ]);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Dashboard Stats Timeout')), 5000)
    );

    const [
      totalCandidates,
      totalVotes,
      activeElectionsCount,
      openIssuesCount,
      recentIssues,
      activeElectionsList,
    ] = await Promise.race([statsPromise, timeoutPromise]);

    res.json({
      success: true,
      stats: {
        totalCandidates,
        totalVotes,
        activeElections: activeElectionsCount,
        openIssues: openIssuesCount,
      },
      recentIssues,
      activeElections: activeElectionsList,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(200).json({
      success: true,
      stats: { totalCandidates: 0, totalVotes: 0, activeElections: 0, openIssues: 0 },
      error: 'Data retrieval partially failed'
    });
  }
};


module.exports = {
  getActiveElection,
  getElections,
  createElection,
  updateElectionStatus,
  getElectionById,
  updateElection,
  deleteElection,
  getElectionResults,
  getDashboardStats
};
