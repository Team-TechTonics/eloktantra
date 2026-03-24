const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');

router.get('/', partyController.getParties);
router.post('/', partyController.createParty);
router.delete('/', partyController.deleteParty);

module.exports = router;
