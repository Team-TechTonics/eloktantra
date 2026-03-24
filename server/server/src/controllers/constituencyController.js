const Constituency = require('../models/Constituency');

const getConstituencies = async (req, res) => {
  try {
    const { electionId } = req.query;
    const query = electionId ? { electionId } : {};
    const constituencies = await Constituency.find(query).sort({ name: 1 });
    res.json({ 
      success: true, 
      constituencies, 
      data: constituencies 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

const createConstituency = async (req, res) => {
  try {
    const constituency = new Constituency(req.body);
    await constituency.save();
    res.status(201).json({ success: true, data: constituency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateConstituency = async (req, res) => {
  try {
    const constituency = await Constituency.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: constituency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteConstituency = async (req, res) => {
  try {
    await Constituency.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Constituency deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getConstituencies,
  createConstituency,
  updateConstituency,
  deleteConstituency
};
