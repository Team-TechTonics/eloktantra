const Party = require('../models/Party');

const getParties = async (req, res) => {
  try {
    const parties = await Party.find({}).sort({ name: 1 });
    res.json({ success: true, parties, data: parties });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

const createParty = async (req, res) => {
  try {
    const party = new Party(req.body);
    await party.save();
    res.status(201).json({ success: true, data: party });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteParty = async (req, res) => {
  try {
    const { id } = req.query; // Admin portal uses query param
    await Party.findByIdAndDelete(id);
    res.json({ success: true, message: 'Party deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getParties,
  createParty,
  deleteParty
};
