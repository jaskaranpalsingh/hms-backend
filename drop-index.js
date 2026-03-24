const mongoose = require('mongoose');
require('dotenv').config();

const dropBrokenIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.collection('doctors');
        
        // Check if index exists
        const indices = await collection.indexes();
        console.log('Current indices:', indices.map(i => i.name));
        
        if (indices.some(i => i.name === 'email_1')) {
            await collection.dropIndex('email_1');
            console.log('✅ Successfully dropped legacy [email_1] index from doctors collection');
        } else {
            console.log('ℹ️ Index [email_1] not found');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error dropping index:', err);
        process.exit(1);
    }
};

dropBrokenIndex();
