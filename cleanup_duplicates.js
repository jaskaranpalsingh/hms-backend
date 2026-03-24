const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification');
require('dotenv').config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('Connected to MongoDB for cleanup...');

    // Find all appointments for Rahul Sharma (assuming we know the patientId or just search by name via populate)
    // Actually, let's just find appointments with duplicate (patientId, doctorId, date, timeSlot)
    
    const appointments = await Appointment.find().sort({ createdAt: 1 });
    const seen = new Set();
    const toDelete = [];

    for (const app of appointments) {
      const key = `${app.patientId}_${app.doctorId}_${app.date.toISOString().split('T')[0]}_${app.timeSlot}`;
      if (seen.has(key)) {
        toDelete.push(app._id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicate appointments. Deleting...`);
      await Appointment.deleteMany({ _id: { $in: toDelete } });
      console.log('Cleanup successful!');
    } else {
      console.log('No duplicates found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
