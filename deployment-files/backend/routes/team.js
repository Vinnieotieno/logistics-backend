// server/routes/team.js
const router = require('express').Router();
const { auth } = require('../middleware/auth');
const teamController = require('../controllers/teamController');

// Only keep the GET /members route for staff
router.get('/members', auth, teamController.getTeamMembers);

module.exports = router;