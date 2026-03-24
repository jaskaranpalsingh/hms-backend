const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Bed = require('../models/Bed');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private (admin, doctor, staff)
exports.getDashboard = asyncHandler(async (req, res) => {
    // 👤 Basic counts
    const totalPatients = await Patient.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ status: 'Active' });
    const totalAppointments = await Appointment.countDocuments();

    // 💳 Revenue tracking (Aggregate total paid amounts)
    const invoices = await Invoice.find({ paymentStatus: 'Paid' });
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);

    // 🛏️ Bed availability mapping
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    // 🚦 Hospital Traffic (Distribution by Treatment Type)
    const trafficStats = await Patient.aggregate([
        { $group: { _id: '$treatmentType', count: { $sum: 1 } } }
    ]);

    const distribution = { Outpatient: 0, Inpatient: 0, Emergency: 0 };
    trafficStats.forEach(stat => {
        if (distribution.hasOwnProperty(stat._id)) {
            distribution[stat._id] = stat.count;
        }
    });

    const totalTraffic = Object.values(distribution).reduce((a, b) => a + b, 0);
    const trafficDistribution = Object.keys(distribution).map(key => ({
        label: key,
        value: totalTraffic > 0 ? Math.round((distribution[key] / totalTraffic) * 100) : 0
    }));

    // 🔔 Recent activity
    const recentPatients = await Patient.find()
        .sort({ createdAt: -1 })
        .limit(5);

    // 📅 Today's appointments
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.find({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'Cancelled' }
    })
    .populate('doctorId', 'name specialization')
    .populate('patientId', 'name patientId')
    .sort({ timeSlot: 1 });

    // 📈 Chart Data Setup
    res.json({
        success: true,
        data: {
            stats: {
                totalPatients,
                activeDoctors,
                totalAppointments, // ✅ NEW: All-time count
                totalRevenue,
                occupancyRate: Math.round(occupancyRate),
                todayCount: todayAppointments.length
            },
            trafficDistribution,
            recentPatients,
            todayAppointments,
            charts: {
                patientTraffic: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [45, 52, 38, 65, 48, 70]
                },
                revenueTrends: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [15000, 18200, 14500, 22000, 19800, 25600]
                }
            }
        }
    });
});
