const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/analyticsController');

router.get('/dashboard', getDashboard);

module.exports = router;
