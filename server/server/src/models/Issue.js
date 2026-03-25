const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['PENDING', 'RESOLVED', 'REJECTED'],
    default: 'PENDING'
  },
  reportedBy: {
    type: String, // Voter ID or User Ref
    default: 'Verified User'
  },
  reportedCount: {
    type: Number,
    default: 1
  },
  electionId: {
    type: String,
    required: true
  },
  constituencyId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Issue', issueSchema);
