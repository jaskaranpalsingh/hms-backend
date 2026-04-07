const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Uploaded reports)
app.use('/uploads', express.static('uploads'));

// ==================== ROUTES ====================

// Test route
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: '🏥 Hospital Management System API is running!' });
});

// Auth
app.use('/api/auth', require('./routes/auth'));

// 📋 Analytics (MOVE ABOVE /api)
app.use('/api/analytics', require('./routes/analytics'));

// 🔔 Notifications (MOVE ABOVE /api)
app.use('/api/notifications', require('./routes/notifications'));

// 💬 Messages (MOVE ABOVE /api)
app.use('/api/messages', require('./routes/messages'));

// 🏥 Core API (Patients, Doctors, Appointments)
app.use('/api', require('./routes/api'));

// 📄 Medical Records & Lab Reports
app.use('/api', require('./routes/records'));

// 🏥 Facilities (Wards & Beds)
app.use('/api', require('./routes/facilities'));

// ⚙️ Admin (Invoices, Staff, Inventory)
app.use('/api', require('./routes/admin'));

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev, restrict in production
        methods: ["GET", "POST"]
    }
});

// Store io on app to access it in controllers
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join', (userId) => {
        if (userId) {
            socket.join(String(userId));
            console.log(`👤 User [${userId}] joined room via socket [${socket.id}]`);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content, attachment = null }) => {
        const Message = require('./models/Message');
        try {
            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                content,
                attachment
            });
            const savedMessage = await newMessage.save();
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('sender', 'name role profileImage')
                .populate('receiver', 'name role profileImage');

            // Send to receiver's room
            io.to(String(receiverId)).emit('new_message', populatedMessage);
            // Send back to sender's room (to sync other devices)
            io.to(String(senderId)).emit('new_message', populatedMessage);
            
            console.log(`📡 Socket message synced: ${senderId} -> ${receiverId}`);
        } catch (err) {
            console.error('❌ Socket sendMessage error:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected');
    });
});

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api/test`);
        console.log(`🔌 Socket.io initialized`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use!`);
            console.error(`👉 Fix: Run this command to free it:`);
            console.error(`   netstat -ano | findstr :${PORT}   (then taskkill /PID <number> /F)\n`);
            process.exit(1);
        } else {
            throw err;
        }
    });
};

startServer();
