const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const asyncHandler = require('../middleware/asyncHandler');

// ==================== WARDS ====================

// @desc    Get all wards
// @route   GET /api/wards
// @access  Private (staff, admin, doctor)
exports.getWards = asyncHandler(async (req, res) => {
    const wards = await Ward.find().sort({ wardNumber: 1 });

    res.json({
        success: true,
        count: wards.length,
        data: wards
    });
});

// @desc    Create new ward
// @route   POST /api/wards
// @access  Private (admin only)
exports.createWard = asyncHandler(async (req, res) => {
    const ward = await Ward.create(req.body);

    res.status(201).json({ success: true, data: ward });
});

// ==================== BEDS ====================

// @desc    Get beds by ward
// @route   GET /api/beds/ward/:wardId
// @access  Private
exports.getBedsByWard = asyncHandler(async (req, res) => {
    const beds = await Bed.find({ wardId: req.params.wardId })
        .populate('currentPatientId', 'name age patientId phone');

    res.json({
        success: true,
        count: beds.length,
        data: beds
    });
});

// @desc    Add new bed to ward
// @route   POST /api/beds
// @access  Private (admin or staff)
exports.createBed = asyncHandler(async (req, res) => {
    const bed = await Bed.create(req.body);

    res.status(201).json({ success: true, data: bed });
});

// @desc    Assign/Unassign bed to/from patient
// @route   PUT /api/beds/:id/assign
// @access  Private (admin, doctor, or staff)
exports.assignBed = asyncHandler(async (req, res) => {
    const { patientId } = req.body;
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
        return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    // Previous patient ID (if unassigning)
    const prevPatientId = bed.currentPatientId;

    // Update Bed Details
    bed.status = patientId ? 'Occupied' : 'Cleaning'; // Trigger cleaning after discharge
    bed.currentPatientId = patientId || null;
    await bed.save();

    // Update Patient status and bed reference
    if (patientId) {
        await Patient.findByIdAndUpdate(patientId, { 
            currentBed: bed._id, 
            status: 'Admitted',
            admissionDate: Date.now()
        });
    } else if (prevPatientId) {
        // Discharging current patient
        await Patient.findByIdAndUpdate(prevPatientId, { 
            currentBed: null, 
            status: 'Discharged',
            dischargeDate: Date.now()
        });
    }

    res.json({ success: true, data: bed });
});
