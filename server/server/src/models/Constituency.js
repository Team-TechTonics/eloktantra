const mongoose = require('mongoose');

const ConstituencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  electionId: { type: String },
  state: { type: String, required: true },
  constituency_number: { type: Number },
  regionCode: { type: String },
  type: { type: String, enum: ['General', 'SC', 'ST'], default: 'General' },
  total_voters: { type: Number, default: 0 },
  district: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Constituency', ConstituencySchema);
