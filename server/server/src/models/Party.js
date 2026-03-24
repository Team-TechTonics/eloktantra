const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true },
  logo_url: { type: String },
  color: { type: String },
  founding_year: { type: Number },
  headquarters: { type: String },
  president: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Party', PartySchema);
