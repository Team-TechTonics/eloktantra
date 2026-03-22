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

const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    await electionRepository.deleteById(id);
    res.json({ success: true, message: 'Election deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete election' });
  }
};

module.exports = {
  getActiveElection,
  getElections,
  createElection,
  updateElectionStatus,
  getElectionById,
  updateElection,
  deleteElection
};
