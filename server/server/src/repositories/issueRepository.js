const Issue = require('../models/Issue');

class IssueRepository {
  async findAll(params = {}) {
    const filter = {};
    if (params.electionId) filter.electionId = params.electionId;
    if (params.constituencyId) filter.constituencyId = params.constituencyId;
    if (params.status) filter.status = params.status;
    
    return await Issue.find(filter).sort({ createdAt: -1 });
  }

  async create(data) {
    return await Issue.create(data);
  }

  async findById(id) {
    return await Issue.findById(id);
  }

  async updateStatus(id, status) {
    return await Issue.findByIdAndUpdate(id, { status }, { new: true });
  }

  async deleteById(id) {
    return await Issue.findByIdAndDelete(id);
  }
}

module.exports = new IssueRepository();
