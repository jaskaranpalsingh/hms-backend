const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const cleanUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const emailToDelete = 'karan@gmail.com';
        const result = await User.deleteOne({ email: emailToDelete });
        console.log(`--- DB Cleanup report for ${emailToDelete} ---`);
        console.log(result.deletedCount > 0 ? '✅ User successfully removed' : '❌ User not found');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanUser();
