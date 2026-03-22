const Election = require('../models/Election');

const getActiveElection = async () => {
  return Election.findOne({ status: 'ACTIVE' }).sort({ createdAt: -1 });
};

const findAll = async (query = {}) => {
  return Election.find(query).sort({ createdAt: -1 });
};

const create = async (data) => {
  const election = new Election(data);
  return election.save();
};

const updateStatus = async (id, status) => {
  return Election.findByIdAndUpdate(id, { status }, { new: true });
};

const update = async (id, data) => {
  return Election.findByIdAndUpdate(id, data, { new: true });
};

const deleteById = async (id) => {
  return Election.findByIdAndDelete(id);
};

const findById = async (id) => {
  return Election.findById(id);
};

module.exports = {
  getActiveElection,
  findAll,
  create,
  update,
  deleteById,
  findById
};
