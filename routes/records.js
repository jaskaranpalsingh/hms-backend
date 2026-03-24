const express = require('express');
const router = express.Router();
const { 
    getPatientRecords, getRecords, createRecord, getRecord, updateRecord, 
    getLabReports, createLabReport, updateLabReport 
} = require('../controllers/recordsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// All records routes are protected
router.use(protect);

// Medical Records
router.get('/medical-records', getRecords);
router.get('/medical-records/patient/:patientId', getPatientRecords);
router.get('/medical-records/:id', getRecord);

// Add and Update record support file uploads
router.post('/medical-records', 
    authorize('admin', 'doctor'), 
    upload.single('report'), 
    createRecord
);

router.put('/medical-records/:id', 
    authorize('admin', 'doctor'), 
    upload.single('report'), 
    updateRecord
);

// Lab Reports
router.route('/lab-reports').get(getLabReports).post(authorize('admin', 'doctor', 'staff'), createLabReport);
router.put('/lab-reports/:id', authorize('admin', 'doctor', 'staff'), updateLabReport);

module.exports = router;
