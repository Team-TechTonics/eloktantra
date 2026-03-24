const express = require('express');
const router = express.Router();
const constituencyController = require('../controllers/constituencyController');

router.get('/', constituencyController.getConstituencies);
router.post('/', constituencyController.createConstituency);
router.put('/:id', constituencyController.updateConstituency);
router.delete('/:id', constituencyController.deleteConstituency);

module.exports = router;
