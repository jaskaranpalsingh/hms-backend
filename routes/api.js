const express = require('express');
const router = express.Router();
const { getPatients, getPatient, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes below require authentication
router.use(protect);

// Patient routes — any authenticated user can view, admin/doctor/staff can modify
router.route('/patients')
    .get(getPatients)
    .post(authorize('admin', 'doctor', 'staff'), createPatient);
router.route('/patients/:id')
    .get(getPatient)
    .put(authorize('admin', 'doctor', 'staff'), updatePatient)
    .delete(authorize('admin', 'doctor', 'staff'), deletePatient);

// Vitals
router.post('/patients/:id/vitals', authorize('admin', 'doctor', 'staff'), require('../controllers/patientController').addVitals);

// Doctor routes — any authenticated user can view, only admin can modify
router.route('/doctors')
    .get(getDoctors)
    .post(authorize('admin'), createDoctor);
router.route('/doctors/:id')
    .get(getDoctor)
    .put(authorize('admin'), updateDoctor)
    .delete(authorize('admin'), deleteDoctor);

// Appointment routes — any authenticated user can view/create, admin/doctor/patient can modify (cancel)
router.route('/appointments')
    .get(getAppointments)
    .post(createAppointment);
router.route('/appointments/:id')
    .put(authorize('admin', 'doctor', 'patient', 'staff'), updateAppointment)
    .delete(authorize('admin'), deleteAppointment);

module.exports = router;
