const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Clinical Database...');

        const users = [
            { name: 'System Admin', email: 'admin@hospital.com', password: 'Admin@123', role: 'admin' },
            { name: 'Dr. John Smith', email: 'doctor@hospital.com', password: 'Doctor@123', role: 'doctor' },
            { name: 'Sarah Patient', email: 'patient@hospital.com', password: 'Patient@123', role: 'patient' },
            { name: 'Staff Member', email: 'staff@hospital.com', password: 'Staff@123', role: 'staff' }
        ];

        for (const u of users) {
           await User.deleteOne({ email: u.email });
           await User.create(u);
           console.log(`✅ ${u.role.toUpperCase()} Account Protocol: SUCCESS (${u.email})`);
        }

        console.log('\n--- SYSTEM READINESS PROTOCOL COMPLETE ---\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Protocol Failure:', err.message);
        process.exit(1);
    }
};

createTestUsers();
