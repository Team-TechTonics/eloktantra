const issueRepository = require('../repositories/issueRepository');

const getIssues = async (req, res) => {
  try {
    const { electionId, constituencyId, status } = req.query;
    const issues = await issueRepository.findAll({ electionId, constituencyId, status });
    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

const createIssue = async (req, res) => {
  try {
    const issue = await issueRepository.create(req.body);
    res.status(201).json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const issue = await issueRepository.updateStatus(id, status);
    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue status' });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.query; // Matches Admin Portal current behavior
    const targetId = id || req.params.id;
    await issueRepository.deleteById(targetId);
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete issue' });
  }
};

module.exports = {
  getIssues,
  createIssue,
  updateIssueStatus,
  deleteIssue
};
