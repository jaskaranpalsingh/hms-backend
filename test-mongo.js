const mongoose = require('mongoose');

console.log("Attempting to connect to MongoDB...");
mongoose.connect('mongodb://127.0.0.1:27017/hospital-db', {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log("Success!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Failed:", err.message);
        process.exit(1);
    });
