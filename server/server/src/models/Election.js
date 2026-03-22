const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  constituency: { type: String, required: false, default: 'National' },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  status: { type: String, enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'ENDED'], default: 'UPCOMING' },
  contract_address: { type: String },
  total_votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', ElectionSchema);
