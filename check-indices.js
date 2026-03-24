const mongoose = require('mongoose');
require('dotenv').config();

const checkIndices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.collection('users');
        const indices = await collection.indexes();
        console.log('--- Current Indices on USERS collection ---');
        console.log(JSON.stringify(indices, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkIndices();
