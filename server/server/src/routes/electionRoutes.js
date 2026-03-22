const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');

router.get('/', electionController.getElections);
router.get('/active', electionController.getActiveElection);
router.post('/create', electionController.createElection);
router.patch('/:id/status', electionController.updateElectionStatus);
router.put('/:id', electionController.updateElection);
router.delete('/:id', electionController.deleteElection);
router.get('/:id', electionController.getElectionById);

module.exports = router;
