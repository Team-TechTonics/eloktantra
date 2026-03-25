const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

router.get('/', issueController.getIssues);
router.post('/', issueController.createIssue);
router.patch('/:id/status', issueController.updateIssueStatus);
router.delete('/', issueController.deleteIssue);

module.exports = router;
