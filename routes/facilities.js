const express = require('express');
const router = express.Router();
const { getWards, createWard, getBedsByWard, createBed, assignBed } = require('../controllers/facilitiesController');

// Wards
router.route('/wards').get(getWards).post(createWard);

// Beds
router.get('/beds/ward/:wardId', getBedsByWard);
router.post('/beds', createBed);
router.put('/beds/:id/assign', assignBed);

module.exports = router;
