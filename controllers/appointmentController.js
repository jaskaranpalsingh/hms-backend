const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = asyncHandler(async (req, res) => {
    const query = {};
    if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (doctor) query.doctorId = doctor._id;
    } else if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.id });
        if (patient) query.patientId = patient._id;
    }

    if (req.query.date && !isNaN(new Date(req.query.date).getTime())) {
        const queryDate = new Date(req.query.date);
        query.date = { 
            $gte: new Date(new Date(queryDate).setHours(0, 0, 0, 0)),
            $lt: new Date(new Date(queryDate).setHours(23, 59, 59, 999)) 
        };
    }

    if (req.query.status) query.status = req.query.status;

    const appointments = await Appointment.find(query)
        .populate('patientId', 'name age gender patientId phone')
        .populate('doctorId', 'name specialization phone')
        .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = asyncHandler(async (req, res) => {
    const lastAppointment = await Appointment.findOne().sort({ id: -1 });
    const nextId = lastAppointment ? lastAppointment.id + 1 : 101;

    const appointmentData = { ...req.body, id: nextId };
    
    if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.id });
        if (patient) appointmentData.patientId = patient._id;
    }

    // --- 🛡️ De-duplication Guard ---
    // Prevent duplicate bookings (same patient, doctor, date, and timeslot)
    const existing = await Appointment.findOne({
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        timeSlot: appointmentData.timeSlot,
        status: { $ne: 'Cancelled' }
    });

    if (existing) {
        return res.status(400).json({ 
            success: false, 
            message: 'This exact appointment slot is already registered in the system.' 
        });
    }

    const appointment = await Appointment.create(appointmentData);

    // --- ✨ Automatic Notifications ---
    // Fetch doctor's user ID for notification
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
        await Notification.create({
            userId: doctor.userId,
            title: 'New Appointment Booked',
            message: `You have a new appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
            type: 'System'
        });
    }

    res.status(201).json({ success: true, data: appointment });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    await appointment.deleteOne();
    res.json({ success: true, message: 'Appointment removed' });
});
